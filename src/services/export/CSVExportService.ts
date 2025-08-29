// src/services/export/CSVExportService.ts
// Comprehensive CSV export service for research data with bilingual support

import { AssessmentResults, ResponseMap, ChecklistItem } from '../../types/checklist';
import { EncryptionService } from '../security/EncryptionService';

export interface CSVExportOptions {
  includePersonalInfo?: boolean;
  anonymizeSensitiveData?: boolean;
  includeRiskScores?: boolean;
  includeMetadata?: boolean;
  includeBilingualText?: boolean;
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
      customFields = {}
    } = options;

    // Generate data rows
    const dataRows = this.generateDataRows(
      results,
      responses,
      questions,
      options
    );

    // Generate headers
    const headers = this.generateHeaders(includeBilingualText, includeMetadata, customFields);

    // Convert to CSV format
    const csvRows = [
      headers,
      ...dataRows.map(row => this.rowToCSVArray(row, includeBilingualText, includeMetadata, customFields))
    ];

    return csvRows
      .map(row => row.map(field => this.escapeCSVField(field)).join(','))
      .join('\n');
  }

  /**
   * Generates data rows for each question response
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
      const riskScore = this.calculateQuestionRiskScore(question, responseValue, results);
      const hasIssue = this.determineHasIssue(question, responseValue, riskScore);

      return {
        questionId: question.item_id,
        questionText_EN: question.question_text,
        questionText_ZH: question.question_text_zh || '',
        section: question.section,
        responseValue: responseValue || '',
        responseText_EN: this.getResponseText(question, responseValue, 'en'),
        responseText_ZH: this.getResponseText(question, responseValue, 'zh'),
        riskScore: riskScore,
        hasIssue: hasIssue,
        category: this.categorizeQuestion(question),
        assessmentType: results.assessmentType || 'unknown',
        timestamp: timestamp,
        participantId: participantId,
        sessionId: sessionId,
        questionOrder: index + 1,
        responseType: this.determineResponseType(question),
        isRequired: question.required || false
      };
    });
  }

  /**
   * Generates CSV headers based on options
   */
  private static generateHeaders(
    includeBilingual: boolean,
    includeMetadata: boolean,
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

    const customHeaders = Object.keys(customFields);

    return [...baseHeaders, ...metadataHeaders, ...customHeaders];
  }

  /**
   * Converts data row to CSV array format
   */
  private static rowToCSVArray(
    row: ResearchDataRow,
    includeBilingual: boolean,
    includeMetadata: boolean,
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

    const customData = Object.values(customFields);

    return [...baseData, ...metadataData, ...customData];
  }

  /**
   * Calculates risk score for individual question
   */
  private static calculateQuestionRiskScore(
    question: ChecklistItem,
    responseValue: any,
    results: AssessmentResults
  ): number {
    // Get section risk score as baseline
    const sectionScore = results.sectionScores?.[question.section] || 0;
    
    // For questions with specific risk indicators
    if (question.risk_factors && responseValue) {
      const riskFactor = question.risk_factors.find(rf => 
        rf.trigger_response === responseValue
      );
      return riskFactor?.risk_score || sectionScore;
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
    const problemResponses = ['yes', 'very_often', 'always', 'severe', 'major_issue'];
    if (typeof responseValue === 'string' && 
        problemResponses.includes(responseValue.toLowerCase())) {
      return true;
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
        opt.option_id === responseValue || opt.display_text === responseValue
      );
      
      if (option) {
        return language === 'zh' && option.display_text_zh 
          ? option.display_text_zh 
          : option.display_text;
      }
    }

    // Return raw value for text responses
    return String(responseValue);
  }

  /**
   * Categorizes question by type/domain
   */
  private static categorizeQuestion(question: ChecklistItem): string {
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
   * Generates summary statistics for the dataset
   */
  static generateSummaryReport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): string {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    
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
      'HEALTH ASSESSMENT RESEARCH DATA SUMMARY',
      '==========================================',
      '',
      `Assessment Type: ${results.assessmentType || 'Unknown'}`,
      `Export Date: ${new Date().toISOString()}`,
      `Total Questions: ${totalQuestions}`,
      `Answered Questions: ${answeredQuestions}`,
      `Completion Rate: ${completionRate.toFixed(1)}%`,
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
      ''
    ];

    return summary.join('\n');
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
   * Generates multiple export formats simultaneously
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
