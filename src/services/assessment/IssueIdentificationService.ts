// src/services/assessment/IssueIdentificationService.ts
import { ChecklistItem, ResponseMap } from '../../types/checklist';
import { isSDOHIssue, SDOH_RESPONSE_MAPPINGS } from '../../constants/clinicalMappings';

export interface IdentifiedIssue {
  item_id: string;
  question_text: string;
  response: string;
  risk_score: number;
  category: 'critical' | 'high' | 'moderate' | 'low';
  intervention_needed: boolean;
  section: string;
}

export class IssueIdentificationService {
  static identifyIssues(
  questions: ChecklistItem[], 
  responses: ResponseMap
): IdentifiedIssue[] {
  const issues: IdentifiedIssue[] = [];

  questions.forEach(question => {
    const response = responses[question.item_id];
    if (!response) return;

    // List of SDOH question IDs from the actual component
    const sdohIds = [
      'housingStability',
      'foodSecurity',
      'transportation',
      'utilities',
      'socialSupport',
      'healthcare',
      'employment',
      'education',
      'income'
    ];

    // Check if it's an SDOH question using the actual IDs
    const isSDOHQuestion = question.item_id.startsWith('SDOH_') || 
                          sdohIds.includes(question.item_id);
    
    if (isSDOHQuestion) {
      // For SDOH questions, "opt1" is typically the best answer
      // Issues should be flagged for opt2, opt3, opt4, opt5
      const negativeResponses = ['opt2', 'opt3', 'opt4', 'opt5'];
      
      if (negativeResponses.includes(response)) {
        // Calculate risk based on how negative the response is
        let riskMultiplier = 1;
        if (response === 'opt2') riskMultiplier = 0.6;
        if (response === 'opt3') riskMultiplier = 0.8;
        if (response === 'opt4' || response === 'opt5') riskMultiplier = 1;
        
        issues.push({
          item_id: question.item_id,
          question_text: question.question_text,
          response: response,
          risk_score: this.getSDOHRiskScore(question.item_id) * riskMultiplier,
          category: this.categorizeRisk(this.getSDOHRiskScore(question.item_id) * riskMultiplier),
          intervention_needed: true,
          section: question.section || 'SDOH'
        });
      }
    } else {
      // Original logic for non-SDOH questions
      const issue = this.evaluateNonSDOHResponse(question, response);
      if (issue) {
        issues.push(issue);
      }
    }
  });

  return issues.sort((a, b) => b.risk_score - a.risk_score);
}

  private static getSDOHRiskScore(questionId: string): number {
    const riskScores: { [key: string]: number } = {
      'SDOH_1': 75, // Food insecurity
      'SDOH_2': 80, // Food insecurity severe
      'SDOH_3': 85, // Housing instability
      'SDOH_4': 60, // Transportation
      'SDOH_5': 55, // Social isolation
      'SDOH_6': 50, // Stress
      'SDOH_7': 70, // Home safety
      'SDOH_8': 65  // Neighborhood safety
    };
    return riskScores[questionId] || 50;
  }

  private static evaluateNonSDOHResponse(
    question: ChecklistItem, 
    response: string
  ): IdentifiedIssue | null {
    // Keep your original logic for home/environmental questions
    const negativeResponses = ['poor', 'very_poor', 'broken', 'absent', 'not_working', 'missing', 'damaged', 'unsafe'];
    
    if (negativeResponses.includes(response.toLowerCase())) {
      return {
        item_id: question.item_id,
        question_text: question.question_text,
        response: response,
        risk_score: question.risk_score_yes || 50,
        category: this.categorizeRisk(question.risk_score_yes || 50),
        intervention_needed: true,
        section: question.section || 'general'
      };
    }

    // For yes/no questions
    if (question.response_type === 'binary') {
      if (response === 'yes' && question.risk_score_yes > question.risk_score_no) {
        return {
          item_id: question.item_id,
          question_text: question.question_text,
          response: response,
          risk_score: question.risk_score_yes,
          category: this.categorizeRisk(question.risk_score_yes),
          intervention_needed: true,
          section: question.section || 'general'
        };
      }
      if (response === 'no' && question.risk_score_no > question.risk_score_yes) {
        return {
          item_id: question.item_id,
          question_text: question.question_text,
          response: response,
          risk_score: question.risk_score_no,
          category: this.categorizeRisk(question.risk_score_no),
          intervention_needed: true,
          section: question.section || 'general'
        };
      }
    }

    return null;
  }

  private static categorizeRisk(score: number): 'critical' | 'high' | 'moderate' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    return 'low';
  }
}
