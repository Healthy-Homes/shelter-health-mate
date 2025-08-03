import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    appTitle: 'Shelter Health App',
    languageToggle: '中文',
    consentTitle: 'Resident Consent',
    consentText: 'I consent to data collection for this health assessment',
    residentName: 'Resident Name',
    residentNamePlaceholder: 'Enter resident name (optional)',
    housingConditions: 'Housing Conditions Assessment',
    socialDeterminants: 'Social Determinants of Health',
    riskScoring: 'Risk Assessment',
    enableRiskScoring: 'Enable Risk Scoring',
    riskScore: 'Risk Score',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    environmentalRisks: 'Environmental Risk Areas',
    exportOptions: 'Export Options',
    exportPDF: 'Export PDF Report',
    exportFHIR: 'Export FHIR Bundle',
    loading: 'Loading...',
    error: 'Error loading data',
    mockDataDisclaimer: 'Mock environmental data – not live feeds',
    // Checklist items
    moldVisible: 'Visible Mold',
    leakingPipes: 'Leaking Pipes', 
    noVentilation: 'Poor Ventilation',
    pestInfestation: 'Pest Infestation',
    electricalHazards: 'Electrical Hazards',
    structuralDamage: 'Structural Damage',
    leadPaint: 'Lead Paint',
    asbestos: 'Asbestos Materials',
    overcrowding: 'Overcrowding',
    inadequateHeating: 'Inadequate Heating',
    // SDOH questions
    foodSecurity: 'Food Security',
    housingStability: 'Housing Stability',
    transportation: 'Transportation Access',
    socialSupport: 'Social Support',
    healthcare: 'Healthcare Access',
    employment: 'Employment Status',
    education: 'Education Level',
    income: 'Income Adequacy'
  },
  zh: {
    appTitle: '住所健康應用程式',
    languageToggle: 'English',
    consentTitle: '居民同意書',
    consentText: '我同意為此健康評估收集數據',
    residentName: '居民姓名',
    residentNamePlaceholder: '輸入居民姓名（可選）',
    housingConditions: '住房條件評估',
    socialDeterminants: '健康社會決定因素',
    riskScoring: '風險評估',
    enableRiskScoring: '啟用風險評分',
    riskScore: '風險評分',
    low: '低',
    moderate: '中等',
    high: '高',
    environmentalRisks: '環境風險區域',
    exportOptions: '匯出選項',
    exportPDF: '匯出PDF報告',
    exportFHIR: '匯出FHIR包',
    loading: '載入中...',
    error: '載入數據錯誤',
    mockDataDisclaimer: '模擬環境數據 – 非實時數據',
    // Checklist items
    moldVisible: '可見黴菌',
    leakingPipes: '管道洩漏',
    noVentilation: '通風不良',
    pestInfestation: '害蟲感染',
    electricalHazards: '電氣危險',
    structuralDamage: '結構損壞',
    leadPaint: '含鉛油漆',
    asbestos: '石棉材料',
    overcrowding: '過度擁擠',
    inadequateHeating: '供暖不足',
    // SDOH questions
    foodSecurity: '食物保障',
    housingStability: '住房穩定性',
    transportation: '交通便利性',
    socialSupport: '社會支持',
    healthcare: '醫療服務',
    employment: '就業狀況',
    education: '教育水平',
    income: '收入充足性'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};