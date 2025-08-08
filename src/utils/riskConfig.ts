export type Thresholds = {
  low: [number, number];
  medium: [number, number];
  high: [number, number];
};

export interface RiskScoringConfig {
  environmental: {
    weights: Record<string, number>;
    thresholds: Thresholds;
  };
  sdoh: {
    weights: Record<string, Record<string, number>>; // questionKey -> option -> weight
    thresholds: Thresholds;
  };
  combined: {
    formula: 'weighted_average';
    weights: { environmental: number; sdoh: number };
    thresholds: Thresholds;
  };
}

export const riskScoringConfig: RiskScoringConfig = {
  environmental: {
    weights: {
      moldVisible: 8,
      leakingPipes: 6,
      noVentilation: 5,
      pestInfestation: 4,
      electricalHazards: 9,
      structuralDamage: 7,
      leadPaint: 10,
      asbestos: 10,
      overcrowding: 6,
      inadequateHeating: 5,
      dust_mites: 3,
      smoking_exposure: 6,
      smoke_detectors: 7, // Missing/non-functioning
      carbon_monoxide: 8, // Missing/non-functioning
      ventilation: 5
    },
    thresholds: { low: [0, 33], medium: [34, 66], high: [67, 100] }
  },
  sdoh: {
    weights: {
      housingStability: { opt1: 0, opt2: 4, opt3: 8, opt4: 10 },
      foodSecurity: { opt1: 0, opt2: 4, opt3: 8 },
      transportation: { opt1: 0, opt2: 3, opt3: 6 },
      socialSupport: { opt1: 0, opt2: 3, opt3: 6 },
      healthcare: { opt1: 0, opt2: 4, opt3: 8 },
      employment: { opt1: 0, opt2: 3, opt3: 6 },
      education: { opt1: 0, opt2: 2, opt3: 4 },
      income: { opt1: 0, opt2: 4, opt3: 8 }
    },
    thresholds: { low: [0, 25], medium: [26, 50], high: [51, 100] }
  },
  combined: {
    formula: 'weighted_average',
    weights: { environmental: 0.6, sdoh: 0.4 },
    thresholds: { low: [0, 35], medium: [36, 65], high: [66, 100] }
  }
};
