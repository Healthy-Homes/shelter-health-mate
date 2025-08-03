import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import ConsentSection from '@/components/ConsentSection';
import ChecklistSection from '@/components/ChecklistSection';
import SDOHSection from '@/components/SDOHSection';
import RiskScoringSection from '@/components/RiskScoringSection';
import ExportSection from '@/components/ExportSection';
import { AssessmentData } from '@/types';
import { calculateRiskScore } from '@/utils/riskModel';

const ShelterHealthApp: React.FC = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [residentName, setResidentName] = useState('');
  const [checklistData, setChecklistData] = useState<{ [key: string]: boolean }>({});
  const [sdohData, setSDOHData] = useState<{ [key: string]: string }>({});
  const [riskScoringEnabled, setRiskScoringEnabled] = useState(false);

  // Calculate risk score when data changes
  const assessmentData: AssessmentData = {
    checklist: checklistData,
    sdoh: sdohData
  };

  useEffect(() => {
    if (riskScoringEnabled) {
      const riskResult = calculateRiskScore(assessmentData);
      assessmentData.riskScore = riskResult.score;
      assessmentData.riskCategory = riskResult.category;
    }
  }, [checklistData, sdohData, riskScoringEnabled]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <ConsentSection
            hasConsent={hasConsent}
            setHasConsent={setHasConsent}
            residentName={residentName}
            setResidentName={setResidentName}
          />

          <ChecklistSection
            checklistData={checklistData}
            setChecklistData={setChecklistData}
          />

          <SDOHSection
            sdohData={sdohData}
            setSDOHData={setSDOHData}
          />

          <RiskScoringSection
            riskScoringEnabled={riskScoringEnabled}
            setRiskScoringEnabled={setRiskScoringEnabled}
            assessmentData={assessmentData}
          />

          <ExportSection
            assessmentData={assessmentData}
            hasConsent={hasConsent}
            residentName={residentName}
            riskScoringEnabled={riskScoringEnabled}
          />
        </main>

        <footer className="border-t border-border bg-card mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <p className="text-sm text-muted-foreground text-center">
              Shelter Health App - Privacy-First Public Health Assessment Tool
            </p>
          </div>
        </footer>
      </div>
    </LanguageProvider>
  );
};

export default ShelterHealthApp;