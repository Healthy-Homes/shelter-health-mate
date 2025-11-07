// src/services/export/FHIRMappingService.ts
// Converts health assessment data to FHIR R4 format

import { 
  FHIRBundle, 
  FHIRObservation, 
  FHIRDiagnosticReport, 
  FHIRPatient,
  AssessmentResults,
  ResponseMap,
  ChecklistItem
} from '../../types/export/fhirTypes';
import { mapQuestionToClinicalCode, FHIR_CATEGORIES, CLINICAL_CODES } from '../../constants/clinicalMappings';
import { EncryptionService } from '../security/EncryptionService';
import { IssueIdentificationService } from '../assessment/IssueIdentificationService';

export class FHIRMappingService {
  private static readonly SYSTEM_BASE_URL = 'https://shelter-health-assessment.org/fhir';

  // Enhanced SDOH Clinical Codes with both LOINC and SNOMED
  private static readonly SDOH_CLINICAL_CODES: { [key: string]: any } = {
    'SDOH_1': {
      loinc: '88122-7',
      snomed: '733423003',
      display: 'Food insecurity risk'
    },
    'SDOH_2': {
      loinc: '88123-5', 
      snomed: '733423003',
      display: 'Food ran out'
    },
    'SDOH_3': {
      loinc: '71802-3',
      snomed: '32911000',
      display: 'Housing instability'
    },
    'SDOH_4': {
      loinc: '93030-5',
      snomed: '160693006',
      display: 'Transportation insecurity'
    },
    'SDOH_5': {
      loinc: '93159-2',
      snomed: '105529008',
      display: 'Social isolation'
    },
    'SDOH_6': {
      loinc: '76513-1',
      snomed: '73595000',
      display: 'Stress level'
    },
    'SDOH_7': {
      loinc: '93038-8',
      snomed: '224838001',
      display: 'Home safety'
    },
    'SDOH_8': {
      loinc: '93038-8',
      snomed: '224838001', 
      display: 'Neighborhood safety'
    }
  };

  /**
   * Creates FHIR Bundle - method expected by ExportModal
   */
  static createFHIRBundle(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): FHIRBundle {
    // Use the existing mapAssessmentToFHIR method with default parameters
    return this.mapAssessmentToFHIR(
      responses,
      questions,
      results,
      'anonymous-patient',
      'en'
    );
  }

  /**
   * Main method to convert assessment data to FHIR Bundle
   */
  static mapAssessmentToFHIR(
    responses: ResponseMap,
    questions: ChecklistItem[],
    results: AssessmentResults,
    patientId: string = 'patient-001',
    language: string = 'en'
  ): FHIRBundle {
    
    const bundleId = EncryptionService.generateSecureId('bundle');
    const timestamp = new Date().toISOString();

    // Create patient resource
    const patient = this.createPatientResource(patientId, language);

    // Create observations for each answered question
    const observations = questions
      .filter(question => responses[question.item_id])
      .map(question => this.createObservation(
        question, 
        responses[question.item_id], 
        patientId,
        timestamp,
        questions,
        responses
      ));

    // Create diagnostic report summarizing results
    const diagnosticReport = this.createDiagnosticReport(
      results,
      patientId,
      timestamp,
      observations.map(obs => obs.id)
    );

    // Create FHIR Bundle
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp: timestamp,
      total: observations.length + 2, // observations + diagnostic report + patient
      entry: [
        { resource: patient },
        { resource: diagnosticReport },
        ...observations.map(obs => ({ resource: obs }))
      ]
    };

    return bundle;
  }

  /**
   * Creates a FHIR Patient resource
   */
  private static createPatientResource(patientId: string, language: string): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{
        system: `${this.SYSTEM_BASE_URL}/patient-id`,
        value: patientId
      }],
      communication: [{
        language: {
          coding: [{
            system: 'urn:ietf:bcp:47',
            code: language === 'zh' ? 'zh-TW' : 'en-US',
            display: language === 'zh' ? 'Traditional Chinese' : 'English'
          }]
        },
        preferred: true
      }]
    };
  }

  /**
   * Creates a FHIR Observation for a single assessment question
   */
  private static createObservation(
    question: ChecklistItem,
    response: string,
    patientId: string,
    timestamp: string,
    allQuestions: ChecklistItem[],
    allResponses: ResponseMap
  ): FHIRObservation {
    
    const observationId = EncryptionService.generateSecureId('obs');

    // Determine observation category based on question type
    const category = this.getObservationCategory(question);

    // Get clinical codes - enhanced for SDOH
    const clinicalCodes = this.getClinicalCodes(question);

    // Map response to appropriate FHIR value
    const valueMapping = this.mapResponseToFHIRValue(question, response);

    // Build coding array with both LOINC and SNOMED when available
    const coding = [];
    if (clinicalCodes.loinc) {
      coding.push({
        system: 'http://loinc.org',
        code: clinicalCodes.loinc,
        display: clinicalCodes.display
      });
    }
    if (clinicalCodes.snomed) {
      coding.push({
        system: 'http://snomed.info/sct',
        code: clinicalCodes.snomed,
        display: clinicalCodes.display
      });
    }
    if (coding.length === 0) {
      // Fallback if no standard codes
      coding.push({
        system: `${this.SYSTEM_BASE_URL}/codes`,
        code: question.item_id,
        display: question.question_text
      });
    }

    const observation: FHIRObservation = {
      resourceType: 'Observation',
      id: observationId,
      status: 'final',
      category: [category],
      code: {
        coding: coding,
        text: question.question_text
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      ...valueMapping
    };

    // Add proper interpretation based on whether this is an issue
    const interpretation = this.getInterpretation(question, response, allQuestions, allResponses);
    if (interpretation) {
      observation.interpretation = [interpretation];
    }

    // Add notes for explanation if available
    if (question.explanation) {
      observation.note = [{
        text: question.explanation
      }];
    }

    return observation;
  }

  /**
   * Get clinical codes for a question, with special handling for SDOH
   */
  private static getClinicalCodes(question: ChecklistItem) {
    // Check if it's an SDOH question
    if (question.item_id.startsWith('SDOH_')) {
      return this.SDOH_CLINICAL_CODES[question.item_id] || mapQuestionToClinicalCode(question.item_id);
    }
    
    // Use standard mapping for other questions
    return mapQuestionToClinicalCode(question.item_id);
  }

  /**
   * Determine proper interpretation based on issue identification
   */
  private static getInterpretation(
    question: ChecklistItem, 
    response: string,
    allQuestions: ChecklistItem[],
    allResponses: ResponseMap
  ) {
    // Use IssueIdentificationService to determine if this is an issue
    const issues = IssueIdentificationService.identifyIssues(allQuestions, allResponses);
    const isIssue = issues.some(issue => issue.item_id === question.item_id);

    if (isIssue) {
      // Find the specific issue to get its severity
      const issue = issues.find(i => i.item_id === question.item_id);
      if (issue) {
        // Map category to interpretation code
        let code, display;
        if (issue.category === 'critical') {
          code = 'HH';
          display = 'Critical high';
        } else if (issue.category === 'high') {
          code = 'H';
          display = 'High';
        } else if (issue.category === 'moderate') {
          code = 'A';
          display = 'Abnormal';
        } else {
          code = 'L';
          display = 'Low';
        }

        return {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: code,
            display: display
          }]
        };
      }
    }

    // Not an issue - normal
    return {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: 'N',
        display: 'Normal'
      }]
    };
  }

  /**
   * Maps assessment response to appropriate FHIR value type
   */
  private static mapResponseToFHIRValue(question: ChecklistItem, response: string) {
    // For binary responses (yes/no)
    if (question.response_type === 'binary') {
      if (['yes', 'no'].includes(response.toLowerCase())) {
        return {
          valueBoolean: response.toLowerCase() === 'yes'
        };
      }
    }

    // For multiple choice responses
    if (Array.isArray(question.response_options)) {
      const option = question.response_options.find(opt => opt.value === response);
      if (option) {
        return {
          valueCodeableConcept: {
            coding: [{
              system: `${this.SYSTEM_BASE_URL}/responses`,
              code: response,
              display: option.label
            }],
            text: option.label
          }
        };
      }
    }

    // For SDOH specific responses that don't match options
    if (question.item_id.startsWith('SDOH_')) {
      return {
        valueCodeableConcept: {
          coding: [{
            system: `${this.SYSTEM_BASE_URL}/responses`,
            code: response,
            display: this.getSDOHResponseDisplay(response)
          }],
          text: this.getSDOHResponseDisplay(response)
        }
      };
    }

    // Fallback to string value
    return {
      valueString: response
    };
  }

  /**
   * Get display text for SDOH responses
   */
  private static getSDOHResponseDisplay(response: string): string {
    const displayMap: { [key: string]: string } = {
      'often_true': 'Often true',
      'sometimes_true': 'Sometimes true',
      'never_true': 'Never true',
      'transitional': 'I do not have housing (staying with others, in a shelter, etc.)',
      'temporary': 'I have housing but am worried about losing it',
      'own': 'I have stable housing',
      'less_than_once_week': 'Less than once a week',
      '1_2_times_week': '1 or 2 times a week',
      '3_5_times_week': '3 to 5 times a week',
      '5_or_more_times_week': '5 or more times a week',
      'not_at_all': 'Not at all',
      'a_little_bit': 'A little bit',
      'somewhat': 'Somewhat',
      'quite_a_bit': 'Quite a bit',
      'very_much': 'Very much',
      'yes': 'Yes',
      'no': 'No'
    };
    return displayMap[response] || response;
  }

  /**
   * Determines observation category based on question content
   */
  private static getObservationCategory(question: ChecklistItem) {
    if (question.category === 'sdoh' || question.item_id.startsWith('SDOH_')) {
      return FHIR_CATEGORIES.social_history;
    } else if (question.category === 'elder_safety' || question.item_id.startsWith('ELDER_')) {
      return FHIR_CATEGORIES.functional_status;
    } else {
      return FHIR_CATEGORIES.safety;
    }
  }

  /**
   * Creates a FHIR DiagnosticReport summarizing the assessment
   */
  private static createDiagnosticReport(
    results: AssessmentResults,
    patientId: string,
    timestamp: string,
    observationIds: string[]
  ): FHIRDiagnosticReport {
    
    const reportId = EncryptionService.generateSecureId('report');

    return {
      resourceType: 'DiagnosticReport',
      id: reportId,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: 'OTH',
          display: 'Other'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '72133-2',
          display: 'Home safety assessment'
        }],
        text: 'Comprehensive Home Health Assessment'
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      issued: timestamp,
      result: observationIds.map(id => ({
        reference: `Observation/${id}`
      })),
      conclusion: this.generateAssessmentConclusion(results),
      conclusionCode: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: this.mapRiskLevelToSNOMED(results.risk_level),
          display: `${results.risk_level} risk level`
        }]
      }]
    };
  }

  /**
   * Generates human-readable conclusion text
   */
  private static generateAssessmentConclusion(results: AssessmentResults): string {
    const riskDescription = results.risk_level.toLowerCase();
    const interventionCount = results.priority_interventions.length;
    
    let conclusion = `Health assessment completed with overall ${riskDescription} risk level (score: ${results.risk_score}/100). `;
    
    if (interventionCount > 0) {
      conclusion += `${interventionCount} priority intervention${interventionCount > 1 ? 's' : ''} identified. `;
    }

    if (results.questions_with_issues > 0) {
      conclusion += `${results.questions_with_issues} areas identified as needing attention.`;
    } else {
      conclusion += `No significant concerns identified in assessed areas.`;
    }

    return conclusion;
  }

  /**
   * Maps risk level to SNOMED CT codes
   */
  private static mapRiskLevelToSNOMED(riskLevel: string): string {
    const riskCodes = CLINICAL_CODES.risk_categories;
    
    switch (riskLevel.toLowerCase()) {
      case 'low': return riskCodes.low.snomed;
      case 'moderate': return riskCodes.moderate.snomed;
      case 'high': return riskCodes.high.snomed;
      case 'critical': return riskCodes.critical.snomed;
      default: return riskCodes.moderate.snomed;
    }
  }

  /**
   * Validates FHIR Bundle structure
   */
  static validateBundle(bundle: FHIRBundle): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bundle.resourceType || bundle.resourceType !== 'Bundle') {
      errors.push('Invalid resourceType: must be Bundle');
    }

    if (!bundle.id) {
      errors.push('Bundle must have an id');
    }

    if (!bundle.entry || bundle.entry.length === 0) {
      errors.push('Bundle must contain at least one entry');
    }

    // Validate each resource in the bundle
    bundle.entry?.forEach((entry, index) => {
      if (!entry.resource) {
        errors.push(`Entry ${index} missing resource`);
      } else if (!entry.resource.resourceType) {
        errors.push(`Entry ${index} resource missing resourceType`);
      } else if (!entry.resource.id) {
        errors.push(`Entry ${index} resource missing id`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exports bundle as JSON string with formatting
   */
  static exportBundleAsJSON(bundle: FHIRBundle, prettyPrint: boolean = true): string {
    if (prettyPrint) {
      return JSON.stringify(bundle, null, 2);
    }
    return JSON.stringify(bundle);
  }
}
