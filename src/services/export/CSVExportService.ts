// src/services/export/CSVExportService.ts
// Comprehensive CSV export service for research data with bilingual support

import { AssessmentResults, ResponseMap, ChecklistItem } from '../../types/checklist';
import { EncryptionService } from '../security/EncryptionService';
import { mapQuestionToClinicalCode } from '../../constants/clinicalMappings';

export interface CSVExportOptions {
  includePersonalInfo?: boolean;
  anonymizeSensitiveData?: boolean;
  includeRiskScores?: boolean;
  includeMetadata?: boolean;
  includeBilingualText?: boolean;
  includeNonResponses?: boolean;  // NEW: Include questions without responses
  includeClinicalCodes?: boolean; // NEW: Include LOINC/SNOMED codes
  customFields?: { [key: string]: any };
}

export interface ResearchDataRow {
  questionId: string;
  questionText_EN: string;
  questionText_ZH: string;
  section: string;
  responseValue: string | number;
  responseText_EN: string;
  responseText_ZH: string;
  responseStatus: 'answered' | 'not_answered'; // NEW
  riskScore: number;
  hasIssue: boolean;
  category: string;
  assessmentType: string;
  timestamp: string;
  participantId?: string;
  sessionId: string;
  questionOrder: number;
  responseType: 'single' | 'multiple' | 'text' | 'number';
  isRequired: boolean;
  // NEW: Clinical code fields
  loincCode?: string;
  loincDisplay?: string;
  snomedCode?: string;
  snomedDisplay?: string;
  icd10Code?: string;
  icd10Display?: string;
}

export class CSVExportService {
  /**
   * Generates comprehensive research CSV with bilingual support
   */
  static generateResearchCSV(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: CSVExportOptions = {}
  ): string {
    const {
      includePersonalInfo = false,
      anonymizeSensitiveData = true,
      includeRiskScores = true,
      includeMetadata = true,
      includeBilingualText = true,
      includeNonResponses = true, // Default to including all questions
      includeClinicalCodes = true, // Default to including clinical codes
      customFields = {}
    } = options;

    // Generate data rows - now always includes all questions
    const dataRows = this.generateDataRows(
      results,
      responses,
      questions,
      options
    );

    // Filter if not including non-responses (backward compatibility)
    const finalRows = includeNonResponses 
      ? dataRows 
      : dataRows.filter(row => row.responseStatus === 'answered');

    // Generate headers
    const headers = this.generateHeaders(
      includeBilingualText, 
      includeMetadata, 
      includeClinicalCodes,
      customFields
    );

    // Convert to CSV format
    const csvRows = [
      headers,
      ...finalRows.map(row => this.rowToCSVArray(
        row, 
        includeBilingualText, 
        includeMetadata,
        includeClinicalCodes, 
        customFields
      ))
    ];

    return csvRows
      .map(row => row.map(field => this.escapeCSVField(field)).join(','))
      .join('\n');
  }

