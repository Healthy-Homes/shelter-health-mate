// src/utils/riskScoring.ts - Enhanced with N/A Support

import { 
  ChecklistItem, 
  ItemRiskAssessment, 
  OverallRiskAssessment, 
  InterventionRecommendation,
  RiskCategory,
  Priority,
  CompletenessFlag
} from '../types/checklist';

// Risk Categories and Base Weights
const RISK_CATEGORIES: Record<RiskCategory, { weight: number; urgency: string; description: string }> = {
  structural: { weight: 5, urgency: 'high', description: 'Building integrity issues' },
  fire_safety: { weight: 5, urgency: 'critical', description: 'Fire and electrical hazards' },
  electrical_safety: { weight: 5, urgency: 'critical', description: 'Electrical system safety' },
  water_damage: { weight: 4, urgency: 'high', description: 'Water intrusion and damage' },
  flooding: { weight: 4, urgency: 'high', description: 'Flood risk and drainage' },
  air_quality: { weight: 3, urgency: 'medium', description: 'Indoor air quality issues' },
  pest_health: { weight: 3, urgency: 'medium', description: 'Pest-related health risks' },
  injury: { weight: 4, urgency: 'high', description: 'Physical injury hazards' },
  ventilation: { weight: 2, urgency: 'medium', description: 'Ventilation adequacy' },
  freeze_damage: { weight: 1, urgency: 'low', description: 'Weather-related damage risk' },
  privacy: { weight: 1, urgency: 'low', description: 'Privacy and comfort issues' },
  social_determinant: { weight: 3, urgency: 'medium', description: 'Social factors affecting health' },
  energy_efficiency: { weight: 1, urgency: 'low', description: 'Energy efficiency concerns' },
  chemical_safety: { weight: 4, urgency: 'high', description: 'Chemical and hazardous material safety' },
  none: { weight: 0, urgency: 'none', description: 'No risk identified' }
};

// Priority Levels
const PRIORITY_LEVELS: Record<Priority, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  none: 1
};

// Response Scoring Maps
const RESPONSE_SCORES: Record<string, Record<string, number>> = {
  binary: {
    'yes': 0, 'no': 1, 'good': 0, 'poor': 1, 'safe': 0, 'damaged': 1,
    'working': 0, 'not_working': 1, 'completed': 0, 'not_completed': 1,
    'dry': 0, 'wet': 1, 'intact': 0, 'clear': 0, 'blocked': 1,
    'none': 0, 'present': 1, 'adequate': 0, 'inadequate': 1,
    'stuck': 0.5, 'faulty': 1, 'clogged': 1, 'leaking': 1, 'peeling': 1,
    'broken': 1, 'unsafe': 1, 'n/a': 0  // N/A = 0 risk
  },
  scale: {
    'none': 0, 'excellent': 0, 'minor': 0.25, 'good': 0.25,
    'moderate': 0.75, 'fair': 0.75, 'severe': 1, 'poor': 1,
    'a little': 0.25, 'some': 0.75, 'a lot': 1, 'very poor': 1,
    'very good': 0, 'n/a': 0  // N/A = 0 risk
  },
  multiple_choice: {
    'n/a': 0  // N/A = 0 risk for all multiple choice
  }
};

/**
 * Check if a response is N/A
 */
function isNAResponse(response: string): boolean {
  return response.toLowerCase().trim() === 'n/a';
}

/**
 * Calculate risk score for a single checklist item
 */
export function calculateItemRisk(item: ChecklistItem, userResponse: string): ItemRiskAssessment {
  const riskCategory = RISK_CATEGORIES[item.risk_category] || RISK_CATEGORIES.none;
  const priorityWeight = PRIORITY_LEVELS[item.priority] || 1;
  const itemWeight = item.risk_weight || 1;
  
  // Check if response is N/A
  const isNA = isNAResponse(userResponse);
  
  // Get response score
  let responseScore = 0;
  
  if (isNA) {
    responseScore = 0; // N/A responses have zero risk
  } else if (item.response_type === 'binary' || item.response_type === 'scale') {
    const scoreMap = RESPONSE_SCORES[item.response_type];
    responseScore = scoreMap[userResponse.toLowerCase()] ?? 0;
  } else if (item.response_type === 'multiple_choice') {
    responseScore = getMultipleChoiceScore(item, userResponse);
  }
  
  // Calculate composite risk score (0-100)
  const riskScore = isNA ? 0 : Math.min(100, 
    responseScore * riskCategory.weight * priorityWeight * itemWeight * 4
  );
  
  return {
    item_id: item.item_id,
    category: item.category,
    subcategory: item.subcategory,
    risk_category: item.risk_category,
    risk_score: Math.round(riskScore),
    urgency: riskCategory.urgency as any,
    requires_action: item.requires_action === 'yes' && responseScore > 0 && !isNA,
    intervention_needed: responseScore > 0.5 && !isNA,
    raw_response: userResponse,
    response_score: responseScore,
    is_na_response: isNA
  };
}

/**
 * Context-specific scoring for multiple choice questions
 */
