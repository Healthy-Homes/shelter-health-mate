// src/constants/clinicalMappings.ts
// Clinical code mappings for health assessment data export

export const CLINICAL_CODES = {
  // Housing-related codes
  housing: {
    type: {
      loinc: '71802-3', // Housing type
      snomed: '224730000', // Domiciliary accommodation 
      display: 'Housing type assessment'
    },
    condition: {
      loinc: '71804-9', // Housing condition  
      snomed: '160734000', // Lives in poor housing
      icd10: 'Z59.1', // Inadequate housing
      display: 'Housing condition assessment'
    },
    safety: {
      snomed: '224838001', // Building safety
      icd10: 'Z59.2', // Discord with neighbors/landlord/lodgers
      display: 'Housing safety assessment'
    }
  },

  // Environmental health codes
  environmental: {
    air_quality: {
      loinc: '33747-0', // General air quality
      snomed: '102411008', // Environmental air quality
      display: 'Indoor air quality assessment'
    },
    ventilation: {
      snomed: '224829000', // Ventilation of building
      icd10: 'Z59.1', // Inadequate housing
      display: 'Ventilation adequacy'
    },
    water_quality: {
      loinc: '33743-9', // Water quality
      snomed: '226533002', // Water supply
      display: 'Water quality and access'
    },
    pest_infestation: {
      snomed: '424794005', // Pest infestation
      icd10: 'Z59.1', // Inadequate housing
      display: 'Pest infestation assessment'
    }
  },

  // Social determinants of health (SDOH) codes
  sdoh: {
    food_insecurity: {
      icd10: 'Z59.4', // Lack of adequate food
      snomed: '733423003', // Food insecurity
      loinc: '88122-7', // Food insecurity risk screening
      display: 'Food security assessment'
    },
    housing_instability: {
      icd10: 'Z59.0', // Homelessness  
      snomed: '32911000', // Homeless
      loinc: '71802-3', // Housing status
      display: 'Housing stability assessment'
    },
    transportation: {
      icd10: 'Z59.3', // Problems related to living alone
      snomed: '160693006', // Lives alone
      loinc: '93030-5', // Transportation insecurity
      display: 'Transportation access'
    },
    social_isolation: {
      icd10: 'Z60.4', // Social exclusion and rejection
      snomed: '105529008', // Social isolation
      loinc: '93029-7', // Social connection assessment
      display: 'Social support and isolation'
    },
    financial_strain: {
      icd10: 'Z59.6', // Low income
      snomed: '423315002', // Financial problem
      loinc: '93031-3', // Financial resource strain
      display: 'Financial resource assessment'
    }
  },

  // Elder safety specific codes
  elder_safety: {
    fall_risk: {
      icd10: 'Z91.81', // History of falling
      snomed: '129839007', // At risk for falls
      loinc: '73830-2', // Fall risk assessment
      display: 'Fall risk evaluation'
    },
    medication_management: {
      snomed: '432102000', // Administration of medication
      loinc: '45395-5', // Medication management
      display: 'Medication safety assessment'
    },
    home_safety: {
      snomed: '225746001', // Home safety
      loinc: '72133-2', // Home safety assessment
      display: 'Home safety evaluation'
    }
  },

  // Risk assessment categories
  risk_categories: {
    low: {
      snomed: '261665006', // Unknown
      display: 'Low risk'
    },
    moderate: {
      snomed: '6736007', // Moderate
      display: 'Moderate risk'
    },
    high: {
      snomed: '75540009', // High
      display: 'High risk'
    },
    critical: {
      snomed: '24484000', // Severe
      display: 'Critical risk'
    }
  }
};

// FHIR observation category mappings
export const FHIR_CATEGORIES = {
  social_history: {
    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
    code: 'social-history',
    display: 'Social History'
  },
  functional_status: {
    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
    code: 'functional-status', 
    display: 'Functional Status'
  },
  safety: {
    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
    code: 'therapy',
    display: 'Therapy'
  }
};

// Comprehensive Housing & Environmental Hazard Mappings from clinical table
export const HOUSING_HAZARD_MAPPINGS: { [key: string]: any } = {
  // Mold-related
  'US035': { // US specific mold question
    loinc: '96778-6',
    loincAnswer: 'Mold',
    snomed: '224255009', // Mold growth in home
    display: 'Visible mold on walls/ceilings'
  },
  'HALST_27': { // Visible mold in bathroom
    loinc: '96778-6',
    loincAnswer: 'Mold',
    snomed: '224255009',
    display: 'Mold growth in bathroom'
  },
  
  // Water damage/leaks
  'US011': { // Basement moisture
    loinc: '96778-6',
    loincAnswer: 'Water leaks',
    snomed: '224260008',
    display: 'Water damage - basement'
  },
  'US023': { // Attic leaks
    loinc: '96778-6',
    loincAnswer: 'Water leaks',
    snomed: '224260008',
    display: 'Water damage - attic'
  },
  'US026': { // Plumbing leaks
    loinc: '96778-6',
    loincAnswer: 'Water leaks',
    snomed: '224260008',
    display: 'Plumbing leaks'
  },
  'HALST_6': { // Signs of water damage
    loinc: '96778-6',
    loincAnswer: 'Water leaks',
    snomed: '224260008',
    display: 'Signs of water damage or leaks'
  },
  'HALST_26': { // Bathroom leaks
    loinc: '96778-6',
    loincAnswer: 'Water leaks',
    snomed: '224260008',
    display: 'Bathroom leaks'
  },
  
  // Pest infestation
  'US014': { // Basement pests
    loinc: '96778-6',
    loincAnswer: 'Pests',
    snomed: '1162585007', // Infestation of residence
    display: 'Pest infestation - basement'
  },
  'US024': { // Attic pests
    loinc: '96778-6',
    loincAnswer: 'Pests',
    snomed: '1162585007',
    display: 'Pest infestation - attic'
  },
  'HALST_8': { // General pests
    loinc: '96778-6',
    loincAnswer: 'Pests',
    snomed: '1162585007',
    display: 'Problems with pests (insects, rodents)'
  },
  
  // Lead paint hazard
  'US032': { // Lead paint
    loinc: '96778-6',
    loincAnswer: 'Lead paint or pipes',
    snomed: '1197631001', // Lead in residence
    display: 'Peeling/chipping paint (lead hazard)'
  },
  'HALST_7': { // Peeling paint
    loinc: '96778-6',
    loincAnswer: 'Lead paint or pipes',
    snomed: '1197631001',
    display: 'Peeling or chipping paint'
  },
  
  // Electrical hazards
  'US041': { // Electrical outlets
    loinc: '96778-6',
    loincAnswer: 'Unsafe or not working electrical outlets',
    snomed: '224260008',
    display: 'Electrical outlets working and covered'
  },
  'HALST_39': { // Electrical condition
    loinc: '96778-6',
    loincAnswer: 'Exposed wiring',
    snomed: '224260008',
    display: 'Electrical outlets and wiring condition'
  },
  
  // Smoke/CO detectors
  'US043': { // Smoke detectors
    loinc: '96778-6',
    loincAnswer: 'Smoke detectors missing or not working',
    snomed: '1197640002', // Inadequate smoke detection
    display: 'Smoke detector functionality'
  },
  'US019': { // CO detectors
    loinc: '96778-6',
    loincAnswer: 'Other problems',
    snomed: '224260008',
    display: 'Carbon monoxide detector status'
  },
  'HALST_37': { // Smoke detectors working
    loinc: '95401-6', // Needs smoke detector
    snomed: '1197640002',
    display: 'Working smoke detectors'
  },
  
  // Heating/cooling
  'US016': { // Heating system
    loinc: '96778-6',
    loincAnswer: 'Lack of heat',
    snomed: '105535008', // Lack of heat in house
    display: 'Heating system functionality'
  },
  'US017': { // Cooling system
    loinc: '96778-6',
    loincAnswer: 'Other problems',
    snomed: '224260008',
    display: 'Cooling/AC system functionality'
  },
  'HALST_30': { // Adequate heating
    loinc: '96778-6',
    loincAnswer: 'Lack of heat',
    snomed: '105535008',
    display: 'Adequate heating in winter'
  },
  'HALST_31': { // Adequate cooling
    loinc: '96778-6',
    loincAnswer: 'Other problems',
    snomed: '224260008',
    display: 'Adequate cooling in summer'
  },
  
  // Kitchen/appliances
  'US036': { // Stove/oven
    loinc: '96778-6',
    loincAnswer: 'Oven or stove not working',
    snomed: '1197634009', // Inadequate food preparation equipment
    display: 'Stove/oven functionality'
  },
  'HALST_20': { // Cooking equipment problems
    loinc: '96778-6',
    loincAnswer: 'Oven or stove not working',
    snomed: '1197634009',
    display: 'Problems with stove or cooking equipment'
  },
  
  // Plumbing
  'US023': { // Toilet functionality
    loinc: '96778-6',
    loincAnswer: 'Toilets not working',
    snomed: '224260008',
    display: 'Toilet functionality'
  },
  'HALST_23': { // Toilet flush
    loinc: '96778-6',
    loincAnswer: 'Toilets not working',
    snomed: '224260008',
    display: 'Toilet flushes properly'
  },
  
  // Utilities insecurity
  'utilities': { // If using utilities question
    loinc: '96779-4', // Utility shut-off threat
    snomed: '1184702004', // Financial insecurity (utilities)
    icd10: 'Z59.861', // Difficulty paying utilities
    display: 'Utilities insecurity'
  }
};

