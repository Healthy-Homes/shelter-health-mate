import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AssessmentData } from '@/types';
import { Download, FileText, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportSectionProps {
  assessmentData: AssessmentData;
  hasConsent: boolean;
  residentName: string;
  riskScoringEnabled: boolean;
}

const ExportSection: React.FC<ExportSectionProps> = ({
  assessmentData,
  hasConsent,
  residentName,
  riskScoringEnabled
}) => {
  const { t } = useLanguage();

  const generatePDFReport = () => {
    if (!hasConsent) {
      toast({
        title: "Consent Required",
        description: "Please obtain resident consent before exporting data.",
        variant: "destructive"
      });
      return;
    }

    // Mock PDF generation - would integrate with pdfMake in production
    const reportData = {
      residentName,
      timestamp: new Date().toISOString(),
      checklist: assessmentData.checklist,
      sdoh: assessmentData.sdoh,
      riskScore: riskScoringEnabled ? assessmentData.riskScore : null,
      disclaimer: t('mockDataDisclaimer')
    };

    console.log('PDF Report Data:', reportData);
    toast({
      title: "PDF Generated",
      description: "Report has been generated (mock implementation)",
      variant: "default"
    });
  };

  const generateFHIRBundle = () => {
    if (!hasConsent) {
      toast({
        title: "Consent Required",
        description: "Please obtain resident consent before exporting data.",
        variant: "destructive"
      });
      return;
    }

    // Mock FHIR Bundle generation
    const fhirBundle: any = {
      resourceType: "Bundle",
      id: `shelter-health-${Date.now()}`,
      type: "document",
      timestamp: new Date().toISOString(),
      entry: []
    };

    // Add patient resource
    fhirBundle.entry.push({
      resource: {
        resourceType: "Patient",
        id: "patient-1",
        name: [{ text: residentName || "Anonymous" }]
      }
    });

    // Add consent resource
    fhirBundle.entry.push({
      resource: {
        resourceType: "Consent",
        id: "consent-1",
        status: "active",
        patient: { reference: "Patient/patient-1" }
      }
    });

    // Add checklist observations
    Object.entries(assessmentData.checklist).forEach(([key, value], index) => {
      if (value) {
        fhirBundle.entry.push({
          resource: {
            resourceType: "Observation",
            id: `obs-checklist-${index}`,
            status: "final",
            code: {
              coding: [{
                system: "http://healthyhomes.local/checklist",
                code: key,
                display: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              }]
            },
            subject: { reference: "Patient/patient-1" },
            valueBoolean: value
          }
        });
      }
    });

    console.log('FHIR Bundle:', JSON.stringify(fhirBundle, null, 2));
    toast({
      title: "FHIR Bundle Generated",
      description: "FHIR R4 compliant bundle has been created",
      variant: "default"
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Download className="h-5 w-5" />
          {t('exportOptions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={generatePDFReport}
            disabled={!hasConsent}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            {t('exportPDF')}
          </Button>
          
          <Button
            onClick={generateFHIRBundle}
            disabled={!hasConsent}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Database className="h-4 w-4" />
            {t('exportFHIR')}
          </Button>
        </div>
        
        {!hasConsent && (
          <p className="text-sm text-muted-foreground text-center">
            Consent required for data export
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportSection;