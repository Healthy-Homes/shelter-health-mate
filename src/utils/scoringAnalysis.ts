// src/utils/scoringAnalysis.ts
// Comprehensive scoring analysis for all assessment types

import { ChecklistItem } from '../types/checklist';
import { calculateItemRisk, calculateOverallRisk } from './riskScoring';
import { TAIWAN_HALST_QUESTIONS } from '../data/taiwanHalstChecklist';
import { US_HEALTHY_HOMES_QUESTIONS } from '../data/usHealthyHomesChecklist';
import { SDOH_QUESTIONS } from '../data/sdohChecklist';
import { ELDER_SAFETY_QUESTIONS } from '../data/elderSafetyChecklist';

interface AssessmentAnalysis {
  name: string;
  totalQuestions: number;
  scoreRanges: {
    min: number;
    max: number;
    avg: number;
  };
  scenarios: {
    allGood: number;
    allBad: number;
    mixed: number;
    criticalOnly: number;
  };
  distribution: {
    noRisk: number;      // 0 score items
    low: number;         // 1-30 score items
    medium: number;      // 31-60 score items
    high: number;        // 61-80 score items
    critical: number;    // 81-100 score items
  };
  issues: string[];
}

// Helper function to get "good" response for a question
function getGoodResponse(item: ChecklistItem): string {
  if (item.response_type === 'binary') {
    // If YES has risk, then NO is good
    if ((item.risk_score_yes || 0) > (item.risk_score_no || 0)) {
      return 'no';
    } else {
      return 'yes';
    }
  } else if (item.response_type === 'scale') {
    const options = item.response_options.split(',').map(o => o.trim());
    // Usually first option is best for scales
    return options[0];
  } else if (item.response_type === 'multiple_choice' || item.response_type === 'numeric') {
    const options = item.response_options.split(',').map(o => o.trim());
    return options[0]; // Usually first is safest
  }
  return 'no';
}

// Helper function to get "bad" response for a question
function getBadResponse(item: ChecklistItem): string {
  if (item.response_type === 'binary') {
    // If YES has risk, then YES is bad
    if ((item.risk_score_yes || 0) > (item.risk_score_no || 0)) {
      return 'yes';
    } else {
      return 'no';
    }
  } else if (item.response_type === 'scale') {
    const options = item.response_options.split(',').map(o => o.trim());
    // Usually last option is worst for scales
    return options[options.length - 1];
  } else if (item.response_type === 'multiple_choice' || item.response_type === 'numeric') {
    const options = item.response_options.split(',').map(o => o.trim());
    return options[options.length - 1]; // Usually last is worst
  }
  return 'yes';
}

// Helper function to get mixed responses (alternating good/bad)
function getMixedResponse(item: ChecklistItem, index: number): string {
  return index % 2 === 0 ? getGoodResponse(item) : getBadResponse(item);
}

