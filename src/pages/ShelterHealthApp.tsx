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
import ResidentInfoSection, { ResidentInfo } from '@/components/ResidentInfoSection';

interface ChecklistConfigOption { id: string; labelKey: string; csvPath: string }

const ShelterHealthApp: React.FC = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [residentName, setResidentName] = useState('');
  const [checklistData, setChecklistData] = useState<{ [key: string]: boolean }>({});
  const [sdohData, setSDOHData] = useState<{ [key: string]: string }>({});
  const [riskScoringEnabled, setRiskScoringEnabled] = useState(false);

  const [includeResidents, setIncludeResidents] = useState(true);
  const [includeHome, setIncludeHome] = useState(true);
  const [includeSDOH, setIncludeSDOH] = useState(true);

  const [residentInfo, setResidentInfo] = useState<ResidentInfo>({ tenureUnit: 'months', count: 1 });
  const [homeMeta, setHomeMeta] = useState<{ ageOfHome?: string }>({});

  const [checklistOptions, setChecklistOptions] = useState<ChecklistConfigOption[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');
  const [currentCsvPath, setCurrentCsvPath] = useState<string>('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/data/checklists/index.json');
        const json = await res.json();
        setChecklistOptions(json.options);
        setSelectedChecklistId(json.default);
      } catch (e) {
        console.error('Failed to load checklist config', e);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const current = checklistOptions.find((o) => o.id === selectedChecklistId);
    setCurrentCsvPath(current ? current.csvPath : '');
  }, [selectedChecklistId, checklistOptions]);

  // Calculate risk score when data changes
  const assessmentData: AssessmentData = {
    checklist: checklistData,
    sdoh: sdohData,
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
        <Header
          selectedChecklistId={selectedChecklistId}
          setSelectedChecklistId={setSelectedChecklistId}
          checklistOptions={checklistOptions}
        />

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <ConsentSection
            hasConsent={hasConsent}
            setHasConsent={setHasConsent}
            residentName={residentName}
            setResidentName={setResidentName}
          />

          <ResidentInfoSection
            data={residentInfo}
            setData={setResidentInfo}
            include={includeResidents}
            setInclude={setIncludeResidents}
          />

          <ChecklistSection
            checklistData={checklistData}
            setChecklistData={setChecklistData}
            csvPath={currentCsvPath}
            include={includeHome}
            setInclude={setIncludeHome}
            homeMeta={homeMeta}
            setHomeMeta={setHomeMeta}
          />

          <SDOHSection
            sdohData={sdohData}
            setSDOHData={setSDOHData}
            include={includeSDOH}
            setInclude={setIncludeSDOH}
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
            include={{ residents: includeResidents, home: includeHome, sdoh: includeSDOH }}
            residentInfo={residentInfo}
            homeMeta={homeMeta}
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