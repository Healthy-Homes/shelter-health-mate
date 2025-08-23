// src/utils/riskScoring.ts - Enhanced with N/A Support and Simplified Question Support

import { ChecklistItem } from '../types/checklist';

// Simplified types for compatibility
export interface ItemRisk {
  item_id: string;
  category: string;
  subcategory: string;
  risk_score: number;
  has_issue: boolean;
  priority: string;
  raw_response: string;
}

export interface OverallRiskAssessment {
  overall_risk_score: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  issues_found: number;
  actions_needed: number;
  completion_rate: number;
  na_count: number;
  na_percentage: number;
  completeness_flag: 'complete' | 'mostly_complete' | 'potentially_deficient';
  priority_interventions: ItemRisk[];
}

/**
 * Calculate risk score for a single checklist item
 * Handles both complex (US/Taiwan) and simple (Elder/SDOH) question structures
 */
export function calculateItemRisk(item: ChecklistItem, userResponse: string): ItemRisk {
  // Handle empty responses
  if (!userResponse || userResponse === '') {
    return {
      item_id: item.item_id,
      category: item.category,
      subcategory: item.subcategory,
      risk_score: 0,
      has_issue: false,
      priority: item.priority || 'low',
      raw_response: userResponse
    };
  }

  const response = userResponse.toLowerCase().trim();
  let riskScore = 0;
  let hasIssue = false;

  // Handle N/A responses
  if (response === 'n/a' || response === 'not_applicable' || response === 'not applicable') {
    return {
      item_id: item.item_id,
      category: item.category,
      subcategory: item.subcategory,
      risk_score: 0,
      has_issue: false,
      priority: item.priority || 'low',
      raw_response: userResponse
    };
  }

  // Handle different response types
  if (item.response_type === 'binary') {
    // For binary questions, use the risk_score_yes and risk_score_no fields
    if (response === 'yes' || response === 'true') {
      riskScore = item.risk_score_yes || 0;
    } else if (response === 'no' || response === 'false') {
      riskScore = item.risk_score_no || 0;
    } else if (response === 'unsure') {
      // For unsure, take the higher risk
      riskScore = Math.max(item.risk_score_yes || 0, item.risk_score_no || 0) * 0.5;
    } else {
      // For other binary responses (good/poor, safe/damaged, etc.)
      const positiveResponses = ['good', 'safe', 'working', 'completed', 'dry', 'intact', 'clear', 'adequate'];
      const negativeResponses = ['poor', 'damaged', 'not_working', 'not_completed', 'wet', 'blocked', 'inadequate', 'unsafe', 'broken'];
      
      if (positiveResponses.includes(response)) {
        riskScore = item.risk_score_no || 0; // Good response = lower risk
      } else if (negativeResponses.includes(response)) {
        riskScore = item.risk_score_yes || 0; // Bad response = higher risk
      }
    }
    
    hasIssue = riskScore > 30;
    
  } else if (item.response_type === 'scale') {
    // Map scale responses to risk percentages
    const scaleMap: Record<string, number> = {
      // Frequency scales
      'always': 0,
      'usually': 25,
      'sometimes': 50,
      'rarely': 75,
      'never': 100,
      // Quality scales
      'excellent': 0,
      'very_good': 10,
      'good': 25,
      'adequate': 40,
      'fair': 60,
      'poor': 80,
      'very_poor': 100,
      // Noise scales
      'very_quiet': 0,
      'quiet': 20,
      'moderate': 40,
      'noisy': 70,
      'very_noisy': 100,
      // Amount scales
      'none': 0,
      'minimal': 25,
      'moderate': 50,
      'significant': 75,
      'severe': 100,
      // Satisfaction scales
      'very_satisfied': 0,
      'satisfied': 20,
      'neutral': 40,
      'unsatisfied': 70,
      'very_unsatisfied': 100,
      // Time scales
      'daily': 0,
      'every_2-3_days': 20,
      'weekly': 40,
      'biweekly': 50,
      'monthly': 60,
      'less_than_monthly': 80,
      'less_than_weekly': 80
    };

    const baseScore = scaleMap[response] ?? 50;
    // Use the higher of the two risk scores as the maximum
    const maxRisk = Math.max(item.risk_score_yes || 0, item.risk_score_no || 0);
    riskScore = Math.round((baseScore / 100) * maxRisk);
    hasIssue = riskScore > 40;
    
  } else if (item.response_type === 'multiple_choice' || item.response_type === 'numeric') {
    // For multiple choice, try to determine risk based on the option position
    const options = item.response_options.split(',').map(opt => opt.trim());
    const responseIndex = options.findIndex(opt => opt === response);
    
    if (responseIndex !== -1) {
      // Generally, later options are worse (e.g., "less_than_10" vs "more_than_30" for building age)
      const positionScore = (responseIndex / (options.length - 1));
      const maxRisk = Math.max(item.risk_score_yes || 0, item.risk_score_no || 0);
      riskScore = Math.round(positionScore * maxRisk);
      hasIssue = riskScore > 30;
    }
  }

  // Debug logging
  console.log(`Item ${item.item_id}:`, {
    response: userResponse,
    response_type: item.response_type,
    risk_score_yes: item.risk_score_yes,
    risk_score_no: item.risk_score_no,
    calculated_risk: riskScore,
    has_issue: hasIssue
  });

  return {
    item_id: item.item_id,
    category: item.category,
    subcategory: item.subcategory,
    risk_score: riskScore,
    has_issue: hasIssue,
    priority: item.priority || 'low',
    raw_response: userResponse
  };
}

/**
 * Calculate overall risk assessment for a completed checklist
 */
export function calculateOverallRisk(itemRisks: ItemRisk[]): OverallRiskAssessment {
  // Separate N/A from other responses
  const allResponses = itemRisks.filter(risk => risk.raw_response && risk.raw_response !== '');
  const naResponses = allResponses.filter(risk => 
    risk.raw_response.toLowerCase() === 'n/a' || 
    risk.raw_response.toLowerCase() === 'not_applicable' ||
    risk.raw_response.toLowerCase() === 'not applicable'
  );
  const validResponses = allResponses.filter(risk => 
    risk.raw_response.toLowerCase() !== 'n/a' && 
    risk.raw_response.toLowerCase() !== 'not_applicable' &&
    risk.raw_response.toLowerCase() !== 'not applicable'
  );

  const totalItems = itemRisks.length;
  const answeredItems = allResponses.length;
  const naCount = naResponses.length;
  const validCount = validResponses.length;
  
  // Calculate metrics
  const completionRate = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
  const naPercentage = answeredItems > 0 ? Math.round((naCount / answeredItems) * 100) : 0;
  
  // Calculate risk scores (only from valid, non-N/A responses)
  const totalRiskScore = validResponses.reduce((sum, risk) => sum + risk.risk_score, 0);
  const overallRiskScore = validCount > 0 ? Math.round(totalRiskScore / validCount) : 0;
  
  // Count issues
  const issuesFound = validResponses.filter(risk => risk.has_issue).length;
  const criticalIssues = validResponses.filter(risk => 
    risk.has_issue && risk.priority === 'critical'
  ).length;
  const highIssues = validResponses.filter(risk => 
    risk.has_issue && risk.priority === 'high'
  ).length;
  const actionsNeeded = criticalIssues + highIssues;
  
  // Determine risk level
  let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (criticalIssues > 0 || overallRiskScore >= 70) {
    riskLevel = 'critical';
  } else if (highIssues > 2 || overallRiskScore >= 50) {
    riskLevel = 'high';
  } else if (issuesFound > 5 || overallRiskScore >= 30) {
    riskLevel = 'medium';
  }
  
  // Determine completeness flag
  let completenessFlag: 'complete' | 'mostly_complete' | 'potentially_deficient';
  if (completionRate < 70 || naPercentage > 30) {
    completenessFlag = 'potentially_deficient';
  } else if (completionRate < 90 || naPercentage > 15) {
    completenessFlag = 'mostly_complete';
  } else {
    completenessFlag = 'complete';
  }
  
  // Get priority interventions (top issues)
  const priorityInterventions = validResponses
    .filter(risk => risk.has_issue)
    .sort((a, b) => {
      // Sort by priority first, then by risk score
      const priorityOrder: Record<string, number> = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.risk_score - a.risk_score;
    })
    .slice(0, 10);
  
  // Debug logging
  console.log('Overall Risk Calculation:', {
    totalItems,
    answeredItems,
    naCount,
    validCount,
    totalRiskScore,
    overallRiskScore,
    issuesFound,
    criticalIssues,
    highIssues,
    riskLevel,
    completenessFlag
  });
  
  return {
    overall_risk_score: overallRiskScore,
    risk_level: riskLevel,
    issues_found: issuesFound,
    actions_needed: actionsNeeded,
    completion_rate: completionRate,
    na_count: naCount,
    na_percentage: naPercentage,
    completeness_flag: completenessFlag,
    priority_interventions: priorityInterventions
  };
}

/**
 * Get completeness message based on flag
 */
export function getCompletenessMessage(flag: string, naPercentage: number): string {
  switch (flag) {
    case 'potentially_deficient':
      return `This assessment may be incomplete. ${naPercentage > 30 
        ? `Many questions (${naPercentage}%) were marked as not applicable.` 
        : 'Please review unanswered questions for a more comprehensive evaluation.'}`;
    case 'mostly_complete':
      return `Assessment is mostly complete. Consider reviewing skipped questions for a more thorough evaluation.`;
    case 'complete':
    default:
      return '';
  }
}

// Keep the complex types for backward compatibility if needed
export type RiskCategory = 'structural' | 'fire_safety' | 'electrical_safety' | 'water_damage' | 
  'flooding' | 'air_quality' | 'pest_health' | 'injury' | 'ventilation' | 
  'freeze_damage' | 'privacy' | 'social_determinant' | 'energy_efficiency' | 
  'chemical_safety' | 'none';

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type CompletenessFlag = 'complete' | 'incomplete' | 'potentially_deficient';

export interface ItemRiskAssessment {
  item_id: string;
  category: string;
  subcategory: string;
  risk_category?: RiskCategory;
  risk_score: number;
  urgency?: string;
  requires_action?: boolean;
  intervention_needed?: boolean;
  raw_response: string;
  response_score?: number;
  is_na_response?: boolean;
}

export interface InterventionRecommendation {
  category: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  intervention_type: string;
  items: string[];
  estimated_cost: string;
  timeline: string;
  professional_required: boolean;
}
