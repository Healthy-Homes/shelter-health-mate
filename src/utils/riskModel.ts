import { AssessmentData, RiskWeights } from '@/types';

// Risk weights for checklist items (higher = more risk)
const checklistWeights: RiskWeights = {
  moldVisible: 8,
  leakingPipes: 6,
  noVentilation: 5,
  pestInfestation: 4,
  electricalHazards: 9,
  structuralDamage: 7,
  leadPaint: 10,
  asbestos: 10,
  overcrowding: 6,
  inadequateHeating: 5
};

// Risk weights for SDOH responses (opt3 = highest risk, opt1 = lowest risk)
const sdohWeights: { [key: string]: { [option: string]: number } } = {
  foodSecurity: { opt1: 0, opt2: 4, opt3: 8 },
  housingStability: { opt1: 0, opt2: 5, opt3: 10 },
  transportation: { opt1: 0, opt2: 3, opt3: 6 },
  socialSupport: { opt1: 0, opt2: 3, opt3: 6 },
  healthcare: { opt1: 0, opt2: 4, opt3: 8 },
  employment: { opt1: 0, opt2: 3, opt3: 6 },
  education: { opt1: 0, opt2: 2, opt3: 4 },
  income: { opt1: 0, opt2: 4, opt3: 8 }
};

export const calculateRiskScore = (data: AssessmentData): { score: number; category: 'Low' | 'Moderate' | 'High' } => {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Calculate checklist risk
  Object.keys(checklistWeights).forEach(key => {
    maxPossibleScore += checklistWeights[key];
    if (data.checklist[key]) {
      totalScore += checklistWeights[key];
    }
  });

  // Calculate SDOH risk
  Object.keys(sdohWeights).forEach(questionId => {
    const response = data.sdoh[questionId];
    const weights = sdohWeights[questionId];
    maxPossibleScore += Math.max(...Object.values(weights));
    
    if (response && weights[response]) {
      totalScore += weights[response];
    }
  });

  // Convert to percentage (0-100)
  const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  let category: 'Low' | 'Moderate' | 'High';
  if (percentageScore <= 33) {
    category = 'Low';
  } else if (percentageScore <= 66) {
    category = 'Moderate';
  } else {
    category = 'High';
  }

  return { score: percentageScore, category };
};