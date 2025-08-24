// src/utils/riskScoring.ts - Enhanced with N/A Support and Simplified Question Support

import { ChecklistItem } from '../types/checklist';

// Simplified types for compatibility
export interface ItemRisk {
  item_id: string;
  category: string;
  section: string;
  risk_score: number;
  has_issue: boolean;
  priority: string;
  raw_response: string;
  response_type: string;
}

export interface OverallRiskAssessment {
  risk_score: number;
  risk_level: string;
  total_questions: number;
  questions_with_issues: number;
  completion_rate: number;
  priority_interventions: ItemRisk[];
}

// Enhanced calculateItemRisk to handle both old and new question formats
export function calculateItemRisk(item: ChecklistItem, response: string): ItemRisk {
  // Skip if no response
  if (!response || response === '') {
    return {
      item_id: item.item_id,
      category: item.category || '',
      section: item.section || item.category || '',
      risk_score: 0,
      has_issue: false,
      priority: item.priority || 'low',
      raw_response: '',
      response_type: item.response_type || 'unknown'
    };
  }

  let riskScore = 0;
  let hasIssue = false;

  console.log(`DEBUG: Processing ${item.item_id} with response "${response}"`);
  console.log(`  risk_score_yes: ${item.risk_score_yes}, risk_score_no: ${item.risk_score_no}`);

  // Handle different response types and formats
  if (item.response_type === 'binary') {
    // Simple yes/no questions
    if (response.toLowerCase() === 'yes') {
      riskScore = item.risk_score_yes || 0;
    } else if (response.toLowerCase() === 'no') {
      riskScore = item.risk_score_no || 0;
    }
  } else if (item.response_type === 'multiple_choice') {
    // Handle both old and new response_options formats
    let responseWeight = 0;
    let maxWeight = 1;

    if (Array.isArray(item.response_options)) {
      // New format: array of objects with value, label, weight
      const selectedOption = item.response_options.find(opt => opt.value === response);
      if (selectedOption) {
        responseWeight = selectedOption.weight || 0;
      }
      // Find max weight for normalization
      maxWeight = Math.max(...item.response_options.map(opt => opt.weight || 0));
    } else if (typeof item.response_options === 'string') {
      // Old format: comma-separated string - need to infer weight
      const options = item.response_options.split(',').map(opt => opt.trim());
      const responseIndex = options.findIndex(opt => 
        opt.toLowerCase().includes(response.toLowerCase()) || 
        response.toLowerCase().includes(opt.toLowerCase())
      );
      
      if (responseIndex >= 0) {
        // Assign weight based on position (last option = highest weight)
        responseWeight = responseIndex / (options.length - 1);
        maxWeight = 1;
      }
    }

    // Calculate risk score based on weight and available risk scores
    const maxRiskScore = Math.max(item.risk_score_yes || 0, item.risk_score_no || 0);
    riskScore = responseWeight * maxRiskScore;

    console.log(`  Multiple choice: weight=${responseWeight}, maxWeight=${maxWeight}, calculated risk=${riskScore}`);
  }

  // Handle not_applicable responses
  if (response === 'not_applicable' || response === 'n/a') {
    riskScore = 0;
    hasIssue = false;
  } else {
    // Determine if this constitutes an issue based on risk score
    hasIssue = riskScore >= 30; // Lowered threshold to include more issues
  }

  console.log(`  Final: risk_score=${riskScore}, has_issue=${hasIssue}`);

  return {
    item_id: item.item_id,
    category: item.category || '',
    section: item.section || item.category || '',
    risk_score: riskScore,
    has_issue: hasIssue,
    priority: item.priority || 'low',
    raw_response: response,
    response_type: item.response_type || 'unknown'
  };
}

export function calculateOverallRisk(itemRisks: ItemRisk[]): OverallRiskAssessment {
  const validRisks = itemRisks.filter(risk => risk.raw_response !== '');
  const totalRiskScore = validRisks.reduce((sum, risk) => sum + risk.risk_score, 0);
  const averageRisk = validRisks.length > 0 ? totalRiskScore / validRisks.length : 0;
  
  // Determine risk level based on average
  let riskLevel = 'Low';
  if (averageRisk >= 70) riskLevel = 'Critical';
  else if (averageRisk >= 50) riskLevel = 'High';
  else if (averageRisk >= 30) riskLevel = 'Elevated';
  else if (averageRisk >= 15) riskLevel = 'Moderate';

  const questionsWithIssues = validRisks.filter(risk => risk.has_issue).length;
  const completionRate = Math.round((validRisks.length / itemRisks.length) * 100);

  // Get priority interventions (top risk items)
  const priorityInterventions = validRisks
    .filter(risk => risk.has_issue)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  console.log(`Overall calculation: ${totalRiskScore} total risk / ${validRisks.length} questions = ${averageRisk} average`);

  return {
    risk_score: Math.round(averageRisk),
    risk_level: riskLevel,
    total_questions: itemRisks.length,
    questions_with_issues: questionsWithIssues,
    completion_rate: completionRate,
    priority_interventions: priorityInterventions
  };
}

export function getCompletenessMessage(completionRate: number): string {
  if (completionRate >= 90) return "Assessment complete";
  if (completionRate >= 70) return "Nearly complete - consider answering remaining questions";
  if (completionRate >= 50) return "Partially complete - more responses needed for accurate assessment";
  return "Insufficient responses - please answer more questions";
}
