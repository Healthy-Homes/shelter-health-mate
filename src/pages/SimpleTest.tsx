// src/pages/SimpleTest.tsx - Enhanced with Multiple Checklists

import React, { useState } from 'react';
import { ChecklistItem, ResponseMap } from '../types/checklist';
import { calculateItemRisk, calculateOverallRisk } from '../utils/riskScoring';

// Import all checklist data
import { TAIWAN_HALST_QUESTIONS } from '../data/taiwanHalstChecklist';
import { US_HEALTHY_HOMES_QUESTIONS } from '../data/usHealthyHomesChecklist';
import { SDOH_QUESTIONS } from '../data/sdohChecklist';

type HomeChecklistType = 'taiwan' | 'us' | null;
type AssessmentPhase = 'selection' | 'assessment' | 'results';

export default function SimpleTest() {
  // State management
  const [phase, setPhase] = useState<AssessmentPhase>('selection');
  const [homeChecklistType, setHomeChecklistType] = useState<HomeChecklistType>(null);
  const [includeSDOH, setIncludeSDOH] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});

  // Get current checklist questions based on selection
  const getChecklistQuestions = (): ChecklistItem[] => {
    let questions: ChecklistItem[] = [];
    
    // Add home inspection questions
    if (homeChecklistType === 'taiwan') {
      questions = [...TAIWAN_HALST_QUESTIONS];
    } else if (homeChecklistType === 'us') {
      questions = [...US_HEALTHY_HOMES_QUESTIONS];
    }
    
    // Add SDOH questions if selected
    if (includeSDOH) {
      questions = [...questions, ...SDOH_QUESTIONS];
    }
    
    return questions;
  };

  const currentQuestions = getChecklistQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = currentQuestions.length;

  // Handle responses
  const handleResponse = (itemId: string, value: string) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const startAssessment = () => {
    if (homeChecklistType || includeSDOH) {
      setPhase('assessment');
      setCurrentQuestionIndex(0);
      setResponses({});
    }
  };

  const resetAssessment = () => {
    setPhase('selection');
    setHomeChecklistType(null);
    setIncludeSDOH(false);
    setCurrentQuestionIndex(0);
    setResponses({});
  };

  // Calculate results
  const calculateResults = () => {
    const itemRisks = currentQuestions.map(question => {
      const userResponse = responses[question.item_id] || '';
      return calculateItemRisk(question, userResponse);
    });
    
    return calculateOverallRisk(itemRisks);
  };

  const results = phase === 'results' ? calculateResults() : null;
  const completedCount = Object.keys(responses).length;

  // Render question input based on type
  const renderQuestionInput = (item: ChecklistItem) => {
    const options = item.response_options.split(',').map(opt => opt.trim());
    const currentValue = responses[item.item_id] || '';

    switch (item.response_type) {
      case 'binary':
        return (
          <div className="grid grid-cols-2 gap-3">
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleResponse(item.item_id, option)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  currentValue === option
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => handleResponse(item.item_id, option)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    currentValue === option
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center">
              <span className="text-sm text-green-600 font-medium">Better</span>
              <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full"></div>
              <span className="text-sm text-red-600 font-medium">Worse</span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {options.map(option => (
              <label key={option} className="flex items-center p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={item.item_id}
                  value={option}
                  checked={currentValue === option}
                  onChange={() => handleResponse(item.item_id, option)}
                  className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
        );

      case 'numeric':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleResponse(item.item_id, e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select...</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponse(item.item_id, e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your response..."
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Selection Phase */}
      {phase === 'selection' && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🏠 Health Assessment Selection
            </h1>
            
            {/* Home Inspection Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1. Home Inspection Assessment
              </h2>
              <p className="text-gray-600 mb-4">
                Choose a home inspection checklist based on your location and needs:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setHomeChecklistType('taiwan')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    homeChecklistType === 'taiwan'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    🇹🇼 Taiwan HALST Assessment
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Hualien home environment assessment focusing on indoor air quality and housing conditions
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    48 questions • Air quality focus • Taiwan standards
                  </div>
                </button>
                
                <button
                  onClick={() => setHomeChecklistType('us')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    homeChecklistType === 'us'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    🇺🇸 US Healthy Homes (NCHH)
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Comprehensive home health and safety inspection based on National Center for Healthy Housing guidelines
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    39 questions • Safety focus • US standards
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setHomeChecklistType(null)}
                className={`mt-3 px-4 py-2 rounded-lg border-2 transition-all ${
                  homeChecklistType === null
                    ? 'border-gray-500 bg-gray-100'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Skip home inspection
              </button>
            </div>

            {/* SDOH Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Social Determinants of Health (SDOH)
              </h2>
              <p className="text-gray-600 mb-4">
                Optional assessment of social factors affecting health outcomes:
              </p>
              
              <label className="flex items-center p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSDOH}
                  onChange={(e) => setIncludeSDOH(e.target.checked)}
                  className="mr-4 h-5 w-5 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <h3 className="font-bold text-gray-900">
                    Include SDOH Assessment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Food security, housing stability, healthcare access, transportation
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    8 questions • Social factors focus • Evidence-based
                  </div>
                </div>
              </label>
            </div>

            {/* Selection Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Assessment Summary:</h3>
              <div className="text-sm text-gray-700">
                {!homeChecklistType && !includeSDOH && (
                  <p className="text-red-600">Please select at least one assessment type</p>
                )}
                {homeChecklistType && (
                  <p>✓ {homeChecklistType === 'taiwan' ? 'Taiwan HALST' : 'US Healthy Homes'} ({homeChecklistType === 'taiwan' ? '48' : '39'} questions)</p>
                )}
                {includeSDOH && (
                  <p>✓ Social Determinants of Health (8 questions)</p>
                )}
                {(homeChecklistType || includeSDOH) && (
                  <p className="font-semibold mt-2">
                    Total: {getChecklistQuestions().length} questions
                  </p>
                )}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-between items-center">
              <a 
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Main App
              </a>
              
              <button
                onClick={startAssessment}
                disabled={!homeChecklistType && !includeSDOH}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Start Assessment →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Phase */}
      {phase === 'assessment' && currentQuestion && (
        <div className="max-w-4xl mx-auto p-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {currentQuestion.category} • {currentQuestion.item_id}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  currentQuestion.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  currentQuestion.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  currentQuestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {currentQuestion.priority.toUpperCase()}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentQuestion.question_key
                  .replace(/[._]/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())
                  .replace(/^[A-Za-z]+\s/, '')}?
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                <p className="text-sm text-gray-700">
                  💡 This assessment item helps identify {currentQuestion.risk_category.replace(/_/g, ' ')} issues.
                  {currentQuestion.frequency && ` Recommended check frequency: ${currentQuestion.frequency.replace(/_/g, ' ')}.`}
                </p>
              </div>
            </div>

            {/* Question Input */}
            {renderQuestionInput(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              ← Previous
            </button>
            
            <button
              onClick={resetAssessment}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Start Over
            </button>
            
            <button
              onClick={handleNext}
              disabled={!responses[currentQuestion.item_id]}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Assessment' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && results && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              📊 Assessment Complete
            </h1>
            
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{results.completion_rate}%</div>
                <div className="text-blue-800">Completion Rate</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{results.overall_risk_score}</div>
                <div className="text-yellow-800">Overall Risk Score</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{results.issues_found}</div>
                <div className="text-red-800">Issues Identified</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.actions_needed}</div>
                <div className="text-green-800">Actions Needed</div>
              </div>
            </div>

            {/* Risk Level Assessment */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Level Assessment</h2>
              <div className={`p-6 rounded-lg border-l-4 ${
                results.risk_level === 'critical' ? 'bg-red-50 border-red-400' :
                results.risk_level === 'high' ? 'bg-orange-50 border-orange-400' :
                results.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-green-50 border-green-400'
              }`}>
                <div className={`text-2xl font-bold mb-2 ${
                  results.risk_level === 'critical' ? 'text-red-700' :
                  results.risk_level === 'high' ? 'text-orange-700' :
                  results.risk_level === 'medium' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {results.risk_level.toUpperCase()} RISK
                </div>
                <p className="text-gray-700">
                  {results.risk_level === 'critical' && 'Immediate attention required. Contact professionals for critical safety issues.'}
                  {results.risk_level === 'high' && 'Several issues need prompt attention. Consider professional assessment.'}
                  {results.risk_level === 'medium' && 'Some areas for improvement identified. Address when convenient.'}
                  {results.risk_level === 'low' && 'Good overall condition with minimal issues identified.'}
                </p>
              </div>
            </div>

            {/* Priority Interventions */}
            {results.priority_interventions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Priority Actions</h2>
                <div className="space-y-3">
                  {results.priority_interventions.map((intervention, index) => (
                    <div key={intervention.item_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">
                          {intervention.category.toUpperCase()}: {intervention.subcategory}
                        </span>
                        <div className="text-sm text-gray-600">
                          Response: {intervention.raw_response}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        intervention.risk_score > 70 ? 'text-red-600' :
                        intervention.risk_score > 40 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {intervention.risk_score}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={resetAssessment}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Take New Assessment
              </button>
              
              <a 
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Main App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
