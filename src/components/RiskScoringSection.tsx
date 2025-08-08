import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateRiskScores } from '@/utils/riskModel';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

interface RiskScoringSectionProps {
  riskScoringEnabled: boolean;
  setRiskScoringEnabled: (enabled: boolean) => void;
  assessmentData: AssessmentData;
}

const RiskScoringSection: React.FC<RiskScoringSectionProps> = ({
  riskScoringEnabled,
  setRiskScoringEnabled,
  assessmentData
}) => {
  const { t } = useLanguage();

  const riskResults = riskScoringEnabled ? calculateRiskScores(assessmentData) : null;

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'Low': return 'text-success';
      case 'Moderate': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'Low': return <Shield className="h-5 w-5 text-success" />;
      case 'Moderate': return <TrendingUp className="h-5 w-5 text-warning" />;
      case 'High': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          {t('ui.riskScoring')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="risk-scoring-toggle"
            checked={riskScoringEnabled}
            onCheckedChange={setRiskScoringEnabled}
          />
          <Label htmlFor="risk-scoring-toggle">
            {t('ui.enableRiskScoring')}
          </Label>
        </div>

        {riskScoringEnabled && riskResults && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            {(['environmental','sdoh','combined'] as const).map((key) => {
              const result = riskResults[key];
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(result.category)}
                      <span className="font-medium">
                        {key === 'environmental' && t('ui.environmentalRisk')}
                        {key === 'sdoh' && t('ui.sdohRisk')}
                        {key === 'combined' && t('ui.combinedRisk')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{result.score}</span>
                      <span className="text-muted-foreground ml-1">/ 100</span>
                    </div>
                  </div>
                  <Progress value={result.score} className="w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('ui.riskCategoryLabel')}:</span>
                    <span className={`font-medium ${getRiskColor(result.category)}`}>
                      {t(`ui.${result.category.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskScoringSection;