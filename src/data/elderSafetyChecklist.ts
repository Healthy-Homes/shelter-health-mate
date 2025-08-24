// src/data/elderSafetyChecklist.ts - Final Recalibrated to 0-100 Range
import { ChecklistItem } from '../types/checklist';

export const ELDER_SAFETY_QUESTIONS: ChecklistItem[] = [
  // Floors Section
  {
    item_id: "ELDER_1",
    category: "floors",
    section: "Floors",
    subcategory: "clutter",
    question_text: "Are there papers, shoes, books, or other objects on the floors?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 }
    ],
    risk_score_yes: 75, // Increased from 70 - major fall risk
    risk_score_no: 0,
    priority: "high",
    explanation: "Objects on floors are major fall hazards for older adults",
    response_type: "binary"
  },
  {
    item_id: "ELDER_2",
    category: "floors",
    section: "Floors",
    subcategory: "rugs",
    question_text: "Do you have scatter rugs on the floor?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 }
    ],
    risk_score_yes: 65, // Increased from 50 - fall hazard
    risk_score_no: 0,
    priority: "medium",
    explanation: "Scatter rugs can cause trips and falls",
    response_type: "binary"
  },
  {
    item_id: "ELDER_3",
    category: "floors",
    section: "Floors",
    subcategory: "rugs_secured",
    question_text: "Are your rugs anchored down and do they lie flat?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No rugs", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 60, // Increased from 50
    priority: "medium",
    explanation: "Unsecured rugs are trip hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_4",
    category: "floors",
    section: "Floors",
    subcategory: "surface_condition",
    question_text: "Are your floors in good condition (no broken or uneven areas)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 80, // Increased from 70 - serious fall risk
    priority: "high",
    explanation: "Broken or uneven floors pose serious fall risks",
    response_type: "binary"
  },

  // Stairs and Steps Section
  {
    item_id: "ELDER_5",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "handrails",
    question_text: "Are handrails installed on both sides of the stairs?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 85, // Increased from 70 - critical safety feature
    priority: "critical",
    explanation: "Handrails are essential fall prevention on stairs",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_6",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "handrail_condition",
    question_text: "Are the handrails sturdy and in good repair?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No stairs/handrails", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 80, // Increased from 70
    priority: "high",
    explanation: "Damaged handrails cannot provide safe support",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_7",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "stair_condition",
    question_text: "Are the steps broken or uneven?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 90, // Increased from 80 - extremely dangerous
    risk_score_no: 0,
    priority: "critical",
    explanation: "Broken or uneven steps are extremely dangerous fall hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_8",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "objects_on_stairs",
    question_text: "Are there papers, shoes, books, or other objects on the stairs?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 85, // Increased from 70 - very dangerous
    risk_score_no: 0,
    priority: "critical",
    explanation: "Objects on stairs create severe fall risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_9",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "stair_lighting",
    question_text: "Do you have good lighting on the stairs?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 75, // Increased from 60
    priority: "high",
    explanation: "Poor stair lighting increases fall risk",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_10",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "light_switches",
    question_text: "Do you have light switches at both the top and bottom of the stairs?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 65, // Increased from 50
    priority: "medium",
    explanation: "Accessible light switches improve stair safety",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_11",
    category: "stairs",
    section: "Stairs and Steps",
    subcategory: "step_edges",
    question_text: "Can you clearly see the edges of the steps?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No stairs", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 60
    priority: "high",
    explanation: "Visible step edges are crucial for safe navigation",
    response_type: "multiple_choice"
  },

  // Kitchen Section
  {
    item_id: "ELDER_12",
    category: "kitchen",
    section: "Kitchen",
    subcategory: "spills",
    question_text: "Are spills wiped up right away?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 60
    priority: "high",
    explanation: "Kitchen spills create serious slip hazards",
    response_type: "binary"
  },
  {
    item_id: "ELDER_13",
    category: "kitchen",
    section: "Kitchen",
    subcategory: "storage_height",
    question_text: "Are the things you use often within easy reach?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Increased from 40
    priority: "medium",
    explanation: "Items stored too high require unsafe reaching or climbing",
    response_type: "binary"
  },

  // Bedrooms Section
  {
    item_id: "ELDER_14",
    category: "bedrooms",
    section: "Bedrooms",
    subcategory: "path_lighting",
    question_text: "Is there a lamp or light switch within reach of your bed?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 30
    priority: "medium",
    explanation: "Accessible lighting prevents falls when getting up at night",
    response_type: "binary"
  },
  {
    item_id: "ELDER_15",
    category: "bedrooms",
    section: "Bedrooms",
    subcategory: "path_to_bathroom",
    question_text: "Is the path from your bed to the bathroom clear?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 75, // Increased from 60 - nighttime fall risk
    priority: "high",
    explanation: "Clear bathroom path is essential for nighttime safety",
    response_type: "binary"
  },
  {
    item_id: "ELDER_16",
    category: "bedrooms",
    section: "Bedrooms",
    subcategory: "phone_access",
    question_text: "Do you have a phone next to your bed?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 40, // Increased from 30
    priority: "low",
    explanation: "Bedside phone enables emergency calls without movement",
    response_type: "binary"
  },

  // Bathrooms Section
  {
    item_id: "ELDER_17",
    category: "bathrooms",
    section: "Bathrooms",
    subcategory: "grab_bars",
    question_text: "Are there grab bars in your tub or shower?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No tub/shower", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 85, // Increased from 70 - critical safety feature
    priority: "critical",
    explanation: "Grab bars are essential for bathroom safety",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_18",
    category: "bathrooms",
    section: "Bathrooms",
    subcategory: "slip_surface",
    question_text: "Is the tub or shower floor slippery?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "not_applicable", label: "No tub/shower", weight: 0 }
    ],
    risk_score_yes: 80, // Increased from 70 - major slip risk
    risk_score_no: 0,
    priority: "high",
    explanation: "Slippery bathroom surfaces cause serious falls",
    response_type: "multiple_choice"
  },

  // Living Areas Section
  {
    item_id: "ELDER_19",
    category: "living_areas",
    section: "Living Areas",
    subcategory: "furniture_arrangement",
    question_text: "Are the chairs and sofas the right height (not too low or too high)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 45, // Increased from 30
    priority: "low",
    explanation: "Proper furniture height makes sitting and standing safer",
    response_type: "binary"
  },
  {
    item_id: "ELDER_20",
    category: "living_areas",
    section: "Living Areas",
    subcategory: "electrical_cords",
    question_text: "Do you have to walk over or around wires or cords?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 }
    ],
    risk_score_yes: 70, // Increased from 60 - trip hazard
    risk_score_no: 0,
    priority: "high",
    explanation: "Electrical cords create dangerous trip hazards",
    response_type: "binary"
  },

  // Fire Safety Section
  {
    item_id: "ELDER_21",
    category: "fire_safety",
    section: "Fire Safety",
    subcategory: "smoke_alarms",
    question_text: "Do you have smoke alarms on every level of your home?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 100, // Increased from 80 - absolutely critical
    priority: "critical",
    explanation: "Smoke alarms are essential for fire safety and survival",
    response_type: "binary"
  },
  {
    item_id: "ELDER_22",
    category: "fire_safety",
    section: "Fire Safety",
    subcategory: "alarm_batteries",
    question_text: "Have you tested the batteries in your smoke alarms in the past year?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No smoke alarms", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 85, // Increased from 60
    priority: "critical",
    explanation: "Smoke alarm maintenance is critical for fire safety",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_23",
    category: "fire_safety",
    section: "Fire Safety",
    subcategory: "escape_plan",
    question_text: "Do you have a fire escape plan?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 50
    priority: "high",
    explanation: "Fire escape plans save lives in emergencies",
    response_type: "binary"
  },
  {
    item_id: "ELDER_24",
    category: "fire_safety",
    section: "Fire Safety",
    subcategory: "heating_safety",
    question_text: "Are space heaters and fireplaces used safely (clear of flammable items)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "Don't use these", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 90, // Increased from 70 - fire hazard
    priority: "critical",
    explanation: "Unsafe heating equipment is a major fire risk",
    response_type: "multiple_choice"
  },

  // Electrical Safety Section
  {
    item_id: "ELDER_25",
    category: "electrical",
    section: "Electrical Safety",
    subcategory: "outlet_overload",
    question_text: "Are electrical outlets overloaded with too many plugs?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 }
    ],
    risk_score_yes: 75, // Increased from 60 - fire risk
    risk_score_no: 0,
    priority: "high",
    explanation: "Overloaded outlets can cause fires",
    response_type: "binary"
  },
  {
    item_id: "ELDER_26",
    category: "electrical",
    section: "Electrical Safety",
    subcategory: "cord_condition",
    question_text: "Are electrical cords in good condition (not frayed or damaged)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 80, // Increased from 70 - fire/shock risk
    priority: "high",
    explanation: "Damaged electrical cords pose fire and shock risks",
    response_type: "binary"
  },
  {
    item_id: "ELDER_27",
    category: "electrical",
    section: "Electrical Safety",
    subcategory: "gfci_protection",
    question_text: "Do you have GFCI outlets in bathrooms and kitchen areas?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_sure", label: "Not sure", weight: 0.7 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 50
    priority: "high",
    explanation: "GFCI protection prevents electrical shock in wet areas",
    response_type: "multiple_choice"
  },

  // Medications Section
  {
    item_id: "ELDER_28",
    category: "medications",
    section: "Medications",
    subcategory: "storage_security",
    question_text: "Are your medications stored safely and securely?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No medications", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 60, // Increased from 40
    priority: "medium",
    explanation: "Secure medication storage prevents accidental poisoning",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_29",
    category: "medications",
    section: "Medications",
    subcategory: "medication_lighting",
    question_text: "Do you have good lighting when taking medications?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No medications", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 65, // Increased from 50
    priority: "medium",
    explanation: "Good lighting prevents medication errors",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_30",
    category: "medications",
    section: "Medications",
    subcategory: "expiration_check",
    question_text: "Do you regularly check medication expiration dates?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No medications", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 45, // Increased from 30
    priority: "low",
    explanation: "Expired medications can be ineffective or harmful",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_31",
    category: "medications",
    section: "Medications",
    subcategory: "organization",
    question_text: "Do you use a pill organizer or system to track medications?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No medications", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Increased from 40
    priority: "medium",
    explanation: "Medication organization prevents dosing errors",
    response_type: "multiple_choice"
  },

  // General Safety Section
  {
    item_id: "ELDER_32",
    category: "general",
    section: "General Safety",
    subcategory: "carbon_monoxide",
    question_text: "Do you have carbon monoxide detectors in your home?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No gas appliances", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 95, // Increased from 80 - deadly gas
    priority: "critical",
    explanation: "Carbon monoxide detectors prevent deadly poisoning",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_33",
    category: "general",
    section: "General Safety",
    subcategory: "emergency_numbers",
    question_text: "Do you have emergency phone numbers posted where you can easily see them?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 40
    priority: "medium",
    explanation: "Accessible emergency numbers enable quick response",
    response_type: "binary"
  },
  {
    item_id: "ELDER_34",
    category: "general",
    section: "General Safety",
    subcategory: "flashlights",
    question_text: "Do you have working flashlights and extra batteries?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 40, // Increased from 30
    priority: "low",
    explanation: "Flashlights are essential during power outages",
    response_type: "binary"
  },
  {
    item_id: "ELDER_35",
    category: "general",
    section: "General Safety",
    subcategory: "first_aid",
    question_text: "Do you have a well-stocked first aid kit?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 45, // Increased from 35
    priority: "low",
    explanation: "First aid supplies enable response to minor injuries",
    response_type: "binary"
  },
  {
    item_id: "ELDER_36",
    category: "general",
    section: "General Safety",
    subcategory: "door_locks",
    question_text: "Are your door locks in good working condition?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 30
    priority: "medium",
    explanation: "Working locks provide security and safety",
    response_type: "binary"
  },
  {
    item_id: "ELDER_37",
    category: "general",
    section: "General Safety",
    subcategory: "home_temperature",
    question_text: "Can you maintain a comfortable temperature in your home year-round?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 60, // Increased from 40
    priority: "medium",
    explanation: "Temperature extremes pose health risks for older adults",
    response_type: "binary"
  },
  {
    item_id: "ELDER_38",
    category: "general",
    section: "General Safety",
    subcategory: "regular_maintenance",
    question_text: "Is your home's heating and cooling system regularly maintained?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_applicable", label: "No HVAC system", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Increased from 40
    priority: "medium",
    explanation: "HVAC maintenance ensures safe and efficient operation",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_39",
    category: "general",
    section: "General Safety",
    subcategory: "water_temperature",
    question_text: "Is your water heater temperature set to 120°F (49°C) or below?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_sure", label: "Not sure", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 65, // Increased from 50 - burn risk
    priority: "medium",
    explanation: "High water temperature can cause serious burns",
    response_type: "multiple_choice"
  },
  {
    item_id: "ELDER_40",
    category: "general",
    section: "General Safety",
    subcategory: "home_security",
    question_text: "Do you feel safe and secure in your home?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 40
    priority: "high",
    explanation: "Feeling unsafe indicates security or environmental concerns",
    response_type: "binary"
  }
];
