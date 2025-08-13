// src/pages/SimpleTest.tsx

import React, { useState } from 'react';

// Simple inline checklist data - no imports needed
const SAMPLE_QUESTIONS = [
  {
    id: 'water_drainage',
    text: 'Does water drain away from the house properly?',
    type: 'binary',
    options: ['Yes', 'No'],
    riskWeight: 3
  },
  {
    id: 'electrical_cords',
    text: 'Are there any damaged electrical cords?',
    type: 'binary', 
    options: ['No damage', 'Some damage'],
    riskWeight: 5
  },
  {
    id: 'visible_mold',
    text: 'Is there visible mold in any rooms?',
    type: 'scale',
    options: ['None', 'A little', 'Some', 'A lot'],
    riskWeight: 4
  }
];

export default function SimpleTest() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  // Simple risk calculation
  const calculateRisk = (questionId: string, response: string) => {
    const question = SAMPLE_QUESTIONS.find(q => q.id === questionId);
    if (!question) return 0;
    
    let responseScore = 0;
    
    if (question.type === 'binary') {
      // For binary: first option = 0 risk, second option = 1 risk
      responseScore = question.options.indexOf(response) === 0 ? 0 : 1;
    } else if (question.type === 'scale') {
      // For scale: distribute risk evenly
      const optionIndex = question.options.indexOf(response);
      responseScore = optionIndex / (question.options.length - 1);
    }
    
    return Math.round(responseScore * question.riskWeight * 20); // Scale to 0-100
  };

  const completedCount = Object.keys(responses).length;
  const totalCount = SAMPLE_QUESTIONS.length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🏠 Checklist Test - Real Questions
          </h1>
          
          {/* Progress */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Progress</span>
              <span className="font-bold text-blue-600">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-gray-600">
            Answer the questions below to test our checklist and risk scoring system.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {SAMPLE_QUESTIONS.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {index + 1}. {question.text}
                </h3>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Risk Weight: {question.riskWeight}
                </span>
              </div>
              
              {/* Answer Options */}
              <div className={`grid gap-3 ${question.type === 'scale' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                {question.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleResponse(question.id, option)}
                    className={`p-3 rounded-lg border-2 transition-all font-medium ${
                      responses[question.id] === option
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Risk Score Display */}
              {responses[question.id] && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      <strong>Response:</strong> {responses[question.id]}
                    </span>
                    <span className={`font-bold text-lg ${
                      calculateRisk(question.id, responses[question.id]) > 50 ? 'text-red-600' : 
                      calculateRisk(question.id, responses[question.id]) > 25 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      Risk: {calculateRisk(question.id, responses[question.id])}/100
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall Results */}
        {completedCount > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Overall Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                <div className="text-blue-800">Questions Answered</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.entries(responses).reduce((sum, [qId, response]) => 
                    sum + calculateRisk(qId, response), 0)}
                </div>
                <div className="text-yellow-800">Total Risk Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((completedCount / totalCount) * 100)}%
                </div>
                <div className="text-green-800">Progress Complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 text-center">
          <a 
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
