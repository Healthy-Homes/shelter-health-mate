// src/i18n.ts - i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './lang/en.json';
import zhTranslation from './lang/zh.json';

const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    
    // Default language
    fallbackLng: 'en',
    
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // Don't detect from path, subdomain, etc.
      excludeCacheFor: ['cimode']
    },

    interpolation: {
      escapeValue: false // React already escapes by default
    },

    // Development options
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace options
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',

    // React options
    react: {
      useSuspense: false
    }
  });

export default i18n;