  /**
   * NEW: Comprehensive export method expected by ExportModal
   */
  static generateComprehensiveExport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: CSVExportOptions = {}
  ): {
    csv: string;
    summary: string;
    filename: string;
  } {
    // Ensure comprehensive options are enabled
    const comprehensiveOptions = {
      ...options,
      includeNonResponses: true,  // Always include all questions
      includeClinicalCodes: true, // Always include clinical codes
      includeMetadata: true,       // Include full metadata
      includeRiskScores: true      // Include risk assessment
    };

    const csv = this.generateResearchCSV(results, responses, questions, comprehensiveOptions);
    const summary = this.generateEnhancedSummaryReport(results, responses, questions);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-health-assessment-${results.assessmentType}-${timestamp}.csv`;

    return { csv, summary, filename };
  }

  /**
   * Generates data rows for each question (whether answered or not)
   */
  private static generateDataRows(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: CSVExportOptions
  ): ResearchDataRow[] {
    const timestamp = new Date().toISOString();
    const sessionId = EncryptionService.generateSecureId('session');
    const participantId = options.includePersonalInfo 
      ? EncryptionService.generateSecureId('participant')
      : options.anonymizeSensitiveData 
        ? EncryptionService.anonymizeData('anonymous-participant')
        : undefined;

    return questions.map((question, index) => {
      const responseValue = responses[question.item_id];
      const hasResponse = responseValue !== undefined && responseValue !== null && responseValue !== '';
      const riskScore = this.calculateQuestionRiskScore(question, responseValue, results);
      const hasIssue = hasResponse ? this.determineHasIssue(question, responseValue, riskScore) : false;
      
      // Get clinical codes
      const clinicalCodes = options.includeClinicalCodes 
        ? mapQuestionToClinicalCode(question.item_id)
        : null;

      return {
        questionId: question.item_id,
        questionText_EN: question.question_text,
        questionText_ZH: question.question_text_zh || '',
        section: question.section,
        responseValue: responseValue || '',
        responseText_EN: this.getResponseText(question, responseValue, 'en'),
        responseText_ZH: this.getResponseText(question, responseValue, 'zh'),
        responseStatus: hasResponse ? 'answered' : 'not_answered',
        riskScore: hasResponse ? riskScore : 0,
        hasIssue: hasIssue,
        category: this.categorizeQuestion(question),
        assessmentType: results.assessmentType || 'unknown',
        timestamp: timestamp,
        participantId: participantId,
        sessionId: sessionId,
        questionOrder: index + 1,
        responseType: this.determineResponseType(question),
        isRequired: question.required || false,
        // Clinical codes
        loincCode: clinicalCodes?.loinc || '',
        loincDisplay: clinicalCodes?.loinc ? clinicalCodes.display : '',
        snomedCode: clinicalCodes?.snomed || '',
        snomedDisplay: clinicalCodes?.snomed ? clinicalCodes.display : '',
        icd10Code: clinicalCodes?.icd10 || '',
        icd10Display: clinicalCodes?.icd10 ? clinicalCodes.display : ''
      };
    });
  }

  /**
   * Generates CSV headers based on options
   */
  private static generateHeaders(
    includeBilingual: boolean,
    includeMetadata: boolean,
    includeClinicalCodes: boolean,
    customFields: { [key: string]: any }
  ): string[] {
    const baseHeaders = [
      'QuestionID',
      'QuestionText_EN',
      ...(includeBilingual ? ['QuestionText_ZH'] : []),
      'Section',
      'ResponseValue',
      'ResponseText_EN',
      ...(includeBilingual ? ['ResponseText_ZH'] : []),
      'ResponseStatus',
      'RiskScore',
      'HasIssue',
      'Category',
      'AssessmentType'
    ];

    const metadataHeaders = includeMetadata ? [
      'Timestamp',
      'ParticipantID',
      'SessionID',
      'QuestionOrder',
      'ResponseType',
      'IsRequired'
    ] : [];

    const clinicalHeaders = includeClinicalCodes ? [
      'LOINC_Code',
      'LOINC_Display',
      'SNOMED_Code', 
      'SNOMED_Display',
      'ICD10_Code',
      'ICD10_Display'
    ] : [];

    const customHeaders = Object.keys(customFields);

    return [...baseHeaders, ...metadataHeaders, ...clinicalHeaders, ...customHeaders];
  }

  /**
   * Converts data row to CSV array format
   */
  private static rowToCSVArray(
    row: ResearchDataRow,
    includeBilingual: boolean,
    includeMetadata: boolean,
    includeClinicalCodes: boolean,
    customFields: { [key: string]: any }
  ): (string | number | boolean)[] {
    const baseData = [
      row.questionId,
      row.questionText_EN,
      ...(includeBilingual ? [row.questionText_ZH] : []),
      row.section,
      row.responseValue,
      row.responseText_EN,
      ...(includeBilingual ? [row.responseText_ZH] : []),
      row.responseStatus,
      row.riskScore,
      row.hasIssue,
      row.category,
      row.assessmentType
    ];

    const metadataData = includeMetadata ? [
      row.timestamp,
      row.participantId || '',
      row.sessionId,
      row.questionOrder,
      row.responseType,
      row.isRequired
    ] : [];

    const clinicalData = includeClinicalCodes ? [
      row.loincCode || '',
      row.loincDisplay || '',
      row.snomedCode || '',
      row.snomedDisplay || '',
      row.icd10Code || '',
      row.icd10Display || ''
    ] : [];

    const customData = Object.values(customFields);

    return [...baseData, ...metadataData, ...clinicalData, ...customData];
  }

  /**
   * Calculates risk score for individual question
   */
  private static calculateQuestionRiskScore(
    question: ChecklistItem,
    responseValue: any,
    results: AssessmentResults
  ): number {
    if (!responseValue) return 0;
    
    // Get section risk score as baseline
    const sectionScore = results.sectionScores?.[question.section] || 0;
    
    // For questions with specific risk indicators
    if (question.risk_factors && responseValue) {
      const riskFactor = question.risk_factors.find(rf => 
        rf.trigger_response === responseValue
      );
      return riskFactor?.risk_score || sectionScore;
    }

    // Check for yes/no risk scoring
    if (question.response_type === 'binary') {
      return responseValue.toLowerCase() === 'yes' 
        ? (question.risk_score_yes || sectionScore)
        : (question.risk_score_no || 0);
    }

    return sectionScore;
  }

  /**
   * Determines if question response indicates an issue
   */
  private static determineHasIssue(
    question: ChecklistItem,
    responseValue: any,
    riskScore: number
  ): boolean {
    // High risk score indicates issue
    if (riskScore >= 70) return true;

    // Check for specific problem responses
    const problemResponses = ['yes', 'very_often', 'always', 'severe', 'major_issue', 
                             'often_true', 'transitional', 'very_much', 'no'];
    if (typeof responseValue === 'string' && 
        problemResponses.includes(responseValue.toLowerCase())) {
      // Special handling for safety questions where "no" is bad
      if (question.item_id.includes('safety') || question.item_id.includes('SDOH_7') || 
          question.item_id.includes('SDOH_8')) {
        return responseValue.toLowerCase() === 'no';
      }
      // For other questions, "yes" or other problem indicators
      return responseValue.toLowerCase() !== 'no';
    }

    return false;
  }

  /**
   * Gets human-readable response text in specified language
   */
  private static getResponseText(
    question: ChecklistItem,
    responseValue: any,
    language: 'en' | 'zh'
  ): string {
    if (!responseValue) return '';

    // For multiple choice questions, find the option text
    if (question.response_options) {
      const option = question.response_options.find(opt => 
        opt.option_id === responseValue || opt.display_text === responseValue ||
        opt.value === responseValue || opt.label === responseValue
      );
      
      if (option) {
        if (language === 'zh') {
          return option.display_text_zh || option.label_zh || option.label || option.display_text || '';
        }
        return option.label || option.display_text || '';
      }
    }

    // Return raw value for text responses
    return String(responseValue);
  }

  /**
   * Categorizes question by type/domain
   */
  private static categorizeQuestion(question: ChecklistItem): string {
    // Check for SDOH category
    if (question.item_id.startsWith('SDOH_')) {
      return 'Social Determinants';
    }
    
    // Check for Elder Safety
    if (question.item_id.startsWith('ELDER_')) {
      return 'Elder Safety';
    }
    
    // Check for housing codes
    if (question.item_id.startsWith('US') || question.item_id.startsWith('HALST_')) {
      return 'Housing & Environment';
    }
    
    const questionText = question.question_text.toLowerCase();
    
    // Housing-related
    if (questionText.includes('housing') || questionText.includes('home') || 
        questionText.includes('apartment') || questionText.includes('rent')) {
      return 'Housing';
    }
    
    // Safety-related
    if (questionText.includes('safety') || questionText.includes('secure') || 
        questionText.includes('dangerous') || questionText.includes('threat')) {
      return 'Safety';
    }
    
    // Health-related
    if (questionText.includes('health') || questionText.includes('medical') || 
        questionText.includes('medication') || questionText.includes('illness')) {
      return 'Health';
    }
    
    // Financial
    if (questionText.includes('money') || questionText.includes('income') || 
        questionText.includes('financial') || questionText.includes('afford')) {
      return 'Financial';
    }
    
    // Social determinants
    if (questionText.includes('food') || questionText.includes('transportation') || 
        questionText.includes('employment') || questionText.includes('education')) {
      return 'Social Determinants';
    }

    return question.section || 'General';
  }

  /**
   * Determines the type of response expected
   */
  private static determineResponseType(question: ChecklistItem): 'single' | 'multiple' | 'text' | 'number' {
    if (question.response_type === 'binary') {
      return 'single';
    }
    
    if (question.response_options) {
      return question.multiple_choice ? 'multiple' : 'single';
    }
    
    if (question.input_type === 'number' || question.question_text.toLowerCase().includes('how many')) {
      return 'number';
    }
    
    return 'text';
  }

  /**
   * Escapes CSV field content to handle commas, quotes, and newlines
   */
  private static escapeCSVField(field: any): string {
    if (field === null || field === undefined) return '';
    
    let stringField = String(field);
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      stringField = '"' + stringField.replace(/"/g, '""') + '"';
    }
    
    return stringField;
  }

  /**
   * Enhanced summary report with clinical code statistics
   */
  static generateEnhancedSummaryReport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): string {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    const unansweredQuestions = totalQuestions - answeredQuestions;
    
    // Count questions with clinical codes
    let questionsWithLOINC = 0;
    let questionsWithSNOMED = 0;
    let questionsWithICD10 = 0;
    
    questions.forEach(q => {
      const codes = mapQuestionToClinicalCode(q.item_id);
      if (codes.loinc) questionsWithLOINC++;
      if (codes.snomed) questionsWithSNOMED++;
      if (codes.icd10) questionsWithICD10++;
    });
    
    const riskCounts = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    // Analyze risk distribution
    Object.values(results.sectionScores || {}).forEach(score => {
      if (score < 30) riskCounts.low++;
      else if (score < 70) riskCounts.medium++;
      else riskCounts.high++;
    });

    const summary = [
      'COMPREHENSIVE HEALTH ASSESSMENT RESEARCH DATA SUMMARY',
      '======================================================',
      '',
      `Assessment Type: ${results.assessmentType || 'Unknown'}`,
      `Export Date: ${new Date().toISOString()}`,
      '',
      'QUESTION STATISTICS:',
      `Total Questions: ${totalQuestions}`,
      `Answered Questions: ${answeredQuestions}`,
      `Unanswered Questions: ${unansweredQuestions}`,
      `Completion Rate: ${completionRate.toFixed(1)}%`,
      '',
      'CLINICAL CODE COVERAGE:',
      `Questions with LOINC codes: ${questionsWithLOINC} (${(questionsWithLOINC/totalQuestions*100).toFixed(1)}%)`,
      `Questions with SNOMED codes: ${questionsWithSNOMED} (${(questionsWithSNOMED/totalQuestions*100).toFixed(1)}%)`,
      `Questions with ICD-10 codes: ${questionsWithICD10} (${(questionsWithICD10/totalQuestions*100).toFixed(1)}%)`,
      '',
      'RISK DISTRIBUTION:',
      `Low Risk Sections: ${riskCounts.low}`,
      `Medium Risk Sections: ${riskCounts.medium}`,
      `High Risk Sections: ${riskCounts.high}`,
      '',
      'SECTION SCORES:',
      ...Object.entries(results.sectionScores || {}).map(
        ([section, score]) => `${section}: ${score}`
      ),
      '',
      'DATA EXPORT NOTES:',
      '- All questions included (answered and unanswered)',
      '- Clinical codes (LOINC, SNOMED, ICD-10) included where available',
      '- Response status tracked for filtering',
      '- Bilingual support for international research',
      ''
    ];

    return summary.join('\n');
  }

  /**
   * Generates summary statistics for the dataset (original method maintained for compatibility)
   */
  static generateSummaryReport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): string {
    return this.generateEnhancedSummaryReport(results, responses, questions);
  }

  /**
   * Exports CSV with automatic download
   */
  static downloadCSV(
    csvContent: string,
    filename: string = 'health-assessment-research-data.csv'
  ): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  }

  /**
   * Generates multiple export formats simultaneously (original method for compatibility)
   */
  static generateBulkExport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: CSVExportOptions = {}
  ): {
    csv: string;
    summary: string;
    filename: string;
  } {
    const csv = this.generateResearchCSV(results, responses, questions, options);
    const summary = this.generateSummaryReport(results, responses, questions);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `health-assessment-${results.assessmentType}-${timestamp}.csv`;

    return { csv, summary, filename };
  }
}
