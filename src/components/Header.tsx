import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">
          {t('appTitle')}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {t('languageToggle')}
        </Button>
      </div>
    </header>
  );
};

export default Header;