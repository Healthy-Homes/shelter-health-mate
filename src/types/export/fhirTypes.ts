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

// Question ID to clinical code mapping helper
export const mapQuestionToClinicalCode = (questionId: string) => {
  // Taiwan HALST mappings
  if (questionId.startsWith('HALST_')) {
    const questionNum = parseInt(questionId.split('_')[1]);
    
    if ([1, 2, 3].includes(questionNum)) {
      return CLINICAL_CODES.housing.type;
    } else if ([4, 17, 25].includes(questionNum)) {
      return CLINICAL_CODES.environmental.ventilation;
    } else if ([5, 6, 26, 27].includes(questionNum)) {
      return CLINICAL_CODES.housing.condition;
    } else if ([8].includes(questionNum)) {
      return CLINICAL_CODES.environmental.pest_infestation;
    } else if ([18].includes(questionNum)) {
      return CLINICAL_CODES.environmental.water_quality;
    } else if ([32, 33, 34].includes(questionNum)) {
      return CLINICAL_CODES.environmental.air_quality;
    }
  }
  
  // US Healthy Homes mappings  
  if (questionId.startsWith('US')) {
    const questionNum = parseInt(questionId.substring(2));
    
    if ([1, 2, 3].includes(questionNum)) {
      return CLINICAL_CODES.housing.condition;
    } else if ([13, 22].includes(questionNum)) {
      return CLINICAL_CODES.environmental.ventilation;
    } else if ([14].includes(questionNum)) {
      return CLINICAL_CODES.environmental.pest_infestation;
    } else if ([25, 26, 27, 28, 29].includes(questionNum)) {
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
  
  // SDOH mappings
  if (questionId.startsWith('SDOH_')) {
    const questionNum = parseInt(questionId.split('_')[1]);
    
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
