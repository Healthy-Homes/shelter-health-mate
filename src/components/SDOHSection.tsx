import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSDOHData } from '@/hooks/useCSVData';
import { Users, AlertTriangle } from 'lucide-react';

interface SDOHSectionProps {
  sdohData: { [key: string]: string };
  setSDOHData: (data: { [key: string]: string }) => void;
}

const SDOHSection: React.FC<SDOHSectionProps> = ({
  sdohData,
  setSDOHData
}) => {
  const { t } = useLanguage();
  const { sdohQuestions, loading, error } = useSDOHData();

  const handleRadioChange = (questionId: string, value: string) => {
    setSDOHData({
      ...sdohData,
      [questionId]: value
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
          <Users className="h-5 w-5" />
          {t('socialDeterminants')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sdohQuestions.map((question) => (
          <div key={question.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {t(question.id)}
            </Label>
            <RadioGroup
              value={sdohData[question.id] || ''}
              onValueChange={(value) => handleRadioChange(question.id, value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opt1" id={`${question.id}-opt1`} />
                <Label htmlFor={`${question.id}-opt1`} className="text-sm">
                  {question.opt1_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opt2" id={`${question.id}-opt2`} />
                <Label htmlFor={`${question.id}-opt2`} className="text-sm">
                  {question.opt2_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opt3" id={`${question.id}-opt3`} />
                <Label htmlFor={`${question.id}-opt3`} className="text-sm">
                  {question.opt3_key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SDOHSection;