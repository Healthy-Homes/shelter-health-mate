// src/pages/SimpleTest.tsx - Fixed with proper multi-select detection

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ExportModal } from '../components/reports/ExportModal';

import { ChecklistItem, ResponseMap, SectionNotes } from '../types/checklist';
import { calculateItemRisk, calculateOverallRisk, getCompletenessMessage } from '../utils/riskScoring';
import { testScoringConsistency } from '../utils/scoringAnalysis';

// Import all checklist data
import { TAIWAN_HALST_QUESTIONS } from '../data/taiwanHalstChecklist';
import { US_HEALTHY_HOMES_QUESTIONS } from '../data/usHealthyHomesChecklist';
import { ELDER_SAFETY_QUESTIONS } from '../data/elderSafetyChecklist';
import { SDOH_QUESTIONS } from '../data/sdohChecklist';

type HomeChecklistType = 'taiwan' | 'us' | null;
type AssessmentPhase = 'selection' | 'assessment' | 'results';

// Updated Taiwan sections to match HALST data
const TAIWAN_SECTIONS = [
  "layout",
  "bedroomDay1",
  "bedroomDay8",
  "general",
  "kitchen",
  "bathroom",
  "safe"
];

const US_SECTIONS = [
  "yardAndExterior",
  "exteriorRoof",
  "basementCrawlspace",
  "hvacEquipment",
  "attic",
  "plumbingFixtures",
  "interiorWalls",
  "appliances",
  "electricalEquipment",
  "garage"
];

const ELDER_SECTIONS = [
  "floors",
  "stairsSteps",
  "kitchen",
  "bedrooms",
  "bathrooms",
  "livingAreas",
  "fireSafety",
  "electricalSafety",
  "medications",
  "generalSafety"
];

const SDOH_SECTIONS = [
  "foodSecurity",
  "housingSecurity",
  "transportation",
  "socialSupport",
  "stressAndSafety"
];

// Updated section mapping for Taiwan HALST
const SECTION_MAPPING: Record<string, string> = {
  "layout": "Layout",
  "bedroomDay1": "Bedroom (Day 1)",
  "bedroomDay8": "Bedroom (Day 8)",
  "general": "General",
  "kitchen": "Kitchen",
  "bathroom": "Bathroom",
  "safe": "Safe",
  "yardAndExterior": "Yard and Exterior",
  "exteriorRoof": "Exterior Roof, Walls, and Windows",
  "basementCrawlspace": "Basement and Crawlspace",
  "hvacEquipment": "HVAC Equipment",
  "attic": "Attic",
  "plumbingFixtures": "Plumbing, Fixtures, and Appliances",
  "interiorWalls": "Interior Walls, Ceilings, Windows, and Doors",
  "appliances": "Appliances",
  "electricalEquipment": "Electrical Equipment",
  "garage": "Garage",
  "floors": "Floors",
  "stairsSteps": "Stairs and Steps",
  "bedrooms": "Bedrooms",
  "bathrooms": "Bathrooms",
  "livingAreas": "Living Areas",
  "fireSafety": "Fire Safety",
  "electricalSafety": "Electrical Safety",
  "medications": "Medications",
  "generalSafety": "General Safety",
  "foodSecurity": "Food Security",
  "housingSecurity": "Housing Security",
  "transportation": "Transportation",
  "socialSupport": "Social Support",
  "stressAndSafety": "Stress and Safety"
};

// Helper functions
const getResponseOptions = (question: ChecklistItem): string[] => {
  if (Array.isArray(question.response_options)) {
    return question.response_options.map(opt => opt.value);
  } else {
    return question.response_options.split(',').map(opt => opt.trim());
  }
};

// Fixed: Use exact key lookup without string manipulation
const getResponseLabel = (q: ChecklistItem, value: string, t: any): string => {
  const key = `questions.common.responses.${value}`;
  const translated = t(key);
  if (translated !== key) return translated;
  const opt = Array.isArray(q.response_options) ? q.response_options.find(o => o.value === value) : undefined;
  return opt?.label ?? value;
};

