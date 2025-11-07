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
import { 
  mapQuestionToClinicalCode, 
  FHIR_CATEGORIES, 
  CLINICAL_CODES,
  HOUSING_HAZARD_MAPPINGS,
  ENHANCED_SDOH_MAPPINGS 
} from '../../constants/clinicalMappings';
import { EncryptionService } from '../security/EncryptionService';
import { IssueIdentificationService } from '../assessment/IssueIdentificationService';

export class FHIRMappingService {
  private static readonly SYSTEM_BASE_URL = 'https://shelter-health-assessment.org/fhir';

  /**
   * Creates FHIR Bundle - method expected by ExportModal
   */
  static createFHIRBundle(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): FHIRBundle {
    return this.mapAssessmentToFHIR(
      responses,
      questions,
      results,
      'anonymous-patient',
      'en'
    );
  }
/**
 * Creates filtered FHIR Bundle - only includes clinically mapped items
 * This implements Option 2: Filter to only export clinically relevant data
 */
static createFilteredFHIRBundle(
  results: AssessmentResults,
  responses: ResponseMap,
  questions: ChecklistItem[]
): FHIRBundle {
  // Filter to only questions with valid clinical mappings
  const clinicallyMappedQuestions = questions.filter(question => {
    const clinicalCodes = mapQuestionToClinicalCode(question.item_id);
    
    // Include if it has LOINC, SNOMED, or ICD-10 codes
    // Exclude if it only has the fallback generic code
    return (clinicalCodes.loinc || 
            clinicalCodes.snomed || 
            clinicalCodes.icd10) &&
            clinicalCodes.snomed !== '418799008'; // Exclude generic "Finding" code
  });

  console.log(`Filtering FHIR export: ${clinicallyMappedQuestions.length} of ${questions.length} questions have clinical codes`);

  // Use the standard method with filtered questions
  return this.mapAssessmentToFHIR(
    responses,
    clinicallyMappedQuestions, // Only clinically mapped questions
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
    const category = this.getObservationCategory(question);
    
    // Get comprehensive clinical codes
    const clinicalCodes = mapQuestionToClinicalCode(question.item_id);
    
    // Build coding array with all available codes
    const coding = [];
    
    // Add LOINC code
    if (clinicalCodes.loinc) {
      coding.push({
        system: 'http://loinc.org',
        code: clinicalCodes.loinc,
        display: clinicalCodes.display || question.question_text
      });
    }
    
    // Add SNOMED code
    if (clinicalCodes.snomed) {
      coding.push({
        system: 'http://snomed.info/sct',
        code: clinicalCodes.snomed,
        display: clinicalCodes.display || question.question_text
      });
    }
    
    // Add alternative SNOMED if available
    if (clinicalCodes.altSnomed) {
      coding.push({
        system: 'http://snomed.info/sct',
        code: clinicalCodes.altSnomed,
        display: clinicalCodes.display || question.question_text
      });
    }
    
    // Add ICD-10 if available
    if (clinicalCodes.icd10) {
      coding.push({
        system: 'http://hl7.org/fhir/sid/icd-10',
        code: clinicalCodes.icd10,
        display: clinicalCodes.display || question.question_text
      });
    }
    
    // Fallback if no standard codes
    if (coding.length === 0) {
      coding.push({
        system: `${this.SYSTEM_BASE_URL}/codes`,
        code: question.item_id,
        display: question.question_text
      });
    }

    // Map response to appropriate FHIR value
    const valueMapping = this.mapResponseToFHIRValue(question, response, clinicalCodes);

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

    // Add interpretation based on issue identification
    const interpretation = this.getInterpretation(question, response, allQuestions, allResponses);
    if (interpretation) {
      observation.interpretation = [interpretation];
    }

    // Add notes
    if (question.explanation) {
      observation.note = [{
        text: question.explanation
      }];
    }
    
    // For housing hazards with LOINC answer codes, add component
    if (clinicalCodes.loincAnswer) {
      observation.component = [{
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: clinicalCodes.loinc,
            display: 'Housing problem type'
          }]
        },
        valueCodeableConcept: {
          coding: [{
            system: 'http://loinc.org',
            code: this.mapLoincAnswer(clinicalCodes.loincAnswer),
            display: clinicalCodes.loincAnswer
          }]
        }
      }];
    }

    return observation;
  }

  /**
   * Map LOINC answer text to codes for 96778-6
   */
  private static mapLoincAnswer(answer: string): string {
    const loincAnswerCodes: { [key: string]: string } = {
      'Mold': 'LA31994-7',
      'Water leaks': 'LA31995-4',
      'Pests': 'LA31996-2',
      'Lead paint or pipes': 'LA31997-0',
      'Lack of heat': 'LA31998-8',
      'Oven or stove not working': 'LA31999-6',
      'Smoke detectors missing or not working': 'LA32000-2',
      'Unsafe or not working electrical outlets': 'LA32001-0',
      'Exposed wiring': 'LA32002-8',
      'Toilets not working': 'LA32003-6',
      'Violence': 'LA32004-4',
      'Other problems': 'LA32005-1'
    };
    return loincAnswerCodes[answer] || 'LA32005-1'; // Default to 'Other'
  }

  /**
   * Maps assessment response to appropriate FHIR value type
   */
  private static mapResponseToFHIRValue(question: ChecklistItem, response: string, clinicalCodes: any) {
    // For binary responses (yes/no)
    if (question.response_type === 'binary' || ['yes', 'no'].includes(response.toLowerCase())) {
      return {
        valueBoolean: response.toLowerCase() === 'yes'
      };
    }

    // For multiple choice responses with defined options
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

    // For SDOH specific responses
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

    // For housing hazard questions with specific issues
    if (clinicalCodes.loincAnswer) {
      // These are typically yes/no about presence of hazard
      return {
        valueBoolean: response.toLowerCase() === 'yes' || 
                     response.toLowerCase() === 'poor' ||
                     response.toLowerCase() === 'broken'
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
      const issue = issues.find(i => i.item_id === question.item_id);
      if (issue) {
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