// Analyze a single assessment
function analyzeAssessment(
  name: string,
  questions: ChecklistItem[]
): AssessmentAnalysis {
  const analysis: AssessmentAnalysis = {
    name,
    totalQuestions: questions.length,
    scoreRanges: { min: Infinity, max: 0, avg: 0 },
    scenarios: {
      allGood: 0,
      allBad: 0,
      mixed: 0,
      criticalOnly: 0
    },
    distribution: {
      noRisk: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    issues: []
  };

  // Analyze individual question risk scores
  let totalPossibleRisk = 0;
  questions.forEach(q => {
    const maxRisk = Math.max(q.risk_score_yes || 0, q.risk_score_no || 0);
    const minRisk = Math.min(q.risk_score_yes || 0, q.risk_score_no || 0);
    
    analysis.scoreRanges.min = Math.min(analysis.scoreRanges.min, minRisk);
    analysis.scoreRanges.max = Math.max(analysis.scoreRanges.max, maxRisk);
    totalPossibleRisk += maxRisk;

    // Categorize by risk level
    if (maxRisk === 0) analysis.distribution.noRisk++;
    else if (maxRisk <= 30) analysis.distribution.low++;
    else if (maxRisk <= 60) analysis.distribution.medium++;
    else if (maxRisk <= 80) analysis.distribution.high++;
    else analysis.distribution.critical++;
  });

  analysis.scoreRanges.avg = totalPossibleRisk / questions.length;

  // Scenario 1: All Good Responses
  const allGoodRisks = questions.map(q => {
    const response = getGoodResponse(q);
    return calculateItemRisk(q, response);
  });
  const allGoodResult = calculateOverallRisk(allGoodRisks);
  analysis.scenarios.allGood = allGoodResult.overall_risk_score;

  // Scenario 2: All Bad Responses
  const allBadRisks = questions.map(q => {
    const response = getBadResponse(q);
    return calculateItemRisk(q, response);
  });
  const allBadResult = calculateOverallRisk(allBadRisks);
  analysis.scenarios.allBad = allBadResult.overall_risk_score;

  // Scenario 3: Mixed Responses
  const mixedRisks = questions.map((q, i) => {
    const response = getMixedResponse(q, i);
    return calculateItemRisk(q, response);
  });
  const mixedResult = calculateOverallRisk(mixedRisks);
  analysis.scenarios.mixed = mixedResult.overall_risk_score;

  // Scenario 4: Only Critical/High Priority Items Bad
  const criticalRisks = questions.map(q => {
    const response = (q.priority === 'critical' || q.priority === 'high') 
      ? getBadResponse(q) 
      : getGoodResponse(q);
    return calculateItemRisk(q, response);
  });
  const criticalResult = calculateOverallRisk(criticalRisks);
  analysis.scenarios.criticalOnly = criticalResult.overall_risk_score;

  // Identify issues
  if (analysis.scenarios.allBad < 70) {
    analysis.issues.push(`All-bad scenario only scores ${analysis.scenarios.allBad} (should be 85+)`);
  }
  if (analysis.scenarios.allGood > 15) {
    analysis.issues.push(`All-good scenario scores ${analysis.scenarios.allGood} (should be <15)`);
  }
  if (analysis.distribution.noRisk > questions.length * 0.2) {
    analysis.issues.push(`Too many zero-risk items (${analysis.distribution.noRisk}/${questions.length})`);
  }
  if (analysis.scoreRanges.max < 70) {
    analysis.issues.push(`Maximum possible risk too low (${analysis.scoreRanges.max})`);
  }

  return analysis;
}

// Main analysis function
export function runComprehensiveScoringAnalysis() {
  console.log('=== COMPREHENSIVE SCORING ANALYSIS ===\n');
  
  const assessments = [
    { name: 'Taiwan HALST', questions: TAIWAN_HALST_QUESTIONS },
    { name: 'US Healthy Homes', questions: US_HEALTHY_HOMES_QUESTIONS },
    { name: 'Elder Safety', questions: ELDER_SAFETY_QUESTIONS },
    { name: 'SDOH', questions: SDOH_QUESTIONS }
  ];

  const allAnalyses: AssessmentAnalysis[] = [];

  assessments.forEach(({ name, questions }) => {
    const analysis = analyzeAssessment(name, questions);
    allAnalyses.push(analysis);
    
    console.log(`\n📊 ${name} Assessment`);
    console.log('─'.repeat(50));
    console.log(`Total Questions: ${analysis.totalQuestions}`);
    console.log(`\nScore Ranges:`);
    console.log(`  Min possible: ${analysis.scoreRanges.min}`);
    console.log(`  Max possible: ${analysis.scoreRanges.max}`);
    console.log(`  Average: ${analysis.scoreRanges.avg.toFixed(1)}`);
    
    console.log(`\nScenario Testing:`);
    console.log(`  ✅ All Good: ${analysis.scenarios.allGood}`);
    console.log(`  ❌ All Bad: ${analysis.scenarios.allBad}`);
    console.log(`  🔄 Mixed (50/50): ${analysis.scenarios.mixed}`);
    console.log(`  ⚠️ Critical Only: ${analysis.scenarios.criticalOnly}`);
    
    console.log(`\nRisk Distribution:`);
    console.log(`  No Risk (0): ${analysis.distribution.noRisk} questions`);
    console.log(`  Low (1-30): ${analysis.distribution.low} questions`);
    console.log(`  Medium (31-60): ${analysis.distribution.medium} questions`);
    console.log(`  High (61-80): ${analysis.distribution.high} questions`);
    console.log(`  Critical (81-100): ${analysis.distribution.critical} questions`);
    
    if (analysis.issues.length > 0) {
      console.log(`\n⚠️ Issues Found:`);
      analysis.issues.forEach(issue => console.log(`  - ${issue}`));
    }
  });

  // Comparative Analysis
  console.log('\n\n📈 COMPARATIVE ANALYSIS');
  console.log('═'.repeat(50));
  
  console.log('\nAll-Bad Scenario Scores (should be 85+):');
  allAnalyses.forEach(a => {
    const status = a.scenarios.allBad >= 85 ? '✅' : '❌';
    console.log(`  ${status} ${a.name}: ${a.scenarios.allBad}`);
  });
  
  console.log('\nAll-Good Scenario Scores (should be <15):');
  allAnalyses.forEach(a => {
    const status = a.scenarios.allGood <= 15 ? '✅' : '❌';
    console.log(`  ${status} ${a.name}: ${a.scenarios.allGood}`);
  });
  
  console.log('\nScore Range Consistency:');
  const avgMax = allAnalyses.reduce((sum, a) => sum + a.scoreRanges.max, 0) / allAnalyses.length;
  const avgMin = allAnalyses.reduce((sum, a) => sum + a.scoreRanges.min, 0) / allAnalyses.length;
  console.log(`  Average Max: ${avgMax.toFixed(1)}`);
  console.log(`  Average Min: ${avgMin.toFixed(1)}`);
  
  // Recommendations
  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('═'.repeat(50));
  
  const needsCalibration: string[] = [];
  allAnalyses.forEach(a => {
    if (a.scenarios.allBad < 70 || a.scenarios.allGood > 20) {
      needsCalibration.push(a.name);
    }
  });
  
  if (needsCalibration.length > 0) {
    console.log('\nAssessments needing calibration:');
    needsCalibration.forEach(name => console.log(`  • ${name}`));
  } else {
    console.log('\n✅ All assessments within acceptable ranges!');
  }
  
  console.log('\n=== END ANALYSIS ===\n');
  
  return allAnalyses;
}

// Function to test in console
export function testScoringConsistency() {
  return runComprehensiveScoringAnalysis();
}
