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

export class FHIRMappingService {
  private static readonly SYSTEM_BASE_URL = 'https://shelter-health-assessment.org/fhir';

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
        timestamp
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
    timestamp: string
  ): FHIRObservation {
    
    const clinicalCode = mapQuestionToClinicalCode(question.item_id);
    const observationId = EncryptionService.generateSecureId('obs');

    // Determine observation category based on question type
    const category = this.getObservationCategory(question);

    // Map response to appropriate FHIR value
    const valueMapping = this.mapResponseToFHIRValue(question, response);

    const observation: FHIRObservation = {
      resourceType: 'Observation',
      id: observationId,
      status: 'final',
      category: [category],
      code: {
        coding: [{
          system: clinicalCode.snomed ? 'http://snomed.info/sct' : 
                  clinicalCode.loinc ? 'http://loinc.org' :
                  `${this.SYSTEM_BASE_URL}/codes`,
          code: clinicalCode.snomed || clinicalCode.loinc || question.item_id,
          display: clinicalCode.display || question.question_text
        }],
        text: question.question_text
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      ...valueMapping
    };

    // Add risk assessment interpretation
    if (question.risk_score_yes > 50) {
      const riskLevel = this.calculateQuestionRisk(question, response);
      observation.interpretation = [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: riskLevel > 70 ? 'H' : riskLevel > 30 ? 'N' : 'L',
          display: riskLevel > 70 ? 'High' : riskLevel > 30 ? 'Normal' : 'Low'
        }]
      }];
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

    // Fallback to string value
    return {
      valueString: response
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
   * Calculates risk score for individual question
   */
  private static calculateQuestionRisk(question: ChecklistItem, response: string): number {
    if (question.response_type === 'binary') {
      return response.toLowerCase() === 'yes' ? question.risk_score_yes : question.risk_score_no;
    }

    if (Array.isArray(question.response_options)) {
      const option = question.response_options.find(opt => opt.value === response);
      if (option) {
        const maxRisk = Math.max(question.risk_score_yes, question.risk_score_no);
        return Math.round(maxRisk * option.weight);
      }
    }

    return 0;
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
