import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderProps {
  selectedChecklistId: string;
  setSelectedChecklistId: (id: string) => void;
  checklistOptions: { id: string; labelKey: string }[];
}

const Header: React.FC<HeaderProps> = ({ selectedChecklistId, setSelectedChecklistId, checklistOptions }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-primary">{t('ui.appTitle')}</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
            <SelectTrigger className="w-[160px] bg-background" aria-label={t('ui.language')}>
              <SelectValue placeholder={t('ui.language')} />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="en">{t('ui.languages.en')}</SelectItem>
              <SelectItem value="zh">{t('ui.languages.zh')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedChecklistId} onValueChange={(val) => setSelectedChecklistId(val)}>
            <SelectTrigger className="w-[240px] bg-background" aria-label={t('ui.checklist')}>
              <SelectValue placeholder={t('ui.checklist')} />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {checklistOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="cursor-pointer">
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;