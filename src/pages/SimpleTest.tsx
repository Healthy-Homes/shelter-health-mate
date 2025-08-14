// src/pages/SimpleTest.tsx - Phase 2: Section-Based Navigation

import React, { useState } from 'react';
import { ChecklistItem, ResponseMap, SectionNotes } from '../types/checklist';
import { calculateItemRisk, calculateOverallRisk, getCompletenessMessage } from '../utils/riskScoring';

// Import all checklist data
import { TAIWAN_HALST_QUESTIONS } from '../data/taiwanHalstChecklist';
import { US_HEALTHY_HOMES_QUESTIONS } from '../data/usHealthyHomesChecklist';
import { SDOH_QUESTIONS } from '../data/sdohChecklist';

type HomeChecklistType = 'taiwan' | 'us' | null;
type AssessmentPhase = 'selection' | 'assessment' | 'results';

// US Sections constant
const US_SECTIONS = [
  "Yard and Exterior",
  "Exterior Roof, Walls, and Windows", 
  "Basement and Crawlspace",
  "HVAC Equipment",
  "Attic",
  "Plumbing, Fixtures, and Appliances",
  "Interior Walls, Ceilings, Windows, and Doors",
  "Appliances",
  "Electrical Equipment",
  "Garage"
];

// Helper function to get questions by section for US checklist
const getQuestionsBySection = (section: string): ChecklistItem[] => {
  return US_HEALTHY_HOMES_QUESTIONS.filter(q => q.section === section);
};

