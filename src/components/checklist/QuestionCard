// src/components/checklist/QuestionCard.tsx

import React from 'react';
import { ChecklistItem } from '../../types/checklist';

interface QuestionCardProps {
  item: ChecklistItem;
  value?: string;
  onChange: (value: string) => void;
  onHelp?: (item: ChecklistItem) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  item, 
  value, 
  onChange, 
  onHelp 
}) => {
  const renderResponseInput = () => {
    const options = item.response_options ? item.response_options.split(',') : [];

    switch (item.response_type) {
      case 'binary':
        return (
          <div className="flex gap-4 mt-4">
            {options.map(option => (
              <button
                key={option}
                onClick={() => onChange(option)}
                className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                  value === option
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
          <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => onChange(option)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    value === option
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
          <div className="mt-4 space-y-2">
            {options.map(option => (
              <label key={option} className="flex items-center p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={item.item_id}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
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
          <div className="mt-4">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select...</option>
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="mt-4 w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your response..."
          />
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'fire_safety':
      case 'electrical_safety': return 'bg-red-50 border-l-red-400';
      case 'water_damage':
      case 'flooding': return 'bg-blue-50 border-l-blue-400';
      case 'air_quality': return 'bg-purple-50 border-l-purple-400';
      case 'injury': return 'bg-orange-50 border-l-orange-400';
      default: return 'bg-gray-50 border-l-gray-400';
    }
  };

  // Create readable question text from question_key
  const questionText = item.question_key
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/^[A-Za-z]+\s/, '') // Remove prefix like "Ext " or "Layout "
    + '?';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-shadow">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {item.category} • {item.item_id}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getPriorityColor(item.priority)}`}>
              {item.priority.toUpperCase()}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {questionText}
          </h3>
        </div>
        
        {onHelp && (
          <button
            onClick={() => onHelp(item)}
            className="ml-4 p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
            title="Get Help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className={`mb-4 p-4 rounded-lg border-l-4 ${getRiskCategoryColor(item.risk_category)}`}>
        <p className="text-sm text-gray-700 font-medium">
          💡 Check this item for safety and health issues related to <strong>{item.subcategory}</strong>.
          {item.frequency && ` Recommended check frequency: ${item.frequency.replace(/_/g, ' ')}.`}
        </p>
      </div>

      {/* Response Input */}
      {renderResponseInput()}

      {/* Additional Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Risk Category: {item.risk_category.replace(/_/g, ' ')}</span>
        <span>Risk Weight: {item.risk_weight}/5</span>
      </div>
    </div>
  );
};
