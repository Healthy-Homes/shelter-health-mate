// src/types/checklist.ts

export interface ChecklistItem {
  checklist_id: string;
  item_id: string;
  category: string;
  subcategory: string;
  question_key: string;
  question_type: 'assessment' | 'action';
  response_type: 'binary' | 'scale' | 'multiple_choice' | 'numeric';
  response_options: string;
  risk_weight: number;
  risk_category: RiskCategory;
  frequency: Frequency;
  priority: Priority;
  region: 'US' | 'Taiwan';
  requires_action: 'yes' | 'no';
  dependencies: string;
  help_key: string;
}

export type RiskCategory = 
  | 'structural'
  | 'fire_safety'
  | 'electrical_safety'
  | 'water_damage'
  | 'flooding'
  | 'air_quality'
  | 'pest_health'
  | 'injury'
  | 'ventilation'
  | 'freeze_damage'
  | 'privacy'
  | 'social_determinant'
  | 'none';

export type Frequency = 
  | 'initial'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'periodic'    // ADD THIS LINE
  | 'biannual'
  | 'annual'
  | 'every_3_years'
  | 'every_5_years'
  | 'as_needed';

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type Urgency = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface UserResponse {
  item_id: string;
  value: string;
  timestamp: Date;
}

export interface ResponseMap {
  [item_id: string]: string;
}

export interface ItemRiskAssessment {
  item_id: string;
  category: string;
  subcategory: string;
  risk_category: RiskCategory;
  risk_score: number;
  urgency: Urgency;
  requires_action: boolean;
  intervention_needed: boolean;
  raw_response: string;
  response_score: number;
}

export interface OverallRiskAssessment {
  overall_risk_score: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  total_items: number;
  issues_found: number;
  critical_issues: number;
  high_risk_issues: number;
  actions_needed: number;
  completion_rate: number;
  priority_interventions: ItemRiskAssessment[];
}

export interface InterventionRecommendation {
  category: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  intervention_type: 'critical_safety' | 'preventive_maintenance' | 'improvement' | 'monitoring';
  items: string[];
  estimated_cost: 'low' | 'low_moderate' | 'moderate' | 'high' | 'varies';
  timeline: 'immediate' | '1_week' | '1_4_weeks' | '1_3_months' | 'annual';
  professional_required: boolean;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
  remaining: number;
}

export interface ChecklistInfo {
  id: string;
  name: string;
  region: string;
  description?: string;
}
