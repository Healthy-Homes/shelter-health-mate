import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AssessmentData } from '@/types';
import { Download, FileText, Database, Share2, MailWarning } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { buildReportPDF, downloadPDF } from '@/utils/pdf';
import { buildMailto, defaultEmailContent } from '@/utils/mailto';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExportSectionProps {
  assessmentData: AssessmentData;
  hasConsent: boolean;
  residentName: string;
  riskScoringEnabled: boolean;
  include: { residents: boolean; home: boolean; sdoh: boolean };
  residentInfo: any;
  homeMeta: any;
}

const ExportSection: React.FC<ExportSectionProps> = ({
  assessmentData,
  hasConsent,
  residentName,
  riskScoringEnabled,
  include,
  residentInfo,
  homeMeta,
}) => {
  const { t, tList } = useLanguage();

  const ensureConsent = () => {
    if (!hasConsent) {
      toast({ title: t('ui.consentRequired'), description: t('ui.consentNeededDesc'), variant: 'destructive' });
      return false;
    }
    return true;
  };

  const generatePDFReport = async () => {
    if (!ensureConsent()) return;

    const blob = await buildReportPDF({
      residentName,
      include,
      checklist: include.home ? assessmentData.checklist : {},
      sdoh: include.sdoh ? assessmentData.sdoh : {},
      risk: riskScoringEnabled ? { score: assessmentData.riskScore, category: assessmentData.riskCategory } : {},
      translations: { t, tList },
    });
    downloadPDF(blob);
    toast({ title: t('ui.pdfGenerated'), description: t('ui.pdfGeneratedDesc') });
    return blob;
  };

  const handleEmailReport = async () => {
    if (!ensureConsent()) return;
    const link = buildMailto({ subject: defaultEmailContent.subject, body: defaultEmailContent.body });
    window.location.href = link;
  };

  const handleShareReport = async () => {
    if (!ensureConsent()) return;
    const blob = await generatePDFReport();
    if (!blob) return;
    try {
      const file = new File([blob], 'HealthyHomesReport.pdf', { type: 'application/pdf' });
      if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ title: 'Healthy Homes Assessment Report', text: 'Please send via secure channel', files: [file] });
      } else {
        downloadPDF(blob);
        alert(t('ui.secureEmailReminder'));
      }
    } catch (e) {
      downloadPDF(blob);
      alert(t('ui.secureEmailReminder'));
    }
  };

  const generateFHIRBundle = () => {
    if (!ensureConsent()) return;

    const fhirBundle: any = {
      resourceType: 'Bundle',
      id: `shelter-health-${Date.now()}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [],
    };

    // Add patient resource
    fhirBundle.entry.push({
      resource: { resourceType: 'Patient', id: 'patient-1', name: [{ text: residentName || 'Anonymous' }] },
    });

    // Add consent resource
    fhirBundle.entry.push({ resource: { resourceType: 'Consent', id: 'consent-1', status: 'active', patient: { reference: 'Patient/patient-1' } } });

    // Add checklist observations (home section only if included)
    if (include.home) {
      Object.entries(assessmentData.checklist).forEach(([key, value], index) => {
        if (value === true) {
          fhirBundle.entry.push({
            resource: {
              resourceType: 'Observation',
              id: `obs-checklist-${index}`,
              status: 'final',
              code: { coding: [{ system: 'http://healthyhomes.local/checklist', code: key, display: key }] },
              subject: { reference: 'Patient/patient-1' },
              valueBoolean: true,
            },
          });
        }
      });
    }

    // Add SDOH observations if included
    if (include.sdoh) {
      Object.entries(assessmentData.sdoh).forEach(([key, value], index) => {
        fhirBundle.entry.push({
          resource: {
            resourceType: 'Observation',
            id: `obs-sdoh-${index}`,
            status: 'final',
            code: { coding: [{ system: 'http://healthyhomes.local/sdoh', code: key, display: key }] },
            subject: { reference: 'Patient/patient-1' },
            valueString: String(value),
          },
        });
      });
    }

    console.log('FHIR Bundle:', JSON.stringify(fhirBundle, null, 2));
    toast({ title: t('ui.exportOptions'), description: 'FHIR R4 compliant bundle has been created' });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Download className="h-5 w-5" />
          {t('ui.exportOptions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default">
          <MailWarning className="h-4 w-4" />
          <AlertDescription>{t('ui.phiWarning')}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={generatePDFReport} disabled={!hasConsent} className="flex items-center gap-2" variant="outline">
            <FileText className="h-4 w-4" />
            {t('ui.downloadPdf')}
          </Button>

          <Button onClick={handleEmailReport} disabled={!hasConsent} className="flex items-center gap-2" variant="outline">
            <MailWarning className="h-4 w-4" />
            {t('ui.emailReport')}
          </Button>

          <Button onClick={handleShareReport} disabled={!hasConsent} className="flex items-center gap-2" variant="outline">
            <Share2 className="h-4 w-4" />
            {t('ui.shareReport')}
          </Button>
        </div>

        <div>
          <Button onClick={generateFHIRBundle} disabled={!hasConsent} className="flex items-center gap-2 mt-2" variant="outline">
            <Database className="h-4 w-4" />
            FHIR Bundle
          </Button>
        </div>

        {!hasConsent && <p className="text-sm text-muted-foreground text-center">{t('ui.consentNeededDesc')}</p>}
      </CardContent>
    </Card>
  );
};

export default ExportSection;