// Enhanced SDOH Clinical Codes with proper LOINC/SNOMED from standards
export const ENHANCED_SDOH_MAPPINGS: { [key: string]: any } = {
  'SDOH_1': { // Food insecurity
    loinc: '88122-7', // Hunger Vital Sign item 1
    snomed: '733423003', // Food insecurity
    display: 'Food insecurity - worry about food'
  },
  'SDOH_2': { // Food insecurity severe
    loinc: '88123-5', // Hunger Vital Sign item 2
    snomed: '733423003',
    display: 'Food insecurity - food ran out'
  },
  'SDOH_3': { // Housing
    loinc: '71802-3', // AHC housing status
    snomed: '1156191002', // Housing instability
    altSnomed: '32911000', // Homeless
    display: 'Housing situation today'
  },
  'SDOH_4': { // Transportation
    loinc: '93030-5', // PRAPARE/AHC transportation
    snomed: '713458007', // Lack of access to transportation
    display: 'Transportation insecurity'
  },
  'SDOH_5': { // Social isolation
    loinc: '93159-2', // CMS loneliness/isolation
    snomed: '422650009', // Social isolation
    display: 'Social connection and isolation'
  },
  'SDOH_6': { // Stress (maps to financial strain in standards)
    loinc: '76513-1', // CARDIA financial strain
    snomed: '73595000', // Stress (finding)
    altSnomed: '1184702004', // Financial insecurity
    display: 'Stress level'
  },
  'SDOH_7': { // Home safety
    loinc: '96778-6', // Problems with place you live
    snomed: '224838001', // Building safety
    display: 'Home safety'
  },
  'SDOH_8': { // Neighborhood safety
    loinc: '96778-6', // Problems with place you live
    loincAnswer: 'Violence',
    snomed: '224838001', // Building safety
    display: 'Neighborhood safety'
  }
};

// Updated Question ID to clinical code mapping helper
export const mapQuestionToClinicalCode = (questionId: string) => {
  // Check comprehensive housing hazard mappings FIRST
  if (HOUSING_HAZARD_MAPPINGS[questionId]) {
    return HOUSING_HAZARD_MAPPINGS[questionId];
  }
  
  // Check enhanced SDOH mappings
  if (ENHANCED_SDOH_MAPPINGS[questionId]) {
    return ENHANCED_SDOH_MAPPINGS[questionId];
  }
  
  // Taiwan HALST mappings (for questions not in hazard mappings)
  if (questionId.startsWith('HALST_')) {
    const questionNum = parseInt(questionId.split('_')[1]);
    
    if ([1, 2, 3].includes(questionNum)) {
      return CLINICAL_CODES.housing.type;
    } else if ([4, 17, 25].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.environmental.ventilation;
    } else if ([5].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.housing.condition;
    } else if ([18].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.environmental.water_quality;
    } else if ([32, 33, 34].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.environmental.air_quality;
    }
  }
  
  // US Healthy Homes mappings (for questions not in hazard mappings)
  if (questionId.startsWith('US')) {
    const questionNum = parseInt(questionId.substring(2));
    
    if ([1, 2, 3].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.housing.condition;
    } else if ([13, 22].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.environmental.ventilation;
    } else if ([25, 27, 28, 29].includes(questionNum) && !HOUSING_HAZARD_MAPPINGS[questionId]) {
      return CLINICAL_CODES.environmental.water_quality;
    }
  }
  
  // Elder Safety mappings
  if (questionId.startsWith('ELDER_')) {
    const questionNum = parseInt(questionId.split('_')[1]);
    
    if ([1, 2, 3, 4, 7, 8, 18, 20].includes(questionNum)) {
      return CLINICAL_CODES.elder_safety.fall_risk;
    } else if ([28, 29, 30, 31].includes(questionNum)) {
      return CLINICAL_CODES.elder_safety.medication_management;
    } else {
      return CLINICAL_CODES.elder_safety.home_safety;
    }
  }
  
  // SDOH mappings (fallback for old pattern)
  if (questionId.startsWith('SDOH_')) {
    const questionNum = parseInt(questionId.split('_')[1]);
    
    // Use enhanced mappings if available
    if (ENHANCED_SDOH_MAPPINGS[questionId]) {
      return ENHANCED_SDOH_MAPPINGS[questionId];
    }
    
    // Fallback to old mappings
    switch (questionNum) {
      case 1:
      case 2:
        return CLINICAL_CODES.sdoh.food_insecurity;
      case 3:
        return CLINICAL_CODES.sdoh.housing_instability;
      case 4:
        return CLINICAL_CODES.sdoh.transportation;
      case 5:
        return CLINICAL_CODES.sdoh.social_isolation;
      case 6:
        return CLINICAL_CODES.sdoh.financial_strain;
      case 7:
      case 8:
        return CLINICAL_CODES.housing.safety;
    }
  }
  
  // Default fallback
  return {
    snomed: '418799008', // Finding
    display: 'Health assessment finding'
  };
};