const getQuestionText = (question: ChecklistItem, t: any): string => {
  // Try to get translated question for Taiwan HALST
  if (question.item_id && TAIWAN_HALST_QUESTIONS.some(q => q.item_id === question.item_id)) {
    const translationKey = `questions.taiwan.${question.item_id}.question`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // Try US Healthy Homes translations
  if (question.item_id && US_HEALTHY_HOMES_QUESTIONS.some(q => q.item_id === question.item_id)) {
    const translationKey = `questions.us.${question.item_id}.question`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // Try Elder Safety translations
  if (question.item_id && ELDER_SAFETY_QUESTIONS.some(q => q.item_id === question.item_id)) {
    const translationKey = `questions.elder.${question.item_id}.question`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // Try SDOH translations
  if (question.item_id && SDOH_QUESTIONS.some(q => q.item_id === question.item_id)) {
    const translationKey = `questions.sdoh.${question.item_id}.question`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // Fall back to the English question_text from the data
  return question.question_text;
};

const getQuestionsBySection = (questions: ChecklistItem[], sectionKey: string): ChecklistItem[] => {
  const sectionName = SECTION_MAPPING[sectionKey] || sectionKey;
  return questions.filter(q => q.section === sectionName);
};

const getSectionDisplayName = (sectionName: string, t: any): string => {
  const sectionKey = Object.keys(SECTION_MAPPING).find(key => SECTION_MAPPING[key] === sectionName);
  if (sectionKey) {
    return t(`sections.names.${sectionKey}`);
  }
  return sectionName;
};

// Fixed: Check if question is multi-select based on response_type
const isMultiSelect = (q: ChecklistItem): boolean => q.response_type === 'multi_select';

// Fixed: Handle multi-select parents in conditionals
const shouldShowQuestion = (q: ChecklistItem, responses: ResponseMap): boolean => {
  const c = q.conditional;
  if (!c) return true;
  const parent = responses[c.question_id];
  if (parent == null || parent === '') return false;

  const parentSet = new Set(String(parent).split('|').filter(Boolean));

  if (c.value !== undefined) return parentSet.has(c.value);
  if (c.value_not !== undefined) {
    const nots = Array.isArray(c.value_not) ? c.value_not : [c.value_not];
    return !nots.some(n => parentSet.has(n));
  }
  return true;
};

export default function SimpleTest() {
  const { t } = useTranslation();

  // State management
  const [phase, setPhase] = useState<AssessmentPhase>('selection');
  const [homeChecklistType, setHomeChecklistType] = useState<HomeChecklistType>(null);
  const [includeSDOH, setIncludeSDOH] = useState(false);
  const [includeElderSafety, setIncludeElderSafety] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [sectionNotes, setSectionNotes] = useState<SectionNotes>({});
  const [showExportModal, setShowExportModal] = useState(false);

  // Get current questions and sections
  const getCurrentQuestions = (): ChecklistItem[] => {
    let questions: ChecklistItem[] = [];
    
    if (homeChecklistType === 'taiwan') {
      questions = [...questions, ...TAIWAN_HALST_QUESTIONS];
    } else if (homeChecklistType === 'us') {
      questions = [...questions, ...US_HEALTHY_HOMES_QUESTIONS];
    }
    
    if (includeElderSafety) {
      questions = [...questions, ...ELDER_SAFETY_QUESTIONS];
    }
    
    if (includeSDOH) {
      questions = [...questions, ...SDOH_QUESTIONS];
    }
    
    return questions;
  };

  const getCurrentSections = (): string[] => {
    let sections: string[] = [];
    
    if (homeChecklistType === 'taiwan') {
      sections = [...sections, ...TAIWAN_SECTIONS];
    } else if (homeChecklistType === 'us') {
      sections = [...sections, ...US_SECTIONS];
    }
    
    if (includeElderSafety) {
      sections = [...sections, ...ELDER_SECTIONS];
    }
    
    if (includeSDOH) {
      sections = [...sections, ...SDOH_SECTIONS];
    }
    
    return sections;
  };

  const currentQuestions = getCurrentQuestions();
  const currentSections = getCurrentSections();
  const currentSectionKey = currentSections[currentSectionIndex];
  const sectionQuestions = getQuestionsBySection(currentQuestions, currentSectionKey);

  // Response handling
  const handleResponse = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleSectionNote = (section: string, note: string) => {
    const truncatedNote = note.slice(0, 200);
    setSectionNotes(prev => ({
      ...prev,
      [section]: truncatedNote
    }));
  };

  // Navigation functions
  const goToNextSection = () => {
    if (currentSectionIndex < currentSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      setPhase('results');
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const goToSection = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
  };

  // Fixed: Use correct signature for calculateOverallRisk
  const calculateResults = () => {
    return calculateOverallRisk(currentQuestions, responses);
  };

  // Reset assessment
  const resetAssessment = () => {
    setPhase('selection');
    setHomeChecklistType(null);
    setIncludeSDOH(false);
    setIncludeElderSafety(false);
    setCurrentSectionIndex(0);
    setResponses({});
    setSectionNotes({});
  };

  // Start assessment
  const startAssessment = () => {
    if (homeChecklistType || includeElderSafety || includeSDOH) {
      setPhase('assessment');
    }
  };

  // Calculate progress
  const getTotalAnsweredQuestions = () => {
    return Object.keys(responses).filter(key => 
      !key.endsWith('__other') && responses[key] !== ''
    ).length;
  };

  const getSectionProgress = (sectionKey: string) => {
    const questions = getQuestionsBySection(currentQuestions, sectionKey);
    const answered = questions.filter(q => 
      shouldShowQuestion(q, responses) && responses[q.item_id]
    ).length;
    return { total: questions.length, answered, percentage: Math.round((answered / questions.length) * 100) };
  };

  // Render functions
  const renderSelectionPhase = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('assessment.title')}</h1>
          <p className="text-lg text-gray-600">{t('assessment.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('assessment.homeInspection')}</h2>
          <p className="text-gray-600 mb-4">{t('assessment.chooseRegion')}</p>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="homeChecklist"
                value="taiwan"
                checked={homeChecklistType === 'taiwan'}
                onChange={(e) => setHomeChecklistType(e.target.value as HomeChecklistType)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{t('checklists.taiwan.title')}</div>
                <div className="text-sm text-gray-600">{t('checklists.taiwan.description', { count: TAIWAN_HALST_QUESTIONS.length })}</div>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="homeChecklist"
                value="us"
                checked={homeChecklistType === 'us'}
                onChange={(e) => setHomeChecklistType(e.target.value as HomeChecklistType)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{t('checklists.us.title')}</div>
                <div className="text-sm text-gray-600">{t('checklists.us.description', { count: US_HEALTHY_HOMES_QUESTIONS.length })}</div>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="homeChecklist"
                value=""
                checked={homeChecklistType === null}
                onChange={() => setHomeChecklistType(null)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{t('assessment.skipHomeInspection')}</div>
                <div className="text-sm text-gray-600">{t('assessment.onlyCompleteAdditional')}</div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-200">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={includeElderSafety}
              onChange={(e) => setIncludeElderSafety(e.target.checked)}
              className="mt-1 mr-3 text-orange-600"
            />
            <div>
              <div className="font-medium text-gray-900">{t('checklists.elderSafety.title')}</div>
              <div className="text-sm text-gray-600">
                {t('checklists.elderSafety.description', { count: ELDER_SAFETY_QUESTIONS.length })}
              </div>
            </div>
          </label>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={includeSDOH}
              onChange={(e) => setIncludeSDOH(e.target.checked)}
              className="mt-1 mr-3 text-purple-600"
            />
            <div>
              <div className="font-medium text-gray-900">{t('checklists.sdoh.title')}</div>
              <div className="text-sm text-gray-600">
                {t('checklists.sdoh.description', { count: SDOH_QUESTIONS.length })}
              </div>
            </div>
          </label>
        </div>

        {(homeChecklistType || includeElderSafety || includeSDOH) && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">{t('assessment.assessmentSummary')}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{t('assessment.totalQuestions')}: <span className="font-medium">{getCurrentQuestions().length}</span></div>
              <div>{t('assessment.totalSections')}: <span className="font-medium">{getCurrentSections().length}</span></div>
              <div>{t('assessment.estimatedTime')}: <span className="font-medium">{Math.ceil(getCurrentQuestions().length / 2)} {t('assessment.minutes')}</span></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-6">
          <div className="flex space-x-4">
            <a 
              href="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('navigation.backToMain')}
            </a>
            
            <button
              onClick={() => testScoringConsistency()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('analysis.runScoringAnalysis')}
            </button>
          </div>

          <button
            onClick={startAssessment}
            disabled={!homeChecklistType && !includeElderSafety && !includeSDOH}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              homeChecklistType || includeElderSafety || includeSDOH
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('navigation.startAssessment')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssessmentPhase = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('assessment.title')}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {t('assessment.questionsAnswered', { answered: getTotalAnsweredQuestions(), total: currentQuestions.length })}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getTotalAnsweredQuestions() / currentQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t('sections.progress', { current: currentSectionIndex + 1, total: currentSections.length })}</h2>
            <div className="space-y-2">
              {currentSections.map((sectionKey, index) => {
                const progress = getSectionProgress(sectionKey);
                const isActive = index === currentSectionIndex;
                const isComplete = progress.answered === progress.total && progress.total > 0;
                
                return (
                  <button
                    key={sectionKey}
                    onClick={() => goToSection(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900' 
                        : isComplete
                        ? 'bg-green-50 text-green-800 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{t(`sections.names.${sectionKey}`)}</span>
                      {isComplete && <span className="text-green-600">✓</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('sections.completed', { answered: progress.answered, total: progress.total })}
                    </div>
                    {progress.total > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            isComplete ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t(`sections.names.${currentSectionKey}`)}</h2>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{t('sections.progress', { current: currentSectionIndex + 1, total: currentSections.length })}</span>
                <span>{t('sections.completed', { answered: getSectionProgress(currentSectionKey).answered, total: sectionQuestions.length })}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {sectionQuestions.map((question) => {
                if (!shouldShowQuestion(question, responses)) {
                  return null;
                }

                const currentResponse = responses[question.item_id] || '';
                const showOtherSpecify = (question as any).other_specify && currentResponse === 'other';
                
                return (
                  <div key={question.item_id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {getQuestionText(question, t)}
                    </h3>

                    {question.response_type === 'numeric' ? (
                      <input
                        type="number"
                        value={currentResponse}
                        onChange={(e) => handleResponse(question.item_id, e.target.value)}
                        min={question.min}
                        max={question.max}
                        className="w-32 p-2 border rounded-lg"
                        placeholder="Enter value"
                      />
                    ) : question.response_type === 'multiple_choice' || question.response_type === 'multi_select' || question.response_type === 'binary' ? (
                      <div className="space-y-2">
                        {(() => {
                          const opts = getResponseOptions(question);
                          if (isMultiSelect(question)) {
                            // Fixed: Multi-select with checkboxes
                            const set = new Set((responses[question.item_id] || '').split('|').filter(Boolean));
                            return opts.map(opt => (
                              <label key={opt} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={set.has(opt)}
                                  onChange={(e) => {
                                    const next = new Set(set);
                                    e.target.checked ? next.add(opt) : next.delete(opt);
                                    handleResponse(question.item_id, Array.from(next).join('|'));
                                  }}
                                  className="mr-3"
                                />
                                <span className="text-gray-800">
                                  {getResponseLabel(question, opt, t)}
                                </span>
                              </label>
                            ));
                          } else {
                            // Single select with radios
                            return opts.map((option) => (
                              <label key={option} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name={question.item_id}
                                  value={option}
                                  checked={currentResponse === option}
                                  onChange={(e) => handleResponse(question.item_id, e.target.value)}
                                  className="mr-3"
                                />
                                <span className="text-gray-800">
                                  {getResponseLabel(question, option, t)}
                                </span>
                              </label>
                            ));
                          }
                        })()}
                      </div>
                    ) : null}

                    {showOtherSpecify && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Please specify..."
                          value={responses[`${question.item_id}__other`] || ''}
                          onChange={(e) => handleResponse(`${question.item_id}__other`, e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sections.sectionNotes')}
                </label>
                <textarea
                  value={sectionNotes[t(`sections.names.${currentSectionKey}`)] || ''}
                  onChange={(e) => handleSectionNote(t(`sections.names.${currentSectionKey}`), e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('sections.notesPlaceholder')}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {t('sections.charactersRemaining', { remaining: 200 - (sectionNotes[t(`sections.names.${currentSectionKey}`)] || '').length })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentSectionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {t('navigation.previousSection')}
              </button>

              <button
                onClick={goToNextSection}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                {currentSectionIndex === currentSections.length - 1 ? t('navigation.completeAssessment') : t('navigation.nextSection')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsPhase = () => {
    const results = calculateResults();
    const answeredQuestions = getTotalAnsweredQuestions();
    const completionRate = Math.round((answeredQuestions / currentQuestions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('results.title')}</h1>
            <p className="text-lg text-gray-600">{t('results.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{results.risk_score}</div>
                <div className="text-red-800">{t('results.riskScore')}</div>
                <div className="text-sm text-red-600 mt-1">{t('results.outOf100')}</div>
              </div>
              
              <div className={`p-6 rounded-lg ${
                results.risk_level === 'critical' ? 'bg-red-100' :
                results.risk_level === 'high' ? 'bg-orange-100' :
                results.risk_level === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  results.risk_level === 'critical' ? 'text-red-600' :
                  results.risk_level === 'high' ? 'text-orange-600' :
                  results.risk_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {t(`results.riskLevels.${(results.risk_level || '').toLowerCase()}`)}
                </div>
                <div className="text-gray-800">{t('results.riskLevel')}</div>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
                <div className="text-blue-800">{t('results.completionRate')}</div>
                <div className="text-sm text-blue-600 mt-1">{t('results.questionsAnswered', { answered: answeredQuestions, total: currentQuestions.length })}</div>
              </div>
            </div>
          </div>

          {results.questions_with_issues > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('results.issuesIdentified')}</h2>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-orange-800 font-medium">
                  {t('results.areasNeedAttention', { count: results.questions_with_issues, total: answeredQuestions })}
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  {t('results.reviewInterventions')}
                </div>
              </div>
            </div>
          )}

          {results.priority_interventions.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('results.priorityInterventions')}</h2>
              <div className="space-y-3">
                {results.priority_interventions.slice(0, 10).map((intervention) => (
                  <div key={intervention.item_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getSectionDisplayName(intervention.section, t)}</div>
                      <div className="text-sm text-gray-600">{t(`results.priorities.${intervention.priority}`)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        intervention.risk_score > 70 ? 'text-red-600' :
                        intervention.risk_score > 40 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {intervention.risk_score}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(sectionNotes).length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('results.sectionNotes')}</h2>
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

          <div className="p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={resetAssessment}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('results.takeNewAssessment')}
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('export.title')}
                </button>
                
                <a 
                  href="/"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t('navigation.backToMain')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {phase === 'selection' && renderSelectionPhase()}
      {phase === 'assessment' && renderAssessmentPhase()}
      {phase === 'results' && renderResultsPhase()}
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        results={calculateResults()}
        responses={responses}
        questions={currentQuestions}
      />
    </div>
  );
}
