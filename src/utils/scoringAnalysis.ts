// src/utils/scoringAnalysis.ts
// Comprehensive scoring analysis for all assessment types

import { ChecklistItem } from '../types/checklist';
import { calculateItemRisk, calculateOverallRisk } from './riskScoring';
import { TAIWAN_HALST_QUESTIONS } from '../data/taiwanHalstChecklist';
import { US_HEALTHY_HOMES_QUESTIONS } from '../data/usHealthyHomesChecklist';
import { ELDER_SAFETY_QUESTIONS } from '../data/elderSafetyChecklist';
import { SDOH_QUESTIONS } from '../data/sdohChecklist';

interface AssessmentAnalysis {
  name: string;
  questions: ChecklistItem[];
  scenarios: {
    all_good: number;
    all_bad: number;
    mixed: number;
  };
  score_range: {
    min: number;
    max: number;
    individual_max: number;
  };
  issues: string[];
}

// Test different response scenarios
function testScenario(questions: ChecklistItem[], scenario: 'all_good' | 'all_bad' | 'mixed'): number {
  const itemRisks = questions.map(question => {
    let testResponse = '';
    
    if (scenario === 'all_good') {
      // Choose the response with the lowest risk
      if (question.response_type === 'binary') {
        testResponse = question.risk_score_yes === 0 ? 'yes' : 'no';
      } else {
        // For multiple choice, find the option with lowest weight/risk
        if (Array.isArray(question.response_options)) {
          // New format: array of objects
          const sortedOptions = [...question.response_options].sort((a, b) => (a.weight || 0) - (b.weight || 0));
          testResponse = sortedOptions[0].value;
        } else {
          // Old format: comma-separated string
          const options = question.response_options.split(',').map(opt => opt.trim());
          testResponse = options[0];
        }
      }
    } else if (scenario === 'all_bad') {
      // Choose the response with the highest risk
      if (question.response_type === 'binary') {
        testResponse = question.risk_score_yes > question.risk_score_no ? 'yes' : 'no';
      } else {
        if (Array.isArray(question.response_options)) {
          // New format: array of objects
          const sortedOptions = [...question.response_options].sort((a, b) => (b.weight || 0) - (a.weight || 0));
          testResponse = sortedOptions[0].value;
        } else {
          // Old format: comma-separated string
          const options = question.response_options.split(',').map(opt => opt.trim());
          testResponse = options[options.length - 1];
        }
      }
    } else {
      // Mixed - alternate between good and bad
      const index = questions.indexOf(question);
      if (index % 2 === 0) {
        testResponse = question.response_type === 'binary' ? 
          (question.risk_score_yes === 0 ? 'yes' : 'no') :
          Array.isArray(question.response_options) ?
            question.response_options[0].value :
            question.response_options.split(',')[0].trim();
      } else {
        testResponse = question.response_type === 'binary' ? 
          (question.risk_score_yes > question.risk_score_no ? 'yes' : 'no') :
          Array.isArray(question.response_options) ?
            question.response_options[question.response_options.length - 1].value :
            question.response_options.split(',').slice(-1)[0].trim();
      }
    }
    
    return calculateItemRisk(question, testResponse);
  });
  
  const overall = calculateOverallRisk(itemRisks);
  return overall.risk_score;
}

function analyzeAssessment(name: string, questions: ChecklistItem[]): AssessmentAnalysis {
  const scenarios = {
    all_good: testScenario(questions, 'all_good'),
    all_bad: testScenario(questions, 'all_bad'),
    mixed: testScenario(questions, 'mixed')
  };
  
  // Find individual score ranges
  const individualScores = questions.map(q => Math.max(q.risk_score_yes || 0, q.risk_score_no || 0));
  const individual_max = Math.max(...individualScores);
  
  const score_range = {
    min: scenarios.all_good,
    max: scenarios.all_bad,
    individual_max
  };
  
  // Identify issues
  const issues: string[] = [];
  if (scenarios.all_bad < 75) {
    issues.push(`All bad scenario only scores ${scenarios.all_bad} (should be 75+)`);
  }
  if (scenarios.all_good > 20) {
    issues.push(`All good scenario scores ${scenarios.all_good} (should be <20)`);
  }
  if (individual_max < 80) {
    issues.push(`Highest individual risk is only ${individual_max} (should be 80+)`);
  }
  if (questions.some(q => (!q.risk_score_yes && q.risk_score_yes !== 0) && (!q.risk_score_no && q.risk_score_no !== 0))) {
    issues.push('Some questions missing risk scores');
  }
  
  return {
    name,
    questions,
    scenarios,
    score_range,
    issues
  };
}

export function testScoringConsistency() {
  console.log('=== COMPREHENSIVE SCORING ANALYSIS ===');
  
  const assessments: AssessmentAnalysis[] = [
    analyzeAssessment('Taiwan HALST', TAIWAN_HALST_QUESTIONS),
    analyzeAssessment('US Healthy Homes', US_HEALTHY_HOMES_QUESTIONS),
    analyzeAssessment('Elder Safety', ELDER_SAFETY_QUESTIONS),
    analyzeAssessment('SDOH', SDOH_QUESTIONS)
  ];
  
  assessments.forEach(assessment => {
    console.log(`\n--- ${assessment.name} (${assessment.questions.length} questions) ---`);
    console.log('Scenarios:');
    console.log(`  All Good: ${assessment.scenarios.all_good}`);
    console.log(`  All Bad: ${assessment.scenarios.all_bad}`);
    console.log(`  Mixed: ${assessment.scenarios.mixed}`);
    console.log(`Score Range: ${assessment.score_range.min} - ${assessment.score_range.max}`);
    console.log(`Max Individual Risk: ${assessment.score_range.individual_max}`);
    
    if (assessment.issues.length > 0) {
      console.log('Issues:');
      assessment.issues.forEach(issue => console.log(`  ❌ ${issue}`));
    } else {
      console.log('✅ No issues detected');
    }
  });
  
  // Overall recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  const allIssues = assessments.flatMap(a => a.issues);
  if (allIssues.length === 0) {
    console.log('🎉 All assessments are properly calibrated!');
  } else {
    console.log('Issues found - standardization needed:');
    [...new Set(allIssues)].forEach(issue => console.log(`  • ${issue}`));
  }
  
  console.log('\n=== STANDARDIZATION TARGET ===');
  console.log('Target ranges:');
  console.log('  All Good: 0-15');
  console.log('  All Bad: 85-100');
  console.log('  Individual Max: 90-100');
  
  return assessments;
}
