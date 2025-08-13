// src/components/checklist/TestChecklist.tsx

import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { SAMPLE_US_CHECKLIST, SAMPLE_TAIWAN_CHECKLIST } from '../../data/sampleChecklist';
import { calculateItemRisk } from '../../utils/riskScoring';
import { ResponseMap } from '../../types/checklist';

export const TestChecklist: React.FC = () => {
  const [responses, setResponses] = useState<ResponseMap>({});
  const [selectedChecklist, setSelectedChecklist] = useState<'US' | 'Taiwan'>('US');
  
  const currentData = selectedChecklist === 'US' ? SAMPLE_US_CHECKLIST : SAMPLE_TAIWAN_CHECKLIST;
  
  const handleResponse = (itemId: string, value: string) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };
  
  const completedCount = Object.keys(responses).length;
  const totalCount = currentData.length;
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🏠 Checklist System Test
        </h1>
        
        {/* Checklist Selector */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSelectedChecklist('US')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedChecklist === 'US'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇺🇸 US Checklist ({SAMPLE_US_CHECKLIST.length} items)
          </button>
          <button
            onClick={() => setSelectedChecklist('Taiwan')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedChecklist === 'Taiwan'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇹🇼 Taiwan Checklist ({SAMPLE_TAIWAN_CHECKLIST.length} items)
          </button>
        </div>
        
        {/* Progress */}
        <div className="bg-gray-100 rounded-lg p-4">
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
      </div>
      
      {/* Questions */}
      <div className="space-y-6">
        {currentData.map(item => (
          <QuestionCard
            key={item.item_id}
            item={item}
            value={responses[item.item_id]}
            onChange={(value) => handleResponse(item.item_id, value)}
            onHelp={(item) => alert(`Help for: ${item.question_key}\n\nRisk Category: ${item.risk_category}\nPriority: ${item.priority}`)}
          />
        ))}
      </div>
      
      {/* Results Preview */}
      {completedCount > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Live Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentData.map(item => {
              const response = responses[item.item_id];
              if (!response) return null;
              
              const risk = calculateItemRisk(item, response);
              
              return (
                <div key={item.item_id} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">{item.item_id}</div>
                  <div className="text-sm text-gray-600">Response: {response}</div>
                  <div className={`text-lg font-bold ${
                    risk.risk_score > 50 ? 'text-red-600' : 
                    risk.risk_score > 25 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Risk Score: {risk.risk_score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
