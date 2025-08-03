import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield } from 'lucide-react';

interface ConsentSectionProps {
  hasConsent: boolean;
  setHasConsent: (consent: boolean) => void;
  residentName: string;
  setResidentName: (name: string) => void;
}

const ConsentSection: React.FC<ConsentSectionProps> = ({
  hasConsent,
  setHasConsent,
  residentName,
  setResidentName
}) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          {t('consentTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="consent-checkbox"
            checked={hasConsent}
            onCheckedChange={(checked) => setHasConsent(checked as boolean)}
          />
          <Label htmlFor="consent-checkbox" className="text-sm">
            {t('consentText')}
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resident-name">{t('residentName')}</Label>
          <Input
            id="resident-name"
            type="text"
            placeholder={t('residentNamePlaceholder')}
            value={residentName}
            onChange={(e) => setResidentName(e.target.value)}
            disabled={!hasConsent}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentSection;