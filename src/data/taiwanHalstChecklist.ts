// src/data/taiwanHalstChecklist.ts - Recalibrated to 0-100 Range
import { ChecklistItem } from '../types/checklist';

export const TAIWAN_HALST_QUESTIONS: ChecklistItem[] = [
  // Layout and Building Structure Section
  {
    item_id: "HALST_1",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "housing_type",
    question_text: "What type of housing do you live in?",
    response_options: [
      { value: "apartment", label: "Apartment", weight: 0.2 },
      { value: "house", label: "House", weight: 0.1 },
      { value: "dormitory", label: "Dormitory", weight: 0.3 },
      { value: "other", label: "Other", weight: 0.4 }
    ],
    risk_score_yes: 25, // Increased from 20
    risk_score_no: 0,
    priority: "low",
    explanation: "Housing type affects ventilation and environmental control",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_2",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "floor_level",
    question_text: "Which floor do you live on?",
    response_options: [
      { value: "ground", label: "Ground floor", weight: 0.1 },
      { value: "1_3", label: "1st-3rd floor", weight: 0.2 },
      { value: "4_6", label: "4th-6th floor", weight: 0.3 },
      { value: "above_6", label: "Above 6th floor", weight: 0.4 }
    ],
    risk_score_yes: 35, // Increased from 30
    risk_score_no: 0,
    priority: "low",
    explanation: "Higher floors may have different air quality and evacuation challenges",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_3",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "building_age",
    question_text: "How old is your building?",
    response_options: [
      { value: "new", label: "Less than 10 years", weight: 0.1 },
      { value: "moderate", label: "10-30 years", weight: 0.3 },
      { value: "old", label: "More than 30 years", weight: 0.6 }
    ],
    risk_score_yes: 60, // Increased from 50
    risk_score_no: 0,
    priority: "medium",
    explanation: "Older buildings may have outdated ventilation and potential hazardous materials",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_4",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "ventilation",
    question_text: "Does your home have adequate ventilation?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "not_sure", label: "Not sure", weight: 0.5 }
    ],
    risk_score_yes: 0,
    risk_score_no: 85, // Increased from 70 - critical for health
    priority: "critical",
    explanation: "Poor ventilation leads to indoor air quality problems and health issues",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_5",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "natural_light",
    question_text: "Does your home receive adequate natural light?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "partial", label: "Partially", weight: 0.5 }
    ],
    risk_score_yes: 0,
    risk_score_no: 45, // Increased from 40
    priority: "medium",
    explanation: "Inadequate natural light affects mental health and vitamin D synthesis",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_6",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "noise_level",
    question_text: "Is your home affected by excessive noise?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 55, // Increased from 45
    risk_score_no: 0,
    priority: "medium",
    explanation: "Excessive noise affects sleep quality and stress levels",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_7",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "space_adequacy",
    question_text: "Do you have adequate living space for your household size?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "barely", label: "Barely adequate", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 45
    priority: "medium",
    explanation: "Overcrowding increases disease transmission and stress",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_8",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "structural_issues",
    question_text: "Are there any structural problems in your home (cracks, leaks, etc.)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "minor", label: "Minor issues", weight: 0.4 }
    ],
    risk_score_yes: 75, // Increased from 60
    risk_score_no: 0,
    priority: "high",
    explanation: "Structural problems can lead to safety hazards and moisture issues",
    response_type: "multiple_choice"
  },

  // Bedroom Environment Section
  {
    item_id: "HALST_9",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "temperature_control",
    question_text: "Can you control the temperature in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "partially", label: "Partially", weight: 0.5 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 40
    priority: "medium",
    explanation: "Temperature control affects sleep quality and comfort",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_10",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "air_circulation",
    question_text: "Is there adequate air circulation in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "poor", label: "Poor circulation", weight: 0.7 }
    ],
    risk_score_yes: 0,
    risk_score_no: 70, // Increased from 60
    priority: "high",
    explanation: "Poor bedroom air circulation affects sleep and respiratory health",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_11",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "humidity",
    question_text: "Do you experience humidity problems in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 65, // Increased from 55
    risk_score_no: 0,
    priority: "medium",
    explanation: "High humidity promotes mold growth and dust mites",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_12",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "dust_accumulation",
    question_text: "Do you notice excessive dust accumulation in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "moderate", label: "Moderate amount", weight: 0.5 }
    ],
    risk_score_yes: 55, // Increased from 45
    risk_score_no: 0,
    priority: "medium",
    explanation: "Excessive dust can trigger allergies and respiratory issues",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_13",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "mold_mildew",
    question_text: "Do you see any signs of mold or mildew in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "not_sure", label: "Not sure", weight: 0.6 }
    ],
    risk_score_yes: 90, // Increased from 80 - critical health risk
    risk_score_no: 0,
    priority: "critical",
    explanation: "Mold exposure can cause serious respiratory and allergic reactions",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_14",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "pest_control",
    question_text: "Do you have problems with pests (insects, rodents) in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "occasionally", label: "Occasionally", weight: 0.4 }
    ],
    risk_score_yes: 65, // Increased from 55
    risk_score_no: 0,
    priority: "medium",
    explanation: "Pests can carry diseases and trigger allergic reactions",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_15",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "chemical_exposure",
    question_text: "Do you use air fresheners, pesticides, or strong cleaning products in your bedroom?",
    response_options: [
      { value: "yes", label: "Yes, regularly", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 60, // Increased from 50
    risk_score_no: 0,
    priority: "medium",
    explanation: "Chemical products can affect indoor air quality and respiratory health",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_16",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "bedding_cleanliness",
    question_text: "How often do you wash your bedding?",
    response_options: [
      { value: "weekly", label: "Weekly", weight: 0 },
      { value: "biweekly", label: "Every 2 weeks", weight: 0.3 },
      { value: "monthly", label: "Monthly", weight: 0.6 },
      { value: "rarely", label: "Rarely", weight: 1 }
    ],
    risk_score_yes: 45, // Increased from 35
    risk_score_no: 0,
    priority: "low",
    explanation: "Infrequent bedding washing allows dust mites and bacteria to accumulate",
    response_type: "multiple_choice"
  },

  // Kitchen Environment Section
  {
    item_id: "HALST_17",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "ventilation",
    question_text: "Do you have proper ventilation in your kitchen (range hood, fan)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "inadequate", label: "Inadequate", weight: 0.7 }
    ],
    risk_score_yes: 0,
    risk_score_no: 80, // Increased from 70
    priority: "high",
    explanation: "Kitchen ventilation prevents moisture buildup and removes cooking pollutants",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_18",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "moisture_control",
    question_text: "Do you experience excessive moisture or condensation in your kitchen?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 70, // Increased from 60
    risk_score_no: 0,
    priority: "high",
    explanation: "Excessive kitchen moisture promotes mold growth and structural damage",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_19",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "cooking_fumes",
    question_text: "Do cooking fumes and odors linger in your kitchen after cooking?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 55, // Increased from 45
    risk_score_no: 0,
    priority: "medium",
    explanation: "Lingering cooking fumes indicate poor ventilation and air quality",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_20",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "gas_appliances",
    question_text: "Do you have gas appliances in your kitchen?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0.6 },
      { value: "no", label: "No", weight: 0 },
      { value: "some", label: "Some appliances", weight: 0.4 }
    ],
    risk_score_yes: 65, // Increased from 55
    risk_score_no: 0,
    priority: "medium",
    explanation: "Gas appliances can produce combustion byproducts if not properly ventilated",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_21",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "cleanliness",
    question_text: "How would you rate the overall cleanliness of your kitchen?",
    response_options: [
      { value: "excellent", label: "Excellent", weight: 0 },
      { value: "good", label: "Good", weight: 0.2 },
      { value: "fair", label: "Fair", weight: 0.5 },
      { value: "poor", label: "Poor", weight: 1 }
    ],
    risk_score_yes: 60, // Increased from 50
    risk_score_no: 0,
    priority: "medium",
    explanation: "Kitchen cleanliness affects food safety and pest control",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_22",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "water_quality",
    question_text: "Are you satisfied with your kitchen water quality?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "concerns", label: "Have some concerns", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 75, // Increased from 65
    priority: "high",
    explanation: "Poor water quality affects cooking, cleaning, and health",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_23",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "storage_conditions",
    question_text: "Do you have adequate and appropriate food storage conditions?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "limited", label: "Limited storage", weight: 0.5 }
    ],
    risk_score_yes: 0,
    risk_score_no: 50, // Increased from 40
    priority: "medium",
    explanation: "Inadequate food storage can lead to spoilage and pest problems",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_24",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "appliance_maintenance",
    question_text: "Are your kitchen appliances in good working condition?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "some_issues", label: "Some need repair", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Increased from 45
    priority: "medium",
    explanation: "Faulty appliances can pose safety and health risks",
    response_type: "multiple_choice"
  },

  // Bathroom Environment Section
  {
    item_id: "HALST_25",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "ventilation",
    question_text: "Does your bathroom have adequate ventilation?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "poor", label: "Poor ventilation", weight: 0.7 }
    ],
    risk_score_yes: 0,
    risk_score_no: 85, // Increased from 75 - critical for mold prevention
    priority: "critical",
    explanation: "Bathroom ventilation prevents mold growth and moisture damage",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_26",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "moisture_problems",
    question_text: "Do you have moisture problems in your bathroom (condensation, standing water)?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 }
    ],
    risk_score_yes: 80, // Increased from 70
    risk_score_no: 0,
    priority: "high",
    explanation: "Bathroom moisture problems lead to mold growth and structural damage",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_27",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "mold_growth",
    question_text: "Do you see mold or mildew in your bathroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "minor", label: "Minor amounts", weight: 0.5 }
    ],
    risk_score_yes: 95, // Increased from 85 - highest risk
    risk_score_no: 0,
    priority: "critical",
    explanation: "Bathroom mold poses serious respiratory health risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_28",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "cleanliness",
    question_text: "How would you rate your bathroom cleanliness?",
    response_options: [
      { value: "excellent", label: "Excellent", weight: 0 },
      { value: "good", label: "Good", weight: 0.2 },
      { value: "fair", label: "Fair", weight: 0.5 },
      { value: "poor", label: "Poor", weight: 1 }
    ],
    risk_score_yes: 65, // Increased from 55
    risk_score_no: 0,
    priority: "medium",
    explanation: "Bathroom cleanliness affects hygiene and prevents bacterial growth",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_29",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "water_pressure",
    question_text: "Is your bathroom water pressure adequate?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "variable", label: "Variable pressure", weight: 0.4 }
    ],
    risk_score_yes: 0,
    risk_score_no: 35, // Increased from 30
    priority: "low",
    explanation: "Low water pressure affects hygiene and bathroom function",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_30",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "hot_water",
    question_text: "Do you have reliable hot water in your bathroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "inconsistent", label: "Inconsistent", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 45, // Increased from 40
    priority: "medium",
    explanation: "Hot water is essential for proper hygiene and health",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_31",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "plumbing_issues",
    question_text: "Do you have any plumbing problems in your bathroom?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "minor", label: "Minor issues", weight: 0.4 }
    ],
    risk_score_yes: 70, // Increased from 60
    risk_score_no: 0,
    priority: "high",
    explanation: "Plumbing problems can cause water damage and unsanitary conditions",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_32",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "privacy_security",
    question_text: "Does your bathroom provide adequate privacy and security?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "concerns", label: "Some concerns", weight: 0.5 }
    ],
    risk_score_yes: 0,
    risk_score_no: 40, // Increased from 35
    priority: "medium",
    explanation: "Bathroom privacy affects comfort and mental well-being",
    response_type: "multiple_choice"
  },

  // Living Areas Section
  {
    item_id: "HALST_33",
    category: "living_room",
    section: "Living Areas",
    subcategory: "air_quality",
    question_text: "How would you rate the air quality in your living areas?",
    response_options: [
      { value: "excellent", label: "Excellent", weight: 0 },
      { value: "good", label: "Good", weight: 0.2 },
      { value: "fair", label: "Fair", weight: 0.5 },
      { value: "poor", label: "Poor", weight: 1 }
    ],
    risk_score_yes: 75, // Increased from 65
    risk_score_no: 0,
    priority: "high",
    explanation: "Poor air quality in living areas affects daily comfort and health",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_34",
    category: "living_room",
    section: "Living Areas",
    subcategory: "dust_control",
    question_text: "How often do you need to dust your living areas?",
    response_options: [
      { value: "weekly", label: "Weekly or less", weight: 0 },
      { value: "few_days", label: "Every few days", weight: 0.3 },
      { value: "daily", label: "Daily", weight: 0.7 },
      { value: "constantly", label: "Constantly", weight: 1 }
    ],
    risk_score_yes: 55, // Increased from 45
    risk_score_no: 0,
    priority: "medium",
    explanation: "Excessive dust indicates poor air circulation and filtration",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_35",
    category: "living_room",
    section: "Living Areas",
    subcategory: "allergen_control",
    question_text: "Do you or family members experience allergy symptoms at home?",
    response_options: [
      { value: "yes", label: "Yes, frequently", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 },
      { value: "seasonal", label: "Only seasonally", weight: 0.3 }
    ],
    risk_score_yes: 60, // Increased from 50
    risk_score_no: 0,
    priority: "medium",
    explanation: "Indoor allergy symptoms suggest environmental triggers in the home",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_36",
    category: "living_room",
    section: "Living Areas",
    subcategory: "tobacco_smoke",
    question_text: "Is there tobacco smoking in your home?",
    response_options: [
      { value: "yes", label: "Yes, regularly", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "occasionally", label: "Occasionally", weight: 0.6 },
      { value: "outdoors_only", label: "Outdoors only", weight: 0.2 }
    ],
    risk_score_yes: 95, // Increased from 85 - highest risk
    risk_score_no: 0,
    priority: "critical",
    explanation: "Indoor tobacco smoke is a major health hazard for all residents",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_37",
    category: "living_room",
    section: "Living Areas",
    subcategory: "chemical_storage",
    question_text: "Do you store household chemicals, cleaning products, or pesticides in living areas?",
    response_options: [
      { value: "yes", label: "Yes", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "some", label: "Some products", weight: 0.5 }
    ],
    risk_score_yes: 70, // Increased from 60
    risk_score_no: 0,
    priority: "high",
    explanation: "Chemical storage in living areas poses exposure risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_38",
    category: "living_room",
    section: "Living Areas",
    subcategory: "pet_dander",
    question_text: "Do you have pets that spend time in your living areas?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0.4 },
      { value: "no", label: "No", weight: 0 },
      { value: "outdoor_only", label: "Outdoor pets only", weight: 0.1 }
    ],
    risk_score_yes: 40, // Increased from 35
    risk_score_no: 0,
    priority: "low",
    explanation: "Pet dander can trigger allergies in sensitive individuals",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_39",
    category: "living_room",
    section: "Living Areas",
    subcategory: "carpet_condition",
    question_text: "What is the condition of carpets or rugs in your living areas?",
    response_options: [
      { value: "excellent", label: "Excellent/New", weight: 0 },
      { value: "good", label: "Good condition", weight: 0.2 },
      { value: "fair", label: "Fair condition", weight: 0.5 },
      { value: "poor", label: "Poor/Old", weight: 0.8 },
      { value: "no_carpet", label: "No carpets/rugs", weight: 0 }
    ],
    risk_score_yes: 50, // Increased from 40
    risk_score_no: 0,
    priority: "medium",
    explanation: "Old carpets harbor allergens, dust mites, and contaminants",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_40",
    category: "living_room",
    section: "Living Areas",
    subcategory: "air_fresheners",
    question_text: "Do you regularly use air fresheners or scented products in living areas?",
    response_options: [
      { value: "yes", label: "Yes, frequently", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "occasionally", label: "Occasionally", weight: 0.5 }
    ],
    risk_score_yes: 45, // Increased from 35
    risk_score_no: 0,
    priority: "low",
    explanation: "Artificial fragrances can trigger respiratory sensitivity",
    response_type: "multiple_choice"
  },

  // General Conditions Section
  {
    item_id: "HALST_41",
    category: "general",
    section: "General Conditions",
    subcategory: "overall_comfort",
    question_text: "How comfortable do you feel in your home environment overall?",
    response_options: [
      { value: "very_comfortable", label: "Very comfortable", weight: 0 },
      { value: "comfortable", label: "Comfortable", weight: 0.2 },
      { value: "somewhat_comfortable", label: "Somewhat comfortable", weight: 0.5 },
      { value: "uncomfortable", label: "Uncomfortable", weight: 1 }
    ],
    risk_score_yes: 60, // Increased from 50
    risk_score_no: 0,
    priority: "medium",
    explanation: "Overall comfort reflects environmental health and well-being",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_42",
    category: "general",
    section: "General Conditions",
    subcategory: "health_symptoms",
    question_text: "Do you experience health symptoms that you think might be related to your home environment?",
    response_options: [
      { value: "yes", label: "Yes, frequently", weight: 1 },
      { value: "no", label: "No", weight: 0 },
      { value: "sometimes", label: "Sometimes", weight: 0.6 },
      { value: "not_sure", label: "Not sure", weight: 0.4 }
    ],
    risk_score_yes: 80, // Increased from 70
    risk_score_no: 0,
    priority: "high",
    explanation: "Home-related health symptoms indicate environmental hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_43",
    category: "general",
    section: "General Conditions",
    subcategory: "maintenance_ability",
    question_text: "Are you able to maintain your home environment as you would like?",
    response_options: [
      { value: "yes", label: "Yes", weight: 0 },
      { value: "no", label: "No", weight: 1 },
      { value: "partially", label: "Partially", weight: 0.6 },
      { value: "need_help", label: "Need help", weight: 0.8 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Increased from 45
    priority: "medium",
    explanation: "Inability to maintain home affects environmental health conditions",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_44",
    category: "general",
    section: "General Conditions",
    subcategory: "professional_assessment",
    question_text: "Have you had a professional assessment of your home environment?",
    response_options: [
      { value: "yes_recent", label: "Yes, recently", weight: 0 },
      { value: "yes_old", label: "Yes, but long ago", weight: 0.4 },
      { value: "no", label: "No", weight: 0.6 },
      { value: "not_applicable", label: "Not applicable", weight: 0 }
    ],
    risk_score_yes: 35, // Increased from 30
    risk_score_no: 0,
    priority: "low",
    explanation: "Professional assessment helps identify hidden environmental issues",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_45",
    category: "general",
    section: "General Conditions",
    subcategory: "environmental_concerns",
    question_text: "Do you have specific environmental concerns about your home?",
    response_options: [
      { value: "yes", label: "Yes, multiple concerns", weight: 1 },
      { value: "no", label: "No concerns", weight: 0 },
      { value: "few", label: "A few concerns", weight: 0.5 },
      { value: "one", label: "One main concern", weight: 0.3 }
    ],
    risk_score_yes: 65, // Increased from 55
    risk_score_no: 0,
    priority: "medium",
    explanation: "Environmental concerns indicate awareness of potential health risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_46",
    category: "general",
    section: "General Conditions",
    subcategory: "improvement_plans",
    question_text: "Do you have plans to improve your home environment?",
    response_options: [
      { value: "yes_active", label: "Yes, actively planning", weight: 0 },
      { value: "yes_future", label: "Yes, for the future", weight: 0.2 },
      { value: "want_but_unable", label: "Want to but unable", weight: 0.8 },
      { value: "no_plans", label: "No plans", weight: 0.4 }
    ],
    risk_score_yes: 50, // Increased from 40
    risk_score_no: 0,
    priority: "medium",
    explanation: "Inability to improve environment indicates resource or knowledge barriers",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_47",
    category: "general",
    section: "General Conditions",
    subcategory: "seasonal_variations",
    question_text: "Do environmental conditions in your home vary significantly by season?",
    response_options: [
      { value: "yes_major", label: "Yes, major variations", weight: 0.8 },
      { value: "yes_minor", label: "Yes, minor variations", weight: 0.3 },
      { value: "no", label: "No significant variation", weight: 0 },
      { value: "not_sure", label: "Not sure", weight: 0.2 }
    ],
    risk_score_yes: 45, // Increased from 35
    risk_score_no: 0,
    priority: "low",
    explanation: "Seasonal variations may indicate temperature or humidity control issues",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_48",
    category: "general",
    section: "General Conditions",
    subcategory: "satisfaction",
    question_text: "Overall, how satisfied are you with your home's environmental health?",
    response_options: [
      { value: "very_satisfied", label: "Very satisfied", weight: 0 },
      { value: "satisfied", label: "Satisfied", weight: 0.2 },
      { value: "neutral", label: "Neutral", weight: 0.4 },
      { value: "dissatisfied", label: "Dissatisfied", weight: 0.8 },
      { value: "very_dissatisfied", label: "Very dissatisfied", weight: 1 }
    ],
    risk_score_yes: 70, // Increased from 60
    risk_score_no: 0,
    priority: "high",
    explanation: "Dissatisfaction with home environment indicates multiple health risks",
    response_type: "multiple_choice"
  }
];
