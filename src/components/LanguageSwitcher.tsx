// src/components/LanguageSwitcher.tsx - Language Toggle Component
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'en' ? '繁體中文' : 'English';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
    >
      <Globe size={16} />
      <span className="text-sm font-medium">
        {getCurrentLanguageLabel()}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