export default function SimpleTest() {
  // State management
  const [phase, setPhase] = useState<AssessmentPhase>('selection');
  const [homeChecklistType, setHomeChecklistType] = useState<HomeChecklistType>(null);
  const [includeSDOH, setIncludeSDOH] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [sectionNotes, setSectionNotes] = useState<SectionNotes>({});

  // Get current checklist questions and sections
  const getChecklistData = () => {
    let questions: ChecklistItem[] = [];
    let sections: string[] = [];
    
    // Add home inspection questions
    if (homeChecklistType === 'taiwan') {
      questions = [...TAIWAN_HALST_QUESTIONS];
      // Taiwan sections (we'll organize these later)
      sections = ['Layout and Building Structure', 'Bedroom Environment', 'Kitchen Environment', 
                 'Bathroom Environment', 'Living Areas', 'General Conditions'];
    } else if (homeChecklistType === 'us') {
      questions = [...US_HEALTHY_HOMES_QUESTIONS];
      sections = [...US_SECTIONS];
    }
    
    // Add SDOH questions if selected
    if (includeSDOH) {
      questions = [...questions, ...SDOH_QUESTIONS];
      sections = [...sections, 'Social Determinants of Health'];
    }
    
    return { questions, sections };
  };

  const { questions: currentQuestions, sections: currentSections } = getChecklistData();
  const currentSection = currentSections[currentSectionIndex];
  const totalSections = currentSections.length;

  // Get questions for current section
  const getCurrentSectionQuestions = (): ChecklistItem[] => {
    if (currentSection === 'Social Determinants of Health') {
      return SDOH_QUESTIONS;
    }
    
    if (homeChecklistType === 'us') {
      return getQuestionsBySection(currentSection);
    }
    
    // For Taiwan, we'll filter by category for now (until we update Taiwan data structure)
    if (homeChecklistType === 'taiwan') {
      const sectionMappings: Record<string, string[]> = {
        'Layout and Building Structure': ['layout'],
        'Bedroom Environment': ['bedroom'],
        'Kitchen Environment': ['kitchen'],
        'Bathroom Environment': ['bathroom'],
        'Living Areas': ['living_room'],
        'General Conditions': ['general']
      };
      
      const categories = sectionMappings[currentSection] || [];
      return TAIWAN_HALST_QUESTIONS.filter(q => categories.includes(q.category));
    }
    
    return [];
  };

  const sectionQuestions = getCurrentSectionQuestions();

  // Handle responses
  const handleResponse = (itemId: string, value: string) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };

  // Handle section notes
  const handleSectionNotes = (section: string, notes: string) => {
    // Limit to 200 characters for QR code inclusion
    const truncatedNotes = notes.slice(0, 200);
    setSectionNotes(prev => ({ ...prev, [section]: truncatedNotes }));
  };

  // Navigation
  const handleNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      setPhase('results');
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const jumpToSection = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
  };

  const startAssessment = () => {
    if (homeChecklistType || includeSDOH) {
      setPhase('assessment');
      setCurrentSectionIndex(0);
      setResponses({});
      setSectionNotes({});
    }
  };

  const resetAssessment = () => {
    setPhase('selection');
    setHomeChecklistType(null);
    setIncludeSDOH(false);
    setCurrentSectionIndex(0);
    setResponses({});
    setSectionNotes({});
  };

  // Calculate section progress
  const getSectionProgress = (section: string) => {
    const questions = homeChecklistType === 'us' ? getQuestionsBySection(section) : 
                    section === 'Social Determinants of Health' ? SDOH_QUESTIONS :
                    getCurrentSectionQuestions();
    const answered = questions.filter(q => responses[q.item_id]).length;
    return {
      total: questions.length,
      answered,
      percentage: questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0
    };
  };

  // Calculate overall progress
  const overallProgress = {
    sections: currentSections.map(section => ({
      name: section,
      ...getSectionProgress(section)
    })),
    totalQuestions: currentQuestions.length,
    answeredQuestions: Object.keys(responses).length
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

  // Format display text
  const formatDisplayText = (text: string) => {
    return text.replace(/_/g, ' ')
               .split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
  };

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
                {formatDisplayText(option)}
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                  {formatDisplayText(option)}
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
                  {formatDisplayText(option)}
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
                {formatDisplayText(option)}
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
                    48 questions • 6 sections • Air quality focus
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
                    45 questions • 10 sections • Safety focus
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
                    8 questions • 1 section • Social factors focus
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
                  <p>✓ {homeChecklistType === 'taiwan' ? 'Taiwan HALST' : 'US Healthy Homes'} 
                     ({homeChecklistType === 'taiwan' ? '48 questions, 6 sections' : '45 questions, 10 sections'})</p>
                )}
                {includeSDOH && (
                  <p>✓ Social Determinants of Health (8 questions, 1 section)</p>
                )}
                {(homeChecklistType || includeSDOH) && (
                  <p className="font-semibold mt-2">
                    Total: {getChecklistData().questions.length} questions across {getChecklistData().sections.length} sections
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

      {/* Assessment Phase - Section-Based */}
      {phase === 'assessment' && (
        <div className="max-w-6xl mx-auto p-6">
          {/* Section Navigation Header */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Section {currentSectionIndex + 1} of {totalSections}: {currentSection}
              </h1>
              <span className="text-sm text-gray-500">
                {Math.round(((currentSectionIndex + 1) / totalSections) * 100)}% Complete
              </span>
            </div>
            
            {/* Section Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
              />
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2">
              {currentSections.map((section, index) => {
                const sectionProgress = getSectionProgress(section);
                return (
                  <button
                    key={section}
                    onClick={() => jumpToSection(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      index === currentSectionIndex
                        ? 'bg-blue-500 text-white'
                        : sectionProgress.percentage === 100
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : sectionProgress.answered > 0
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {section.length > 20 ? section.substring(0, 17) + '...' : section}
                    <span className="ml-1 text-xs">
                      ({sectionProgress.answered}/{sectionProgress.total})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Section Questions */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{currentSection}</h2>
              <p className="text-gray-600">
                Complete all questions in this section before proceeding to the next.
              </p>
            </div>

            {/* Questions Grid */}
            <div className="space-y-6">
              {sectionQuestions.map((question, index) => (
                <div key={question.item_id} className="border-l-4 border-blue-400 bg-blue-50 p-6 rounded-r-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          {question.item_id}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          question.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          question.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          question.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {question.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {question.question_text || question.question_key}
                      </h3>
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="bg-white p-4 rounded-lg">
                    {renderQuestionInput(question)}
                  </div>
                </div>
              ))}
            </div>

            {/* Section Notes */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Section Notes & Comments
              </h3>
              <textarea
                value={sectionNotes[currentSection] || ''}
                onChange={(e) => handleSectionNotes(currentSection, e.target.value)}
                placeholder="Add any additional notes or observations for this section..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {(sectionNotes[currentSection] || '').length}/200 characters
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              ← Previous Section
            </button>
            
            <button
              onClick={resetAssessment}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Start Over
            </button>
            
            <button
              onClick={handleNextSection}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {currentSectionIndex === totalSections - 1 ? 'Complete Assessment' : 'Next Section →'}
            </button>
          </div>
        </div>
      )}

      {/* Results Phase - Enhanced with Completeness */}
      {phase === 'results' && results && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              📊 Assessment Complete
            </h1>
            
            {/* Completeness Warning */}
            {results.completeness_flag !== 'complete' && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                results.completeness_flag === 'potentially_deficient' 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className={`font-semibold ${
                  results.completeness_flag === 'potentially_deficient' 
                    ? 'text-red-800' 
                    : 'text-yellow-800'
                }`}>
                  ⚠️ Assessment Completeness Notice
                </div>
                <p className={`text-sm mt-1 ${
                  results.completeness_flag === 'potentially_deficient' 
                    ? 'text-red-700' 
                    : 'text-yellow-700'
                }`}>
                  {getCompletenessMessage(results.completeness_flag, results.na_percentage)}
                </p>
              </div>
            )}
            
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">{results.na_count || 0}</div>
                <div className="text-gray-800">N/A Responses</div>
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
                          Response: {formatDisplayText(intervention.raw_response)}
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

            {/* Section Notes Summary */}
            {Object.keys(sectionNotes).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Section Notes</h2>
                <div className="space-y-3">
                  {Object.entries(sectionNotes).map(([section, notes]) => (
                    notes && (
                      <div key={section} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900">{section}</h3>
                        <p className="text-gray-700 text-sm">{notes}</p>
                      </div>
                    )
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
