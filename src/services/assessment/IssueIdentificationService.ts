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
    // DEBUG LOGGING START
    console.log('=== ISSUE IDENTIFICATION DEBUG ===');
    console.log('Total questions:', questions.length);
    console.log('All questions:', questions);
    console.log('Questions with SDOH keywords:', questions.filter(q => 
      q.item_id?.includes('food') || 
      q.item_id?.includes('Food') ||
      q.item_id?.includes('housing') || 
      q.item_id?.includes('Housing') ||
      q.section?.includes('Food') ||
      q.section?.includes('Security') ||
      q.section?.includes('SDOH')
    ));
    console.log('All question IDs:', questions.map(q => q.item_id));
    console.log('All sections:', [...new Set(questions.map(q => q.section))]);
    console.log('All responses:', responses);
    console.log('Response keys:', Object.keys(responses));
    console.log('================================');
    // DEBUG LOGGING END

    const issues: IdentifiedIssue[] = [];

    questions.forEach(question => {
      const response = responses[question.item_id];
      
      // DEBUG FOR EACH QUESTION
      if (question.section?.includes('Food') || 
          question.section?.includes('Security') || 
          question.section?.includes('SDOH') ||
          question.item_id?.includes('food') ||
          question.item_id?.includes('housing')) {
        console.log(`Checking SDOH question:`, {
          id: question.item_id,
          section: question.section,
          response: response,
          question: question.question_text?.substring(0, 50)
        });
      }
      
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
      
      // DEBUG SDOH CHECK
      if (sdohIds.some(id => question.item_id?.toLowerCase().includes(id.toLowerCase()))) {
        console.log(`Potential SDOH match for ${question.item_id}, isSDOHQuestion=${isSDOHQuestion}`);
      }
      
      if (isSDOHQuestion) {
        console.log(`Processing SDOH question ${question.item_id} with response ${response}`);
        
        // For SDOH questions, "opt1" is typically the best answer
        // Issues should be flagged for opt2, opt3, opt4, opt5
        const negativeResponses = ['opt2', 'opt3', 'opt4', 'opt5'];
        
        if (negativeResponses.includes(response)) {
          console.log(`FLAGGING ISSUE for ${question.item_id}: ${response} is negative`);
          
          // Calculate risk based on how negative the response is
          let riskMultiplier = 1;
          if (response === 'opt2') riskMultiplier = 0.6;
          if (response === 'opt3') riskMultiplier = 0.8;
          if (response === 'opt4' || response === 'opt5') riskMultiplier = 1;
          
          const riskScore = this.getSDOHRiskScore(question.item_id) * riskMultiplier;
          console.log(`Risk score for ${question.item_id}: ${riskScore}`);
          
          issues.push({
            item_id: question.item_id,
            question_text: question.question_text,
            response: response,
            risk_score: riskScore,
            category: this.categorizeRisk(riskScore),
            intervention_needed: true,
            section: question.section || 'SDOH'
          });
        } else {
          console.log(`NOT FLAGGING ${question.item_id}: ${response} is not negative`);
        }
      } else {
        // Original logic for non-SDOH questions
        const issue = this.evaluateNonSDOHResponse(question, response);
        if (issue) {
          console.log(`Non-SDOH issue found for ${question.item_id}`);
          issues.push(issue);
        }
      }
    });

    console.log('=== FINAL ISSUES ===');
    console.log('Total issues identified:', issues.length);
    console.log('Issues:', issues);
    console.log('====================');

    return issues.sort((a, b) => b.risk_score - a.risk_score);
  }

  private static getSDOHRiskScore(questionId: string): number {
    const riskScores: { [key: string]: number } = {
      // Using actual IDs from SDOHSection component
      'housingStability': 85,
      'foodSecurity': 75,
      'transportation': 60,
      'utilities': 70,
      'socialSupport': 55,
      'healthcare': 70,
      'employment': 50,
      'education': 45,
      'income': 65
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
