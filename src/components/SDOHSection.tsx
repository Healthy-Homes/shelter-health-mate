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
    { id: '1', itemKey: 'housingStability', descriptionKey: 'sdoh.housing_stability', type: 'single', optionsKey: 'sdoh.housing_stability_options' },
    { id: '2', itemKey: 'foodSecurity', descriptionKey: 'sdoh.food_security', type: 'single', optionsKey: 'sdoh.food_security_options' },
    { id: '3', itemKey: 'transportation', descriptionKey: 'sdoh.transportation', type: 'single', optionsKey: 'sdoh.transportation_options' },
    { id: '4', itemKey: 'socialSupport', descriptionKey: 'sdoh.social_support', type: 'single', optionsKey: 'sdoh.social_support_options' },
    { id: '5', itemKey: 'healthcare', descriptionKey: 'sdoh.healthcare_access', type: 'single', optionsKey: 'sdoh.healthcare_access_options' },
    { id: '6', itemKey: 'employment', descriptionKey: 'sdoh.employment_status', type: 'single', optionsKey: 'sdoh.employment_status_options' },
    { id: '7', itemKey: 'education', descriptionKey: 'sdoh.education_level', type: 'single', optionsKey: 'sdoh.education_level_options' },
    { id: '8', itemKey: 'income', descriptionKey: 'sdoh.income_adequacy', type: 'single', optionsKey: 'sdoh.income_adequacy_options' },
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