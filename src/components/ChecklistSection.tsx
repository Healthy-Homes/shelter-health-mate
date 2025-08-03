import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChecklistData } from '@/hooks/useCSVData';
import { Home, AlertTriangle } from 'lucide-react';

interface ChecklistSectionProps {
  checklistData: { [key: string]: boolean };
  setChecklistData: (data: { [key: string]: boolean }) => void;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklistData,
  setChecklistData
}) => {
  const { t } = useLanguage();
  const { checklist, loading, error } = useChecklistData();

  const handleCheckboxChange = (itemKey: string, checked: boolean) => {
    setChecklistData({
      ...checklistData,
      [itemKey]: checked
    });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">{t('loading')}</div>
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
            {t('error')}: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Home className="h-5 w-5" />
          {t('housingConditions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {checklist.map((item) => (
            <div key={item.item_key} className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/50">
              <Checkbox
                id={item.item_key}
                checked={checklistData[item.item_key] || false}
                onCheckedChange={(checked) => handleCheckboxChange(item.item_key, checked as boolean)}
              />
              <div className="space-y-1 flex-1">
                <Label 
                  htmlFor={item.item_key} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {t(item.item_key)}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistSection;