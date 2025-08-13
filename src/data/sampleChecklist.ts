// src/data/sampleChecklist.ts

import { ChecklistItem } from '../types/checklist';

export const SAMPLE_US_CHECKLIST: ChecklistItem[] = [
  {
    checklist_id: "US_NCHH",
    item_id: "US001",
    category: "exterior",
    subcategory: "drainage",
    question_key: "ext.water_drainage",
    question_type: "assessment",
    response_type: "binary",
    response_options: "yes,no",
    risk_weight: 3,
    risk_category: "water_damage",
    frequency: "spring",
    priority: "medium",
    region: "US",
    requires_action: "yes",
    dependencies: "",
    help_key: "ext.water_drainage_help"
  },
  {
    checklist_id: "US_NCHH",
    item_id: "US002",
    category: "exterior",
    subcategory: "safety",
    question_key: "ext.trip_hazards",
    question_type: "assessment",
    response_type: "binary",
    response_options: "none,present",
    risk_weight: 2,
    risk_category: "injury",
    frequency: "seasonal",
    priority: "medium",
    region: "US",
    requires_action: "yes",
    dependencies: "",
    help_key: "ext.trip_hazards_help"
  },
  {
    checklist_id: "US_NCHH",
    item_id: "US003",
    category: "interior",
    subcategory: "electrical",
    question_key: "elec.damaged_cords",
    question_type: "assessment",
    response_type: "scale",
    response_options: "none,minor,moderate,severe",
    risk_weight: 5,
    risk_category: "electrical_safety",
    frequency: "seasonal",
    priority: "critical",
    region: "US",
    requires_action: "yes",
    dependencies: "",
    help_key: "elec.damaged_cords_help"
  }
];

export const SAMPLE_TAIWAN_CHECKLIST: ChecklistItem[] = [
  {
    checklist_id: "TW_HUALIEN",
    item_id: "TW001",
    category: "layout",
    subcategory: "A1a",
    question_key: "layout.building_type",
    question_type: "assessment",
    response_type: "multiple_choice",
    response_options: "townhouse,detached house,apartment,rooftop addition",
    risk_weight: 1,
    risk_category: "none",
    frequency: "initial",
    priority: "low",
    region: "Taiwan",
    requires_action: "no",
    dependencies: "",
    help_key: "layout.building_type_help"
  },
  {
    checklist_id: "TW_HUALIEN",
    item_id: "TW002",
    category: "bedroom",
    subcategory: "B1a",
    question_key: "bedroom.visible_mold",
    question_type: "assessment",
    response_type: "scale",
    response_options: "none,a little,some,a lot",
    risk_weight: 4,
    risk_category: "water_damage",
    frequency: "monthly",
    priority: "high",
    region: "Taiwan",
    requires_action: "yes",
    dependencies: "",
    help_key: "bedroom.visible_mold_help"
  }
];

// Combined sample data for testing
export const ALL_SAMPLE_CHECKLISTS: ChecklistItem[] = [
  ...SAMPLE_US_CHECKLIST,
  ...SAMPLE_TAIWAN_CHECKLIST
];

// Helper to get sample checklist by ID
export function getSampleChecklist(checklistId: string): ChecklistItem[] {
  return ALL_SAMPLE_CHECKLISTS.filter(item => item.checklist_id === checklistId);
}
