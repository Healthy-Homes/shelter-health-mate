import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChecklistData } from '@/hooks/useCSVData';
import { Home, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ChecklistSectionProps {
  checklistData: { [key: string]: boolean };
  setChecklistData: (data: { [key: string]: boolean }) => void;
  csvPath: string;
  include: boolean;
  setInclude: (v: boolean) => void;
  homeMeta: { ageOfHome?: string };
  setHomeMeta: (m: { ageOfHome?: string }) => void;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklistData,
  setChecklistData,
  csvPath,
  include,
  setInclude,
  homeMeta,
  setHomeMeta,
}) => {
  const { t, tList } = useLanguage();
  const { checklist, loading, error } = useChecklistData(csvPath);

  const handleCheckboxChange = (itemKey: string, checked: boolean) => {
    setChecklistData({
      ...checklistData,
      [itemKey]: checked,
    });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">{t('ui.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('ui.error')}: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-primary">
          <span className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {t('sections.homeInspection')}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span>{t('ui.includeSection')}</span>
            <Switch checked={include} onCheckedChange={(v) => setInclude(v as boolean)} />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Age of home question */}
        <div className="space-y-2">
          <Label htmlFor="age-of-home">{t('home.ageOfHome')}</Label>
          <select
            id="age-of-home"
            className="border rounded-md px-3 py-2 bg-background w-full"
            value={homeMeta.ageOfHome ?? ''}
            onChange={(e) => setHomeMeta({ ageOfHome: e.target.value })}
          >
            <option value="" disabled>
              --
            </option>
            {tList('home.ageOptions').map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          {checklist
            .filter((item) => item.type === 'yesno')
            .map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/50">
                <Checkbox
                  id={item.itemKey}
                  checked={checklistData[item.itemKey] || false}
                  onCheckedChange={(checked) => handleCheckboxChange(item.itemKey, checked as boolean)}
                />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={item.itemKey} className="text-sm font-medium cursor-pointer">
                    {t(`checklist.items.${item.itemKey}`)}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t(item.descriptionKey)}</p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistSection;