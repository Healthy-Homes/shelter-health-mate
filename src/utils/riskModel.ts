import { AssessmentData } from '@/types';
import { riskScoringConfig, Thresholds } from '@/utils/riskConfig';

function categorize(score: number, thresholds: Thresholds): 'Low' | 'Moderate' | 'High' {
  if (score <= thresholds.low[1]) return 'Low';
  if (score <= thresholds.medium[1]) return 'Moderate';
  return 'High';
}

function scoreEnvironmental(checklist: Record<string, boolean>) {
  const weights = riskScoringConfig.environmental.weights;
  let total = 0;
  let max = 0;
  Object.entries(weights).forEach(([key, w]) => {
    max += w;
    if (checklist[key]) total += w;
  });
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return { score: pct, category: categorize(pct, riskScoringConfig.environmental.thresholds) };
}

function scoreSDOH(sdoh: Record<string, string>) {
  const weightsMap = riskScoringConfig.sdoh.weights;
  let total = 0;
  let max = 0;
  Object.entries(weightsMap).forEach(([qKey, opts]) => {
    const maxForQ = Math.max(...Object.values(opts));
    max += maxForQ;
    const resp = sdoh[qKey];
    if (resp && opts[resp] !== undefined) total += opts[resp];
  });
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return { score: pct, category: categorize(pct, riskScoringConfig.sdoh.thresholds) };
}

export const calculateRiskScores = (data: AssessmentData) => {
  const environmental = scoreEnvironmental(data.checklist || {});
  const sdoh = scoreSDOH(data.sdoh || {});

  // Combined
  const { weights, thresholds } = riskScoringConfig.combined;
  const combinedRaw = environmental.score * weights.environmental + sdoh.score * weights.sdoh;
  const combined = { score: Math.round(combinedRaw), category: categorize(Math.round(combinedRaw), thresholds) };

  return { environmental, sdoh, combined };
};
