// src/types/checklist.ts - Enhanced with Sections and N/A Support

export interface ChecklistItem {
  checklist_id: string;
  item_id: string;
  category: string;
  subcategory: string;
  section: string;                    // NEW: Section grouping
  section_order: number;              // NEW: Order within section
  question_key: string;
  question_text: string;              // NEW: Human-readable question
  question_type: 'assessment' | 'action';
  response_type: 'binary' | 'scale' | 'multiple_choice' | 'numeric';
  response_options: string;           // Now includes 'n/a' for all questions
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
  | 'energy_efficiency'              // NEW: For insulation/efficiency
  | 'chemical_safety'               // NEW: For hazardous materials
  | 'none';

export type Frequency = 
  | 'initial'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'periodic'
  | 'biannual'
  | 'annual'
  | 'every_3_years'
  | 'every_5_years'
  | 'as_needed';

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type Urgency = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type CompletenessFlag = 'complete' | 'incomplete' | 'potentially_deficient';

export interface UserResponse {
  item_id: string;
  value: string;
  timestamp: Date;
}

export interface ResponseMap {
  [item_id: string]: string;
}

export interface SectionNotes {
  [section_name: string]: string;      // NEW: Notes per section (200 char limit)
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
  is_na_response: boolean;            // NEW: Track N/A responses
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
  na_count: number;                   // NEW: Count of N/A responses
  na_percentage: number;              // NEW: Percentage of N/A responses
  completeness_flag: CompletenessFlag; // NEW: Completeness assessment
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
  current_section?: string;           // NEW: Current section being completed
  sections_completed?: number;        // NEW: Number of sections completed
  total_sections?: number;            // NEW: Total number of sections
}

export interface ChecklistInfo {
  id: string;
  name: string;
  region: string;
  description?: string;
  total_sections?: number;            // NEW: Number of sections in checklist
}

export interface SectionProgress {
  section_name: string;
  total_questions: number;
  answered_questions: number;
  percentage: number;
  is_complete: boolean;
}

export interface AssessmentSession {
  checklist_info: ChecklistInfo;
  home_checklist_type: 'taiwan' | 'us' | null;
  include_sdoh: boolean;
  responses: ResponseMap;
  section_notes: SectionNotes;
  current_section?: string;
  started_at: Date;
  last_updated: Date;
}
