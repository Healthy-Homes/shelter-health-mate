import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSDOHData } from '@/hooks/useCSVData';
import { Users, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SDOHSectionProps {
  sdohData: { [key: string]: string };
  setSDOHData: (data: { [key: string]: string }) => void;
  include: boolean;
  setInclude: (v: boolean) => void;
}

const SDOHSection: React.FC<SDOHSectionProps> = ({
  sdohData,
  setSDOHData,
  include,
  setInclude,
}) => {
  const { t, tList } = useLanguage();
  const { sdohQuestions, loading, error } = useSDOHData();

  const fallbackQuestions = [
    { id: 'housing_stability', itemKey: 'housingStability', descriptionKey: 'sdoh.dummy.housing_stability.question', type: 'single', optionsKey: 'sdoh.dummy.housing_stability.options' },
    { id: 'food_security', itemKey: 'foodSecurity', descriptionKey: 'sdoh.dummy.food_security.question', type: 'single', optionsKey: 'sdoh.dummy.food_security.options' },
    { id: 'transportation', itemKey: 'transportation', descriptionKey: 'sdoh.dummy.transportation.question', type: 'single', optionsKey: 'sdoh.dummy.transportation.options' },
    { id: 'utilities', itemKey: 'utilities', descriptionKey: 'sdoh.dummy.utilities.question', type: 'single', optionsKey: 'sdoh.dummy.utilities.options' },
    { id: 'social_support', itemKey: 'socialSupport', descriptionKey: 'sdoh.dummy.social_support.question', type: 'single', optionsKey: 'sdoh.dummy.social_support.options' },
  ] as Array<{ id: string; itemKey: string; descriptionKey: string; type: string; optionsKey?: string }>;

  const questions = sdohQuestions && sdohQuestions.length ? sdohQuestions : fallbackQuestions;

  const handleRadioChange = (questionId: string, value: string) => {
    setSDOHData({
      ...sdohData,
      [questionId]: value,
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
            <Users className="h-5 w-5" />
            {t('sections.sdoh')}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span>{t('ui.includeSection')}</span>
            <Switch checked={include} onCheckedChange={(v) => setInclude(v as boolean)} />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => {
          const options = tList(question.optionsKey || '');
          return (
            <div key={question.id} className="space-y-3">
              <Label className="text-sm font-medium">{t(question.descriptionKey)}</Label>
              <RadioGroup
                value={sdohData[question.itemKey] || ''}
                onValueChange={(value) => handleRadioChange(question.itemKey, value)}
                className="space-y-2"
              >
                {options.map((opt, idx) => {
                  const value = `opt${idx + 1}`;
                  const radioId = `${question.itemKey}-${value}`;
                  return (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={radioId} />
                      <Label htmlFor={radioId} className="text-sm">
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SDOHSection;