function getMultipleChoiceScore(item: ChecklistItem, response: string): number {
  // N/A handling
  if (isNAResponse(response)) return 0;
  
  if (item.question_key.includes('building_type')) return 0;
  if (item.question_key.includes('occupancy')) {
    return response === 'shared_floor' ? 0.25 : 0;
  }
  if (item.question_key.includes('doorway')) {
    const scores: Record<string, number> = {
      'closable_door': 0, 'open_doorway': 0.25, 'open_wall': 0.5
    };
    return scores[response] || 0;
  }
  return 0;
}

/**
 * Determine completeness flag based on N/A percentage
 */
function determineCompletenessFlag(naPercentage: number): CompletenessFlag {
  if (naPercentage > 25) {
    return 'potentially_deficient';
  } else if (naPercentage > 15) {
    return 'incomplete';
  } else {
    return 'complete';
  }
}

/**
 * Calculate overall risk assessment for a completed checklist
 */
export function calculateOverallRisk(itemRisks: ItemRiskAssessment[]): OverallRiskAssessment {
  const totalItems = itemRisks.length;
  const naResponses = itemRisks.filter(item => item.is_na_response);
  const naCount = naResponses.length;
  const naPercentage = totalItems > 0 ? Math.round((naCount / totalItems) * 100) : 0;
  
  // Filter out N/A responses for risk calculations
  const scorableItems = itemRisks.filter(item => !item.is_na_response);
  const scorableCount = scorableItems.length;
  
  const issuesFound = scorableItems.filter(item => item.risk_score > 0).length;
  const criticalIssues = scorableItems.filter(item => item.urgency === 'critical').length;
  const highRiskIssues = scorableItems.filter(item => item.urgency === 'high').length;
  const actionsNeeded = scorableItems.filter(item => item.requires_action).length;
  
  // Weighted average risk score (excluding N/A responses)
  const totalRiskScore = scorableItems.reduce((sum, item) => {
    const categoryWeight = RISK_CATEGORIES[item.risk_category]?.weight || 1;
    return sum + (item.risk_score * categoryWeight);
  }, 0);
  
  const maxPossibleScore = scorableItems.reduce((sum, item) => {
    const categoryWeight = RISK_CATEGORIES[item.risk_category]?.weight || 1;
    return sum + (100 * categoryWeight);
  }, 0);
  
  const overallRiskScore = maxPossibleScore > 0 ? 
    Math.round((totalRiskScore / maxPossibleScore) * 100) : 0;
  
  // Risk level classification
  let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (criticalIssues > 0) riskLevel = 'critical';
  else if (highRiskIssues > 2 || overallRiskScore > 60) riskLevel = 'high';
  else if (highRiskIssues > 0 || overallRiskScore > 30) riskLevel = 'medium';
  
  // Completion rate based on scorable items
  const completionRate = scorableCount > 0 ? 
    Math.round(((scorableCount - issuesFound) / scorableCount) * 100) : 100;
  
  return {
    overall_risk_score: overallRiskScore,
    risk_level: riskLevel,
    total_items: totalItems,
    issues_found: issuesFound,
    critical_issues: criticalIssues,
    high_risk_issues: highRiskIssues,
    actions_needed: actionsNeeded,
    completion_rate: completionRate,
    na_count: naCount,
    na_percentage: naPercentage,
    completeness_flag: determineCompletenessFlag(naPercentage),
    priority_interventions: scorableItems
      .filter(item => item.urgency === 'critical' || item.intervention_needed)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
  };
}

/**
 * Generate intervention recommendations (excluding N/A responses)
 */
export function generateInterventions(itemRisks: ItemRiskAssessment[]): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  // Filter out N/A responses for intervention planning
  const scorableItems = itemRisks.filter(item => !item.is_na_response && item.risk_score > 0);
  
  // Group by category for systematic recommendations
  const byCategory = scorableItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ItemRiskAssessment[]>);
  
  Object.entries(byCategory).forEach(([category, items]) => {
    const criticalItems = items.filter(item => item.urgency === 'critical');
    const highRiskItems = items.filter(item => item.urgency === 'high');
    
    if (criticalItems.length > 0) {
      interventions.push({
        category,
        priority: 'immediate',
        intervention_type: 'critical_safety',
        items: criticalItems.map(item => item.item_id),
        estimated_cost: 'varies',
        timeline: 'immediate',
        professional_required: true
      });
    }
    
    if (highRiskItems.length > 0) {
      interventions.push({
        category,
        priority: 'high',
        intervention_type: 'preventive_maintenance',
        items: highRiskItems.map(item => item.item_id),
        estimated_cost: 'low_moderate',
        timeline: '1_4_weeks',
        professional_required: false
      });
    }
  });
  
  return interventions.sort((a, b) => {
    const priorityOrder = { immediate: 3, high: 2, medium: 1, low: 0 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Get completeness message based on flag
 */
export function getCompletenessMessage(flag: CompletenessFlag, naPercentage: number): string {
  switch (flag) {
    case 'potentially_deficient':
      return `Assessment may be incomplete due to high number of N/A responses (${naPercentage}%). This may indicate missing essential home features.`;
    case 'incomplete':
      return `Some assessment items were marked as N/A (${naPercentage}%). Review if these features are actually present.`;
    case 'complete':
    default:
      return 'Assessment appears complete with comprehensive coverage of home features.';
  }
}