// SDOH Question Response Mappings
export const SDOH_RESPONSE_MAPPINGS = {
  // SDOH_1 & SDOH_2 - Food insecurity (negative if true)
  SDOH_1: {
    loinc: '88122-7',
    positiveResponses: ['nevertrue', 'opt4'], // Never true
    negativeResponses: ['alwaystrue', 'oftentrue', 'opt1', 'opt2'], // Always/Often true
  },
  SDOH_2: {
    loinc: '88123-5',
    positiveResponses: ['nevertrue', 'opt4'],
    negativeResponses: ['alwaystrue', 'oftentrue', 'opt1', 'opt2'],
  },
  // SDOH_3 - Housing situation
  SDOH_3: {
    loinc: '71802-3',
    positiveResponses: ['own', 'opt1'], // I have housing
    negativeResponses: ['transitional', 'opt3'], // No housing
  },
  // SDOH_4 - Transportation
  SDOH_4: {
    loinc: '93030-5',
    positiveResponses: ['no', 'opt2'], // NO lack of transportation (double negative = positive)
    negativeResponses: ['yes', 'opt1'], // YES lack of transportation
  },
  // SDOH_5 - Social isolation
  SDOH_5: {
    loinc: '93159-2',
    positiveResponses: ['5ormoretimesweek', 'opt4'], // Frequent contact
    negativeResponses: ['lessthanoceweek', 'opt1'], // Rare contact
  },
  // SDOH_6 - Stress level
  SDOH_6: {
    loinc: '76513-1',
    positiveResponses: ['notatall', 'opt1'], // Not stressed
    negativeResponses: ['quiteabit', 'verymuch', 'opt3', 'opt4'], // Very stressed
  },
  // SDOH_7 - Home safety
  SDOH_7: {
    loinc: '93038-8',
    positiveResponses: ['yes', 'opt1'], // Feels safe at home
    negativeResponses: ['no', 'opt2'], // Doesn't feel safe
  },
  // SDOH_8 - NEIGHBORHOOD SAFETY
  SDOH_8: {
    loinc: '93038-8',
    positiveResponses: ['yes', 'opt1'], // YES feels safe
    negativeResponses: ['no', 'opt2'], // NO doesn't feel safe
  }
};

// Helper function to check if SDOH response indicates an issue
export function isSDOHIssue(questionId: string, response: string): boolean {
  const mapping = SDOH_RESPONSE_MAPPINGS[questionId];
  if (!mapping) return false;
  
  // Normalize response to lowercase for comparison
  const normalizedResponse = response.toLowerCase();
  
  // Check if it's a negative response (indicates an issue)
  return mapping.negativeResponses.some(neg => 
    normalizedResponse === neg.toLowerCase()
  );
}

// Get proper LOINC code for SDOH question
export function getSDOHLOINC(questionId: string): { code: string; display: string } | null {
  const mapping = SDOH_RESPONSE_MAPPINGS[questionId];
  if (!mapping) return null;
  
  // Map to existing CLINICAL_CODES structure
  if (questionId === 'SDOH_1' || questionId === 'SDOH_2') {
    return {
      code: CLINICAL_CODES.sdoh.food_insecurity.loinc,
      display: CLINICAL_CODES.sdoh.food_insecurity.display
    };
  }
  if (questionId === 'SDOH_3') {
    return {
      code: CLINICAL_CODES.sdoh.housing_instability.loinc,
      display: CLINICAL_CODES.sdoh.housing_instability.display
    };
  }
  
  return null;
}
