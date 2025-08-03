export interface ChecklistItem {
  item_key: string;
  label_key: string;
  description_key: string;
  code: string;
  code_system: string;
}

export interface SDOHQuestion {
  id: string;
  label_key: string;
  opt1_key: string;
  opt2_key: string;
  opt3_key: string;
  code: string;
  code_system: string;
}

export interface RiskWeights {
  [key: string]: number;
}

export interface AssessmentData {
  checklist: { [key: string]: boolean };
  sdoh: { [key: string]: string };
  riskScore?: number;
  riskCategory?: 'Low' | 'Moderate' | 'High';
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document';
  timestamp: string;
  entry: FHIREntry[];
}

export interface FHIREntry {
  resource: FHIRResource;
}

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}