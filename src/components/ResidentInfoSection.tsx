import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users } from 'lucide-react';

export interface ResidentInfo {
  count?: number;
  ages?: string;
  tenureValue?: number;
  tenureUnit?: 'months' | 'years';
}

interface ResidentInfoSectionProps {
  data: ResidentInfo;
  setData: (d: ResidentInfo) => void;
  include: boolean;
  setInclude: (v: boolean) => void;
}

const ResidentInfoSection: React.FC<ResidentInfoSectionProps> = ({ data, setData, include, setInclude }) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-primary">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('sections.residents')}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span>{t('ui.includeSection')}</span>
            <Switch checked={include} onCheckedChange={(v) => setInclude(v as boolean)} />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="res-count">{t('residents.numberOfResidents')}</Label>
            <Input id="res-count" type="number" inputMode="numeric" min={1} value={data.count ?? 1} onChange={(e) => {
              const val = Math.max(1, Number(e.target.value || 1));
              setData({ ...data, count: val });
            }} onBlur={(e) => {
              if (!e.target.value) setData({ ...data, count: 1 });
            }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-ages">{t('residents.ages')}</Label>
            <Input id="res-ages" type="text" value={data.ages ?? ''} onChange={(e) => setData({ ...data, ages: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('residents.tenure')}</Label>
            <div className="flex items-center gap-2">
              <Input aria-label={t('residents.tenure')} type="number" inputMode="numeric" className="w-28" value={data.tenureValue ?? ''} onChange={(e) => setData({ ...data, tenureValue: Number(e.target.value) })} />
              <select aria-label={t('residents.tenure')} className="border rounded-md px-3 py-2 bg-background" value={data.tenureUnit ?? 'months'} onChange={(e) => setData({ ...data, tenureUnit: e.target.value as 'months' | 'years' })}>
                <option value="months">{t('residents.months')}</option>
                <option value="years">{t('residents.years')}</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidentInfoSection;
