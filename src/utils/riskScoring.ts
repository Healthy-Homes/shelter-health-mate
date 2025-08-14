// src/utils/riskScoring.ts

import { 
  ChecklistItem, 
  ItemRiskAssessment, 
  OverallRiskAssessment, 
  InterventionRecommendation,
  RiskCategory,
  Priority 
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
    'none': 0, 'present': 1
  },
  scale: {
    'none': 0, 'excellent': 0, 'minor': 0.25, 'good': 0.25,
    'moderate': 0.75, 'fair': 0.75, 'severe': 1, 'poor': 1,
    'a little': 0.25, 'some': 0.75, 'a lot': 1
  }
};

/**
 * Calculate risk score for a single checklist item
 */
export function calculateItemRisk(item: ChecklistItem, userResponse: string): ItemRiskAssessment {
  const riskCategory = RISK_CATEGORIES[item.risk_category] || RISK_CATEGORIES.none;
  const priorityWeight = PRIORITY_LEVELS[item.priority] || 1;
  const itemWeight = item.risk_weight || 1;
  
  // Get response score
  let responseScore = 0;
  
  if (item.response_type === 'binary' || item.response_type === 'scale') {
    const scoreMap = RESPONSE_SCORES[item.response_type];
    responseScore = scoreMap[userResponse.toLowerCase()] ?? 0;
  } else if (item.response_type === 'multiple_choice') {
    responseScore = getMultipleChoiceScore(item, userResponse);
  }
  
  // Calculate composite risk score (0-100)
  const riskScore = Math.min(100, 
    responseScore * riskCategory.weight * priorityWeight * itemWeight * 4
  );
  
  return {
    item_id: item.item_id,
    category: item.category,
    subcategory: item.subcategory,
    risk_category: item.risk_category,
    risk_score: Math.round(riskScore),
    urgency: riskCategory.urgency as any,
    requires_action: item.requires_action === 'yes' && responseScore > 0,
    intervention_needed: responseScore > 0.5,
    raw_response: userResponse,
    response_score: responseScore
  };
}

/**
 * Context-specific scoring for multiple choice questions
 */
function getMultipleChoiceScore(item: ChecklistItem, response: string): number {
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
 * Calculate overall risk assessment for a completed checklist
 */
export function calculateOverallRisk(itemRisks: ItemRiskAssessment[]): OverallRiskAssessment {
  const totalItems = itemRisks.length;
  const issuesFound = itemRisks.filter(item => item.risk_score > 0).length;
  const criticalIssues = itemRisks.filter(item => item.urgency === 'critical').length;
  const highRiskIssues = itemRisks.filter(item => item.urgency === 'high').length;
  const actionsNeeded = itemRisks.filter(item => item.requires_action).length;
  
  // Weighted average risk score
  const totalRiskScore = itemRisks.reduce((sum, item) => {
    const categoryWeight = RISK_CATEGORIES[item.risk_category]?.weight || 1;
    return sum + (item.risk_score * categoryWeight);
  }, 0);
  
  const maxPossibleScore = itemRisks.reduce((sum, item) => {
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
  
  return {
    overall_risk_score: overallRiskScore,
    risk_level: riskLevel,
    total_items: totalItems,
    issues_found: issuesFound,
    critical_issues: criticalIssues,
    high_risk_issues: highRiskIssues,
    actions_needed: actionsNeeded,
    completion_rate: Math.round(((totalItems - issuesFound) / totalItems) * 100),
    priority_interventions: itemRisks
      .filter(item => item.urgency === 'critical' || item.intervention_needed)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
  };
}

/**
 * Generate intervention recommendations
 */
export function generateInterventions(itemRisks: ItemRiskAssessment[]): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  // Group by category for systematic recommendations
  const byCategory = itemRisks.reduce((acc, item) => {
    if (item.risk_score > 0) {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
    }
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
