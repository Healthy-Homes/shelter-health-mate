import React, { createContext, useContext, useState, ReactNode } from 'react';
import en from '@/lang/en.json';
import zh from '@/lang/zh.json';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
  tList: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Language, any> = { en, zh };

function getByPath(obj: any, path: string) {
  if (!path || typeof path !== 'string') return undefined;
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): any => {
    if (!key || typeof key !== 'string' || key.trim() === '') return '';
    const value = getByPath(dictionaries[language], key);
    return value !== undefined ? value : key;
  };

  const tList = (key: string): string[] => {
    if (!key || typeof key !== 'string' || key.trim() === '') return [];
    const value = t(key);
    return Array.isArray(value) ? (value as string[]) : [];
    };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tList }}>
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