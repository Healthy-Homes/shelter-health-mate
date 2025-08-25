// src/pages/SimpleTest.tsx - With Question Translation Supports

import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

// Section constants with translation keys
const TAIWAN_SECTIONS = [
  "layoutAndBuilding",
  "bedroomEnvironment", 
  "kitchenEnvironment",
  "bathroomEnvironment",
  "livingAreas",
  "generalConditions"
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

// Section mapping for backwards compatibility with existing questions
const SECTION_MAPPING: Record<string, string> = {
  "layoutAndBuilding": "Layout and Building Structure",
  "bedroomEnvironment": "Bedroom Environment",
  "kitchenEnvironment": "Kitchen Environment",
  "bathroomEnvironment": "Bathroom Environment",
  "livingAreas": "Living Areas",
  "generalConditions": "General Conditions",
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
  "kitchen": "Kitchen",
  "bedrooms": "Bedrooms",
  "bathrooms": "Bathrooms",
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

// Assessment type mapping for translation keys
const ASSESSMENT_TYPE_MAP: Record<string, string> = {
  'HALST': 'taiwan',
  'US': 'us', 
  'ELDER': 'elder',
  'SDOH': 'sdoh'
};

// Helper functions for response options compatibility
const getResponseOptions = (question: ChecklistItem): string[] => {
  if (Array.isArray(question.response_options)) {
    // New format: array of objects
    return question.response_options.map(opt => opt.value);
  } else {
    // Old format: comma-separated string
    return question.response_options.split(',').map(opt => opt.trim());
  }
};

const getResponseLabel = (question: ChecklistItem, value: string, t: any): string => {
  console.log('🔍 DEBUG - getResponseLabel called with:', { value, questionId: question.item_id });
  
  // Exact mappings based on VALUES from Taiwan HALST response data
  const exactMappings: { [key: string]: string } = {
    // Housing types (VALUES from your checklist data)
    'apartment': 'apartment',
    'house': 'house', 
    'dormitory': 'dormitory',
    'other': 'other',
    
    // Floor levels  
    'ground': 'groundfloor',
    '1_3': '1st3rdfloor', 
    '4_6': '4th6thfloor',
    'above_6': 'above6thfloor',
    
    // Basic responses
    'yes': 'yes',
    'no': 'no',
    'not_sure': 'notsure',
    'partial': 'partially',           // ← FROM DEBUG: "partial" 
    'partially': 'partially',
    'sometimes': 'sometimes',         // ← FROM DEBUG: "sometimes"
    'occasionally': 'occasionally',
    
    // Quality ratings  
    'excellent': 'excellent',
    'good': 'good',
    'fair': 'fair', 
    'poor': 'poor',
    
    // Building age
    'new': 'lessthan10years',
    'moderate': '1030years', 
    'old': 'morethan30years',
    
    // Frequency with modifiers
    'yes_regularly': 'yesregularly',
    'yes_frequently': 'yesfrequently',
    
    // Time frequencies
    'weekly': 'weekly',
    'biweekly': 'every2weeks',
    'monthly': 'monthly',
    'rarely': 'rarely',
    
    // Partial quantities
    'some': 'someappliances',
    'some_products': 'someproducts',
    
    // Comfort levels
    'very_comfortable': 'verycomfortable',
    'comfortable': 'comfortable', 
    'somewhat_comfortable': 'somewhatcomfortable',
    'uncomfortable': 'uncomfortable',
    
    // Special cases from your debug output
    'outdoor_only': 'outdoorpetsonly',
    'no_carpet': 'nocarpetsrugs',
    'excellent_new': 'excellentnew',
    'good_condition': 'goodcondition',
    'fair_condition': 'faircondition', 
    'poor_old': 'poorold',
    
    // Condition modifiers
    'inadequate': 'inadequate',
    'poor_circulation': 'poorcirculation',
    'moderate_amount': 'moderateamount',
    'minor': 'minorissues',          // ← FROM DEBUG: "minor"
    'minor_issues': 'minorissues',
    'minor_amounts': 'minoramounts',
    'limited': 'limitedstorage',
    'some_need_repair': 'someneedrepair',
    'poor_ventilation': 'poorventilation',
    'variable': 'variablepressure',
    'inconsistent': 'inconsistent',
    'concerns': 'someconcerns',
    
    // Frequency options
    'weekly_less': 'weeklyorless',
    'few_days': 'everyfewdays',
    'daily': 'daily',
    'constantly': 'constantly',
    'seasonal': 'onlyseasonally',
    'outdoors_only': 'outdoorsonly',
    
    // Additional options from debug
    'barely': 'barelyAdequate',      // ← FROM DEBUG: "barely"
    'barely_adequate': 'barelyAdequate',
    'have_concerns': 'havesomeconcerns',
    'some_issues': 'someneedrepair',
  'need_help': 'needhelp',
  'yes_recent': 'yesrecently', 
  'yes_old': 'yeslongago',
  'not_applicable': 'notapplicable',
  'few': 'afewconcerns',
  'one': 'onemainconcern',
  'yes_active': 'yesactivelyplanning',
  'yes_future': 'yesforthefuture',
  'want_but_unable': 'wantbutunable',
  'no_plans': 'noplans',
  'yes_major': 'yesmajorvarations',
  'yes_minor': 'yesminorvarations', 
  'very_satisfied': 'verysatisfied',
  'satisfied': 'satisfied',
  'neutral': 'neutral',
  'dissatisfied': 'dissatisfied',
  'very_dissatisfied': 'verydissatisfied',
    // US-specific mappings (add these, remove duplicate not_applicable):
'unsure': 'notsure', 
'very_poor': 'verypoor',
'not_working': 'notworking',
'none': 'none',
'severe': 'severe'
  };
  
  // First try direct translation of the value
  if (exactMappings[value]) {
    const translationKey = `questions.common.responses.${exactMappings[value]}`;
    const translated = t(translationKey);
    console.log('🔍 DEBUG - Translation attempt (direct value):', { 
      originalValue: value, 
      mappedKey: exactMappings[value], 
      translationKey, 
      translated 
    });
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // If we have response_options array, get the label and try to translate it
  if (Array.isArray(question.response_options)) {
    const option = question.response_options.find(opt => opt.value === value);
    if (option) {
      // Try to find translation mapping for the label
      const labelMappings: { [key: string]: string } = {
        'Apartment': 'apartment',
        'House': 'house',
        'Dormitory': 'dormitory', 
        'Other': 'other',
        'Ground floor': 'groundfloor',
        '1st-3rd floor': '1st3rdfloor',
        '4th-6th floor': '4th6thfloor',
        'Above 6th floor': 'above6thfloor',
        'Yes': 'yes',
        'No': 'no',
        'Not sure': 'notsure',
        'Partially': 'partially',
        'Sometimes': 'sometimes',
        'Occasionally': 'occasionally',
        'Excellent': 'excellent',
        'Good': 'good',
        'Fair': 'fair',
        'Poor': 'poor',
        'Less than 10 years': 'lessthan10years',
        '10-30 years': '1030years',
        'More than 30 years': 'morethan30years',
        'Very comfortable': 'verycomfortable',
        'Comfortable': 'comfortable',
        'Somewhat comfortable': 'somewhatcomfortable', 
        'Uncomfortable': 'uncomfortable',
        'Barely adequate': 'barelyAdequate',
        'Minor issues': 'minorissues',
        'Minor amounts': 'minoramounts'
      };
      
      if (labelMappings[option.label]) {
        const translationKey = `questions.common.responses.${labelMappings[option.label]}`;
        const translated = t(translationKey);
        console.log('🔍 DEBUG - Translation attempt (label):', { 
          originalLabel: option.label, 
          mappedKey: labelMappings[option.label], 
          translationKey, 
          translated 
        });
        if (translated !== translationKey) {
          return translated;
        }
      }
      
      // Fallback to original label if no translation found
      console.log('🔍 DEBUG - No translation found for label, returning original:', option.label);
      return option.label;
    }
  }
  
  // Final fallback: return original value
  console.log('🔍 DEBUG - No translation found, returning original value:', value);
  return value;
};

// Helper function to get translated question text
const getQuestionText = (question: ChecklistItem, t: any): string => {
  // Handle different ID formats
  let assessmentType: string;
  
  if (question.item_id.includes('_')) {
    // Format: "HALST_1" -> "HALST"
    assessmentType = question.item_id.split('_')[0];
  } else {
    // Format: "US001" -> "US"  
    assessmentType = question.item_id.match(/^[A-Z]+/)?.[0] || '';
  }
  
  console.log('🔍 DEBUG - getQuestionText called:', {
    questionId: question.item_id,
    assessmentType,
    hasUnderscore: question.item_id.includes('_')
  });
  
  // Map to translation namespace
  const translationNamespace = ASSESSMENT_TYPE_MAP[assessmentType];
  
  console.log('🔍 DEBUG - Translation namespace lookup:', {
    assessmentType,
    translationNamespace,
    ASSESSMENT_TYPE_MAP
  });
  
  if (translationNamespace) {
    const translationKey = `questions.${translationNamespace}.${question.item_id}.question`;
    const translated = t(translationKey);
    
    console.log('🔍 DEBUG - Question translation attempt:', {
      translationKey,
      translated: translated.substring(0, 50) + '...',
      isTranslated: translated !== translationKey
    });
    
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  console.log('🔍 DEBUG - Using fallback text for:', question.item_id);
  return question.question;
};

// Helper function to get translated explanation
const getQuestionExplanation = (question: ChecklistItem, t: any): string => {
  // Extract assessment type from question ID
  const idParts = question.item_id.split('_');
  const assessmentType = idParts[0];
  
  // Map to translation namespace
  const translationNamespace = ASSESSMENT_TYPE_MAP[assessmentType];
  
  if (translationNamespace && question.explanation) {
    const translationKey = `questions.${translationNamespace}.${question.item_id}.explanation`;
    const translated = t(translationKey);
    
    // If translation exists and is different from the key, use it
    if (translated !== translationKey) {
      return translated;
    }
  }
  
  // Fallback to original explanation or empty string
  return question.explanation || '';
};

// Helper function to get questions by section - now handles both key and full name
const getQuestionsBySection = (questions: ChecklistItem[], sectionKey: string): ChecklistItem[] => {
  const sectionName = SECTION_MAPPING[sectionKey] || sectionKey;
  return questions.filter(q => q.section === sectionName);
};

// Helper function to get translated section names in results
const getSectionDisplayName = (sectionName: string, t: any): string => {
  // Find the section key that matches the English name
  const sectionKey = Object.keys(SECTION_MAPPING).find(key => SECTION_MAPPING[key] === sectionName);
  
  if (sectionKey) {
    return t(`sections.names.${sectionKey}`);
  }
  
  // Fallback to original name if no translation found
  return sectionName;
};

export default function SimpleTest() {
  // Add translation hook
  const { t } = useTranslation();

  // State management
  const [phase, setPhase] = useState<AssessmentPhase>('selection');
  const [homeChecklistType, setHomeChecklistType] = useState<HomeChecklistType>(null);
  const [includeSDOH, setIncludeSDOH] = useState(false);
  const [includeElderSafety, setIncludeElderSafety] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [sectionNotes, setSectionNotes] = useState<SectionNotes>({});

  // Get current questions and sections
  const getCurrentQuestions = (): ChecklistItem[] => {
    let questions: ChecklistItem[] = [];
    
    // Add home checklist questions
    if (homeChecklistType === 'taiwan') {
      questions = [...questions, ...TAIWAN_HALST_QUESTIONS];
    } else if (homeChecklistType === 'us') {
      questions = [...questions, ...US_HEALTHY_HOMES_QUESTIONS];
    }
    
    // Add Elder Safety if selected
    if (includeElderSafety) {
      questions = [...questions, ...ELDER_SAFETY_QUESTIONS];
    }
    
    // Add SDOH if selected
    if (includeSDOH) {
      questions = [...questions, ...SDOH_QUESTIONS];
    }
    
    return questions;
  };

  const getCurrentSections = (): string[] => {
    let sections: string[] = [];
    
    // Add home checklist sections
    if (homeChecklistType === 'taiwan') {
      sections = [...sections, ...TAIWAN_SECTIONS];
    } else if (homeChecklistType === 'us') {
      sections = [...sections, ...US_SECTIONS];
    }
    
    // Add Elder Safety sections if selected
    if (includeElderSafety) {
      sections = [...sections, ...ELDER_SECTIONS];
    }
    
    // Add SDOH sections if selected
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

  // Calculate results
  const calculateResults = () => {
    const itemRisks = currentQuestions.map(question => {
      const userResponse = responses[question.item_id] || '';
      return calculateItemRisk(question, userResponse);
    });
    
    return calculateOverallRisk(itemRisks);
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

  // Start assessment - FIXED: Now allows SDOH alone
  const startAssessment = () => {
    if (homeChecklistType || includeElderSafety || includeSDOH) {
      setPhase('assessment');
    }
  };

  // Calculate progress
  const getTotalAnsweredQuestions = () => {
    return Object.keys(responses).filter(key => responses[key] !== '').length;
  };

  const getSectionProgress = (sectionKey: string) => {
    const questions = getQuestionsBySection(currentQuestions, sectionKey);
    const answered = questions.filter(q => responses[q.item_id]).length;
    return { total: questions.length, answered, percentage: Math.round((answered / questions.length) * 100) };
  };

  // Render functions
  const renderSelectionPhase = () => (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Language Switcher */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('assessment.title')}</h1>
          <p className="text-lg text-gray-600">{t('assessment.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="space-y-6">
        {/* Home Inspection Choice */}
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

        {/* Elder Safety Assessment */}
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

        {/* SDOH Assessment */}
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

        {/* Assessment Summary */}
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

        {/* Action Buttons */}
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
      {/* Header with Language Switcher */}
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
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getTotalAnsweredQuestions() / currentQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
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

        {/* Questions Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t(`sections.names.${currentSectionKey}`)}</h2>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{t('sections.progress', { current: currentSectionIndex + 1, total: currentSections.length })}</span>
                <span>{t('sections.completed', { answered: getSectionProgress(currentSectionKey).answered, total: sectionQuestions.length })}</span>
              </div>
            </div>

            {/* Questions */}
            <div className="p-6 space-y-6">
              {sectionQuestions.map((question) => {
                const responseOptions = getResponseOptions(question);
                const currentResponse = responses[question.item_id] || '';
                const questionText = getQuestionText(question, t);
                const explanationText = getQuestionExplanation(question, t);
                
                return (
                  <div key={question.item_id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {questionText}
                    </h3>
                    
                    {explanationText && (
                      <p className="text-sm text-gray-600 mb-4">{explanationText}</p>
                    )}

                    <div className="space-y-2">
                      {responseOptions.map((option) => (
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
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Section Notes */}
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

            {/* Navigation */}
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
        {/* Header with Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('results.title')}</h1>
            <p className="text-lg text-gray-600">{t('results.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* Overall Score */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{results.risk_score}</div>
                <div className="text-red-800">{t('results.riskScore')}</div>
                <div className="text-sm text-red-600 mt-1">{t('results.outOf100')}</div>
              </div>
              
              <div className={`p-6 rounded-lg ${
                results.risk_level === 'Critical' ? 'bg-red-100' :
                results.risk_level === 'High' ? 'bg-orange-100' :
                results.risk_level === 'Elevated' ? 'bg-yellow-100' :
                results.risk_level === 'Moderate' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  results.risk_level === 'Critical' ? 'text-red-600' :
                  results.risk_level === 'High' ? 'text-orange-600' :
                  results.risk_level === 'Elevated' ? 'text-yellow-600' :
                  results.risk_level === 'Moderate' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {t(`results.riskLevels.${results.risk_level.toLowerCase()}`)}
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

          {/* Issues Summary */}
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

          {/* Priority Interventions */}
          {results.priority_interventions.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('results.priorityInterventions')}</h2>
              <div className="space-y-3">
                {results.priority_interventions.slice(0, 10).map((intervention, index) => (
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

          {/* Section Notes Summary */}
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

          {/* Action Buttons */}
          <div className="p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={resetAssessment}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('results.takeNewAssessment')}
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
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {phase === 'selection' && renderSelectionPhase()}
      {phase === 'assessment' && renderAssessmentPhase()}
      {phase === 'results' && renderResultsPhase()}
    </div>
  );
}
