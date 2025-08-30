// src/data/taiwanHalstChecklist.ts - Authentic HALST Clinical Instrument
import { ChecklistItem } from '../types/checklist';

export const TAIWAN_HALST_QUESTIONS: ChecklistItem[] = [
  // Layout and Building Structure Section
  {
    item_id: "HALST_A1a",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "building_type",
    question_text: "What type of building is this residence?",
    response_options: [
      { value: "townhouse", label: "Townhouse", weight: 0.3 },
      { value: "detached_house", label: "Detached house", weight: 0.1 },
      { value: "apartment", label: "Apartment (Is there an elevator?)", weight: 0.4 },
      { value: "rooftop_addition", label: "Rooftop addition (location of bedroom or living room)", weight: 0.8 }
    ],
    clinical_codes: {
      loinc: "71802-3", // Housing characteristics
      snomed: "224930009", // Housing assessment
      category: "social-determinant"
    },
    risk_score_yes: 0, // Calculated from weight
    risk_score_no: 0,
    priority: "medium",
    explanation: "Building type affects structural safety and environmental health risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A1b",
    category: "layout",
    section: "Layout and Building Structure", 
    subcategory: "occupancy_type",
    question_text: "What part of the building does the respondent occupy?",
    response_options: [
      { value: "entire_building", label: "Occupies the entire building", weight: 0.1 },
      { value: "entire_floor", label: "Occupies an entire floor", weight: 0.3 },
      { value: "shared_floor", label: "Shares a floor with others", weight: 0.7 }
    ],
    clinical_codes: {
      loinc: "71802-3",
      category: "social-determinant"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Occupancy density affects privacy, noise exposure, and infection transmission risk",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A2a",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "building_floors",
    question_text: "How many floors does this building have aboveground (inclusive of rooftop additions)?",
    response_options: [
      { value: "1_floor", label: "1 floor", weight: 0.1 },
      { value: "2_floors", label: "2 floors", weight: 0.2 },
      { value: "3_4_floors", label: "3-4 floors", weight: 0.4 },
      { value: "5_plus_floors", label: "5+ floors", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Building height affects evacuation risks and structural stability",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A2b", 
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "basement_presence",
    question_text: "Does this building have any basement floors (including a parking garage)?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 0.4 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0, 
    priority: "low",
    explanation: "Basements can have moisture and air quality issues",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A3a",
    category: "layout", 
    section: "Layout and Building Structure",
    subcategory: "bedroom_floor",
    question_text: "On which floor of the building is the participant's bedroom? (if the participant sleeps in the living room, consider it as their bedroom)",
    response_options: [
      { value: "ground_floor", label: "Ground floor", weight: 0.2 },
      { value: "1st_floor", label: "1st floor", weight: 0.1 },
      { value: "2nd_floor", label: "2nd floor", weight: 0.2 },
      { value: "3rd_plus_floor", label: "3rd floor or higher", weight: 0.4 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low", 
    explanation: "Floor level affects evacuation access and air quality exposure",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A3b",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "living_room_presence",
    question_text: "Does this home have a living room? (answer 'no' if the participant sleeps in the living room)",
    response_options: [
      { value: "no", label: "No", weight: 0.6 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 55, // Higher risk for overcrowding/inadequate space
    priority: "medium",
    explanation: "Lack of separate living space indicates overcrowding and reduced quality of life",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A3e",
    category: "layout",
    section: "Layout and Building Structure", 
    subcategory: "bedroom_doorway",
    question_text: "What type of doorway does the bedroom have? (if the living room is considered the bedroom, this describes the doorway to the kitchen)",
    response_options: [
      { value: "closable_door", label: "Closable door", weight: 0 },
      { value: "open_doorway", label: "Open doorway", weight: 0.4 },
      { value: "open_wall", label: "Open wall", weight: 0.7 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Privacy and sound control affect sleep quality and mental well-being",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A4a", 
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "kitchen_presence",
    question_text: "Does this home have a kitchen? (cooking appliances inside the bedroom does not qualify)",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 75, // High risk for inadequate living conditions
    priority: "high",
    explanation: "Lack of proper kitchen facilities affects nutrition and food safety",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_A5",
    category: "layout",
    section: "Layout and Building Structure",
    subcategory: "bedroom_bathroom",
    question_text: "Is there a bathroom inside the participant's bedroom? (if 'yes' inspect this bathroom in the later section, if 'no' inspect the bathroom in which the participant bathes)",
    response_options: [
      { value: "no", label: "No", weight: 0.2 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Bathroom accessibility affects convenience and hygiene",
    response_type: "multiple_choice"
  },

  // Bedroom Environment Section (Day 1)
  {
    item_id: "HALST_B1",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "mold_odor",
    question_text: "What is the level of mold odor in the bedroom? (evaluate upon entering the room)",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "weak_slight", label: "Weak or slight", weight: 0.5 },
      { value: "strong", label: "Strong", weight: 1 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental mold exposure
      snomed: "84489001", // Mold exposure
      category: "environmental-exposure"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "high",
    explanation: "Mold odor indicates potential respiratory health hazards and moisture problems",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B2",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "ceiling_material", 
    question_text: "What material is the bedroom ceiling composed of?",
    response_options: [
      { value: "concrete", label: "Concrete", weight: 0.3 },
      { value: "wallpaper", label: "Wallpaper", weight: 0.6 },
      { value: "natural_wood", label: "Natural wood", weight: 0.2 },
      { value: "plastic_material", label: "Plastic material", weight: 0.4 },
      { value: "fiberboard", label: "Fiberboard (may look like wood)", weight: 0.5 },
      { value: "gypsum_tile", label: "Gypsum ceiling tile", weight: 0.1 },
      { value: "other", label: "Other", weight: 0.4 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Ceiling materials affect air quality and potential hazardous material exposure",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B3",
    category: "bedroom", 
    section: "Bedroom Environment",
    subcategory: "wall_material",
    question_text: "What material is the bedroom walls composed of?",
    response_options: [
      { value: "concrete", label: "Concrete", weight: 0.3 },
      { value: "wallpaper", label: "Wallpaper", weight: 0.6 },
      { value: "natural_wood", label: "Natural wood", weight: 0.2 },
      { value: "plastic_material", label: "Plastic material", weight: 0.4 },
      { value: "fiberboard", label: "Fiberboard (may look like wood)", weight: 0.5 },
      { value: "drywall", label: "Drywall", weight: 0.1 },
      { value: "other", label: "Other", weight: 0.4 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low", 
    explanation: "Wall materials can harbor allergens and affect indoor air quality",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B4",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "floor_material",
    question_text: "What material is the bedroom floor composed of?",
    response_options: [
      { value: "stone_tile", label: "Stone or tile", weight: 0.1 },
      { value: "concrete", label: "Concrete", weight: 0.3 },
      { value: "artificial_wood", label: "Artificial wood", weight: 0.2 },
      { value: "hardwood", label: "Hardwood", weight: 0.1 },
      { value: "carpet", label: "Carpet", weight: 0.7 },
      { value: "other", label: "Other", weight: 0.3 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Floor materials affect allergen accumulation and cleaning difficulty",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B5",
    category: "bedroom",
    section: "Bedroom Environment", 
    subcategory: "water_stains",
    question_text: "What is the combined area of water stains?",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "less_than_a4", label: "Less than A4 paper", weight: 0.4 },
      { value: "a4_to_door", label: "More than A4 paper and less than a standard door", weight: 0.7 },
      { value: "more_than_door", label: "More than a standard door", weight: 1 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental assessment
      category: "environmental-exposure"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Water stains indicate moisture problems that can lead to mold growth",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B6a",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "visible_mold",
    question_text: "What is the combined area of visible mold?",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "less_than_a4", label: "Less than A4 paper", weight: 0.6 },
      { value: "a4_to_door", label: "More than A4 paper and less than a standard door", weight: 0.8 },
      { value: "more_than_door", label: "More than a standard door", weight: 1 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental mold exposure
      snomed: "84489001", // Mold exposure
      category: "environmental-exposure" 
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "critical",
    explanation: "Visible mold poses serious respiratory health risks and indicates moisture problems",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B7",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "wall_cancer", 
    question_text: "What is the combined area of wall cancer (bì ái)?",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "less_than_a4", label: "Less than A4 paper", weight: 0.5 },
      { value: "a4_to_door", label: "More than A4 paper and less than a standard door", weight: 0.7 },
      { value: "more_than_door", label: "More than a standard door", weight: 1 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "high",
    explanation: "Wall deterioration indicates structural moisture problems and potential health hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B8",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "inspection_completeness",
    question_text: "Are there any walls that could not be fully inspected?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 0.4 }
    ],
    risk_score_yes: 30,
    risk_score_no: 0,
    priority: "low",
    explanation: "Incomplete inspection may miss important environmental health hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B9",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "potted_plants",
    question_text: "How many potted plants are in the bedroom?",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "1_2", label: "1-2 plants", weight: 0.1 },
      { value: "3_5", label: "3-5 plants", weight: 0.3 },
      { value: "more_than_5", label: "More than 5 plants", weight: 0.6 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Excessive plants can increase humidity and allergen exposure",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_B10a",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "mattress_placement",
    question_text: "Is the mattress placed directly on the floor?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 0.6 }
    ],
    risk_score_yes: 45,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Floor-placed mattresses have poor air circulation and increased dust mite exposure",
    response_type: "multiple_choice"
  },

  // Bedroom Environment Section (Day 8 - Behavioral patterns)  
  {
    item_id: "HALST_E2a",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "balcony_door_presence",
    question_text: "Is there a balcony door inside this room? (if the living room is considered to be the bedroom, this includes any exterior door)",
    response_options: [
      { value: "no", label: "No", weight: 0.3 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 25,
    priority: "low", 
    explanation: "Lack of exterior access affects ventilation and emergency egress",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_E2c",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "balcony_door_usage",
    question_text: "In the past week, when did you normally open the balcony door or balcony door window?",
    response_options: [
      { value: "never", label: "Never", weight: 0.8 },
      { value: "morning", label: "Morning", weight: 0.1 },
      { value: "afternoon", label: "Afternoon", weight: 0.2 },
      { value: "evening_sleep", label: "Evening/during sleep", weight: 0.3 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental assessment  
      category: "behavioral-pattern"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Ventilation patterns affect indoor air quality and pollutant exposure",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_E3a", 
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "exterior_windows",
    question_text: "Does this room have any exterior windows?",
    response_options: [
      { value: "no", label: "No", weight: 0.7 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    risk_score_yes: 0,
    risk_score_no: 65, // High risk for poor air quality
    priority: "high",
    explanation: "Lack of exterior windows severely limits natural ventilation and light",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_E3c",
    category: "bedroom", 
    section: "Bedroom Environment",
    subcategory: "window_usage",
    question_text: "In the past week, when did you normally open the window?",
    response_options: [
      { value: "never", label: "Never", weight: 0.8 },
      { value: "morning", label: "Morning", weight: 0.1 },
      { value: "afternoon", label: "Afternoon", weight: 0.2 },
      { value: "evening_sleep", label: "Evening/during sleep", weight: 0.3 }
    ],
    clinical_codes: {
      loinc: "72133-2",
      category: "behavioral-pattern"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Window usage patterns directly affect indoor air quality and ventilation",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_E10",
    category: "bedroom",
    section: "Bedroom Environment", 
    subcategory: "occupancy_density",
    question_text: "In the past week, how many people regularly slept in this room?",
    response_options: [
      { value: "1_person", label: "1 person", weight: 0 },
      { value: "2_people", label: "2 people", weight: 0.2 },
      { value: "3_people", label: "3 people", weight: 0.5 },
      { value: "4_plus_people", label: "4+ people", weight: 0.8 }
    ],
    clinical_codes: {
      loinc: "71802-3", // Housing characteristics
      category: "social-determinant"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Bedroom overcrowding affects air quality, disease transmission, and sleep quality",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_E14a",
    category: "bedroom",
    section: "Bedroom Environment",
    subcategory: "cooking_in_bedroom",
    question_text: "In the past week, did you cook food or boil water in the bedroom?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 1 }
    ],
    risk_score_yes: 85, // Very high risk for indoor air pollution
    risk_score_no: 0,
    priority: "critical",
    explanation: "Cooking in bedroom creates serious fire, air quality, and safety hazards",
    response_type: "multiple_choice"
  },

  // General Conditions Section
  {
    item_id: "HALST_D1",
    category: "general",
    section: "General Conditions",
    subcategory: "building_age",
    question_text: "How old is this building?",
    response_options: [
      { value: "less_than_5", label: "Less than 5 years", weight: 0.1 },
      { value: "5_15_years", label: "5-15 years", weight: 0.2 },
      { value: "15_30_years", label: "15-30 years", weight: 0.4 },
      { value: "more_than_30", label: "More than 30 years", weight: 0.7 }
    ],
    clinical_codes: {
      loinc: "71802-3", // Housing characteristics
      category: "social-determinant"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Building age affects structural integrity, materials safety, and maintenance needs",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D2",
    category: "general", 
    section: "General Conditions",
    subcategory: "household_size",
    question_text: "How many people reside in this home?",
    response_options: [
      { value: "1_person", label: "1 person", weight: 0.1 },
      { value: "2_people", label: "2 people", weight: 0.2 },
      { value: "3_4_people", label: "3-4 people", weight: 0.3 },
      { value: "5_plus_people", label: "5+ people", weight: 0.6 }
    ],
    clinical_codes: {
      loinc: "71802-3",
      category: "social-determinant"  
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Household density affects overcrowding risk and disease transmission potential",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D3",
    category: "general",
    section: "General Conditions",
    subcategory: "indoor_pets",
    question_text: "Do you have any indoor pets? (excluding fish)",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "dog", label: "Dog", weight: 0.3 },
      { value: "cat", label: "Cat", weight: 0.4 },
      { value: "other", label: "Other", weight: 0.3 }
    ],
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "low",
    explanation: "Indoor pets can trigger allergies and affect air quality for sensitive individuals",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D4a",
    category: "general",
    section: "General Conditions", 
    subcategory: "incense_burning",
    question_text: "In the past week, did you burn incense indoors?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 0.6 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental exposure
      category: "environmental-exposure"
    },
    risk_score_yes: 45,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Indoor incense burning contributes to particulate matter and air pollution",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D5a",
    category: "general",
    section: "General Conditions",
    subcategory: "indoor_smoking",
    question_text: "In the past week, were there any sources of smoke indoors apart from incense burning and cooking (such as cigarette smoking)?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 1 }
    ],
    clinical_codes: {
      loinc: "72166-2", // Tobacco smoke exposure
      snomed: "102408007", // Tobacco smoke exposure
      category: "environmental-exposure"
    },
    risk_score_yes: 95, // Critical health risk
    risk_score_no: 0,
    priority: "critical",
    explanation: "Indoor tobacco smoking creates severe health hazards for all occupants",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D6a",
    category: "general", 
    section: "General Conditions",
    subcategory: "gas_water_heater",
    question_text: "Does this home have an indoor gas water heater?",
    response_options: [
      { value: "no", label: "No", weight: 0 },
      { value: "yes", label: "Yes", weight: 0.6 }
    ],
    risk_score_yes: 50,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Indoor gas water heaters can produce combustion byproducts if not properly ventilated",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D7",
    category: "general",
    section: "General Conditions",
    subcategory: "smoke_detector",
    question_text: "Does this home have a functional smoke detector?",
    response_options: [
      { value: "no", label: "No", weight: 1 },
      { value: "yes", label: "Yes", weight: 0 },
      { value: "unsure", label: "Unsure", weight: 0.7 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Home safety assessment
      snomed: "224930009", // Home safety equipment
      category: "safety-equipment"
    },
    risk_score_yes: 0,
    risk_score_no: 90, // Critical safety risk
    priority: "critical",
    explanation: "Functional smoke detectors are essential for fire safety and survival",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_D8",
    category: "general",
    section: "General Conditions", 
    subcategory: "co_detector",
    question_text: "Does this home have a functional carbon monoxide detector?",
    response_options: [
      { value: "no", label: "No", weight: 1 },
      { value: "yes", label: "Yes", weight: 0 },
      { value: "unsure", label: "Unsure", weight: 0.8 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Home safety assessment  
      snomed: "224930009", // Home safety equipment
      category: "safety-equipment"
    },
    risk_score_yes: 0,
    risk_score_no: 85, // High safety risk
    priority: "critical",
    explanation: "Carbon monoxide detectors prevent deadly poisoning from gas appliances",
    response_type: "multiple_choice"
  },

  // Safety Assessment Section
  {
    item_id: "HALST_I1a",
    category: "safety",
    section: "Home Safety",
    subcategory: "rug_safety",
    question_text: "Are rugs and floor mats without rolled-up edges?",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 },
      { value: "na", label: "N/A (no floor mats)", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment
      snomed: "217082002", // Fall risk
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 65,
    priority: "high", 
    explanation: "Rolled-up rug edges create serious trip and fall hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_I1c",
    category: "safety",
    section: "Home Safety",
    subcategory: "cord_safety",
    question_text: "Are all cords and furniture clear of walkways and neatly stowed away to avoid tripping?",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 60,
    priority: "high",
    explanation: "Cords and furniture in walkways create dangerous trip hazards",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_I2a",
    category: "safety",
    section: "Home Safety", 
    subcategory: "lighting_adequacy",
    question_text: "Are the indoor lights bright?",
    response_options: [
      { value: "no", label: "No", weight: 0.7 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 55,
    priority: "medium",
    explanation: "Poor lighting increases fall risk and affects daily activities",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_I6a",
    category: "safety",
    section: "Home Safety",
    subcategory: "floor_clutter",
    question_text: "Are the floors cleared of clutter?",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 70,
    priority: "high",
    explanation: "Floor clutter creates major trip hazards and prevents safe navigation",
    response_type: "multiple_choice"
  },

  // Kitchen Environment Section
  {
    item_id: "HALST_G3",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "range_hood_usage",
    question_text: "In the past week, how often was the range hood used when cooking with the gas stove?",
    response_options: [
      { value: "never", label: "Never", weight: 1 },
      { value: "sometimes", label: "Sometimes", weight: 0.5 },
      { value: "every_time", label: "Every time", weight: 0 },
      { value: "na", label: "N/A (no range hood)", weight: 0.8 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental exposure
      category: "environmental-exposure"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "high",
    explanation: "Range hood usage prevents indoor air pollution from cooking combustion",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_G4",
    category: "kitchen",
    section: "Kitchen Environment",
    subcategory: "cooking_ventilation",
    question_text: "In the past week, when did you normally open exterior windows or doors?",
    response_options: [
      { value: "never", label: "Never", weight: 0.8 },
      { value: "during_after_cooking", label: "During/after cooking", weight: 0.1 },
      { value: "always", label: "Always", weight: 0 },
      { value: "na", label: "N/A (no exterior openings)", weight: 0.7 }
    ],
    clinical_codes: {
      loinc: "72133-2",
      category: "behavioral-pattern"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Kitchen ventilation during cooking reduces indoor pollutant accumulation",
    response_type: "multiple_choice"
  },

  // Bathroom Environment Section  
  {
    item_id: "HALST_H1",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "bathroom_mold",
    question_text: "What is the combined area of visible mold?",
    response_options: [
      { value: "none", label: "None", weight: 0 },
      { value: "less_than_a4", label: "Less than A4 paper", weight: 0.6 },
      { value: "a4_to_door", label: "More than A4 paper and less than a standard door", weight: 0.8 },
      { value: "more_than_door", label: "More than a standard door", weight: 1 }
    ],
    clinical_codes: {
      loinc: "72133-2", // Environmental mold exposure
      snomed: "84489001", // Mold exposure
      category: "environmental-exposure"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "critical",
    explanation: "Bathroom mold indicates moisture problems and poses respiratory health risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_H2",
    category: "bathroom", 
    section: "Bathroom Environment",
    subcategory: "bathroom_window_usage",
    question_text: "In the past week, when did you normally open the bathroom window?",
    response_options: [
      { value: "never", label: "Never", weight: 0.8 },
      { value: "during_after_bathing", label: "During/after bathing", weight: 0.1 },
      { value: "always", label: "Always", weight: 0 },
      { value: "na", label: "N/A (no window)", weight: 0.6 }
    ],
    clinical_codes: {
      loinc: "72133-2",
      category: "behavioral-pattern"
    },
    risk_score_yes: 0,
    risk_score_no: 0,
    priority: "medium",
    explanation: "Bathroom ventilation prevents moisture buildup and mold growth",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_I4a",
    category: "bathroom",
    section: "Bathroom Environment", 
    subcategory: "bathroom_slip_protection",
    question_text: "Does the bathroom floor have anti-slip protection?",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 75,
    priority: "high",
    explanation: "Bathroom floors without anti-slip protection pose serious fall risks",
    response_type: "multiple_choice"
  },
  {
    item_id: "HALST_I4b",
    category: "bathroom",
    section: "Bathroom Environment",
    subcategory: "grab_bars",
    question_text: "Are there grab bars installed next to the shower or toilet?",
    response_options: [
      { value: "no", label: "No", weight: 0.8 },
      { value: "yes", label: "Yes", weight: 0 }
    ],
    clinical_codes: {
      loinc: "95018-9", // Fall risk assessment  
      snomed: "224930009", // Home safety equipment
      category: "fall-prevention"
    },
    risk_score_yes: 0,
    risk_score_no: 70,
    priority: "high",
    explanation: "Grab bars are essential bathroom safety features for preventing falls",
    response_type: "multiple_choice"
  }
];

// Risk calculation function adapted for authentic HALST
export function calculateHALSTRisk(responses: Record<string, string>): {
  overall_score: number,
  risk_level: string,
  priority_issues: Array<{item_id: string, risk_score: number, section: string}>
} {
  const itemRisks = TAIWAN_HALST_QUESTIONS.map(question => {
    const response = responses[question.item_id];
    if (!response) return { item_id: question.item_id, risk_score: 0, section: question.section };
    
    let riskScore = 0;
    
    if (question.response_type === 'multiple_choice' && Array.isArray(question.response_options)) {
      const selectedOption = question.response_options.find(opt => opt.value === response);
      if (selectedOption) {
        // Use weight to calculate risk - higher weight = higher risk
        const maxRiskScore = Math.max(question.risk_score_yes || 0, question.risk_score_no || 0, 100);
        riskScore = selectedOption.weight * maxRiskScore;
      }
    } else {
      // Fallback for binary questions
      riskScore = response === 'yes' ? (question.risk_score_yes || 0) : (question.risk_score_no || 0);
    }
    
    return { 
      item_id: question.item_id, 
      risk_score: riskScore, 
      section: question.section,
      priority: question.priority
    };
  });
  
  const validRisks = itemRisks.filter(risk => risk.risk_score > 0);
  const averageRisk = validRisks.length > 0 ? 
    validRisks.reduce((sum, risk) => sum + risk.risk_score, 0) / validRisks.length : 0;
  
  let riskLevel = 'Low';
  if (averageRisk >= 80) riskLevel = 'Critical';
  else if (averageRisk >= 60) riskLevel = 'High'; 
  else if (averageRisk >= 40) riskLevel = 'Elevated';
  else if (averageRisk >= 20) riskLevel = 'Moderate';
  
  const priorityIssues = validRisks
    .filter(risk => risk.risk_score >= 40)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);
  
  return {
    overall_score: Math.round(averageRisk),
    risk_level: riskLevel,
    priority_issues: priorityIssues
  };
}
