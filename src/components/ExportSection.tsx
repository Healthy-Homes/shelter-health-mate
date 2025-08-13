import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AssessmentData } from '@/types';
import { Download, FileText, Database, MailWarning, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { buildReportPDF, downloadPDF } from '@/utils/pdf';
import { buildMailto, defaultEmailContent } from '@/utils/mailto';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

  const [fhirOpen, setFhirOpen] = useState(false);
  const [fhirJson, setFhirJson] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');

  const ensureConsent = () => {
    if (!hasConsent) {
      toast({ title: t('ui.consentRequired'), description: t('ui.consentNeededDesc'), variant: 'destructive' });
      return false;
    }
    return true;
  };

  const generatePDFReport = async () => {
    if (!ensureConsent()) return;

    let fhirBundle: any | undefined;
    let qr: { passphrase?: string; size?: number } | undefined;

    // Ask for passphrase to include encrypted FHIR QR in the PDF (optional)
    const pp = window.prompt(
      t('ui.enterPassphrase') || 'Enter passphrase for QR encryption (providers will decrypt):',
      ''
    );
    const pass = (pp || '').trim();

    if (pass) {
      // Build a FHIR bundle using the same mapping as the FHIR modal
      const resolved = (path: string): string | undefined => {
        const v = t(path);
        return v && v !== path ? v : undefined;
      };
      const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const yesTxt = resolved('ui.yes') || 'Yes';
      const noTxt = resolved('ui.no') || 'No';
      const checklistLabel = (key: string) =>
        resolved(`checklist.items.${key}`) || resolved(`checklist.${key}`) || titleCase(key);
      const sdohQuestionLabel = (key: string) =>
        resolved(`sdoh.${key}.question`) || resolved(`sdoh.${key}`) || titleCase(key);
      const sdohAnswerText = (key: string, value: any): string => {
        if (typeof value === 'boolean') return value ? yesTxt : noTxt;
        if (typeof value === 'string') {
          const m = value.match(/^opt(\d+)$/);
          if (m) {
            const idx = parseInt(m[1], 10) - 1;
            const opts = (() => {
              const o1 = tList(`sdoh.${key}.options`);
              if (o1 && o1.length) return o1;
              const o2 = tList(`sdoh.options.${key}`);
              if (o2 && o2.length) return o2;
              const raw = t(`sdoh.${key}`);
              return Array.isArray(raw) ? (raw as string[]) : [];
            })();
            return opts[idx] || value;
          }
          return value;
        }
        if (Array.isArray(value)) return value.map((v) => sdohAnswerText(key, v)).join(', ');
        return String(value);
      };

      fhirBundle = {
        resourceType: 'Bundle',
        id: `shelter-health-${Date.now()}`,
        type: 'document',
        timestamp: new Date().toISOString(),
        entry: [],
      } as any;
      // Patient
      fhirBundle.entry.push({
        resource: { resourceType: 'Patient', id: 'patient-1', name: [{ text: residentName || 'Anonymous' }] },
      });
      // Consent
      fhirBundle.entry.push({
        resource: {
          resourceType: 'Consent',
          id: 'consent-1',
          status: 'active',
          patient: { reference: 'Patient/patient-1' },
          dateTime: new Date().toISOString(),
        },
      });
      // Checklist
      if (include.home) {
        Object.entries(assessmentData.checklist).forEach(([key, value], index) => {
          if (value === true) {
            const display = checklistLabel(key);
            fhirBundle.entry.push({
              resource: {
                resourceType: 'Observation',
                id: `obs-checklist-${index}`,
                status: 'final',
                code: {
                  coding: [{ system: 'http://healthyhomes.local/checklist', code: key, display }],
                  text: display,
                },
                subject: { reference: 'Patient/patient-1' },
                valueBoolean: true,
              },
            });
          }
        });
      }
      // SDOH
      if (include.sdoh) {
        Object.entries(assessmentData.sdoh).forEach(([key, value], index) => {
          const display = sdohQuestionLabel(key);
          const answer = sdohAnswerText(key, value);
          fhirBundle.entry.push({
            resource: {
              resourceType: 'Observation',
              id: `obs-sdoh-${index}`,
              status: 'final',
              code: {
                coding: [{ system: 'http://healthyhomes.local/sdoh', code: key, display }],
                text: display,
              },
              subject: { reference: 'Patient/patient-1' },
              valueString: answer,
            },
          });
        });
      }

      qr = { passphrase: pass, size: 192 };
    }

    const blob = await buildReportPDF({
      residentName,
      include,
      checklist: include.home ? assessmentData.checklist : {},
      sdoh: include.sdoh ? assessmentData.sdoh : {},
      risk: riskScoringEnabled ? { score: assessmentData.riskScore, category: assessmentData.riskCategory } : {},
      consent: { confirmed: hasConsent, dateISO: new Date().toISOString(), text: t('consent.text') },
      translations: { t, tList },
      fhirBundle,
      qr,
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

  const generateFHIRBundle = () => {
    if (!ensureConsent()) return;

    const resolved = (path: string): string | undefined => {
      const v = t(path);
      return v && v !== path ? v : undefined;
    };
    const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const yesTxt = resolved('ui.yes') || 'Yes';
    const noTxt = resolved('ui.no') || 'No';
    const checklistLabel = (key: string) =>
      resolved(`checklist.items.${key}`) || resolved(`checklist.${key}`) || titleCase(key);
    const sdohQuestionLabel = (key: string) =>
      resolved(`sdoh.${key}.question`) || resolved(`sdoh.${key}`) || titleCase(key);
    const sdohAnswerText = (key: string, value: any): string => {
      if (typeof value === 'boolean') return value ? yesTxt : noTxt;
      if (typeof value === 'string') {
        const m = value.match(/^opt(\d+)$/);
        if (m) {
          const idx = parseInt(m[1], 10) - 1;
          const opts = ((): string[] => {
            const o1 = tList(`sdoh.${key}.options`);
            if (o1 && o1.length) return o1;
            const o2 = tList(`sdoh.options.${key}`);
            if (o2 && o2.length) return o2;
            const raw = t(`sdoh.${key}`);
            return Array.isArray(raw) ? (raw as string[]) : [];
          })();
          return opts[idx] || value;
        }
        return value;
      }
      if (Array.isArray(value)) return value.map((v) => sdohAnswerText(key, v)).join(', ');
      return String(value);
    };

    const fhirBundle: any = {
      resourceType: 'Bundle',
      id: `shelter-health-${Date.now()}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [],
    };

    // Patient
    fhirBundle.entry.push({
      resource: { resourceType: 'Patient', id: 'patient-1', name: [{ text: residentName || 'Anonymous' }] },
    });

    // Consent
    fhirBundle.entry.push({
      resource: {
        resourceType: 'Consent',
        id: 'consent-1',
        status: 'active',
        patient: { reference: 'Patient/patient-1' },
        dateTime: new Date().toISOString(),
      },
    });

    // Checklist observations (true items)
    if (include.home) {
      Object.entries(assessmentData.checklist).forEach(([key, value], index) => {
        if (value === true) {
          const display = checklistLabel(key);
          fhirBundle.entry.push({
            resource: {
              resourceType: 'Observation',
              id: `obs-checklist-${index}`,
              status: 'final',
              code: {
                coding: [{ system: 'http://healthyhomes.local/checklist', code: key, display }],
                text: display,
              },
              subject: { reference: 'Patient/patient-1' },
              valueBoolean: true,
            },
          });
        }
      });
    }

    // SDOH observations
    if (include.sdoh) {
      Object.entries(assessmentData.sdoh).forEach(([key, value], index) => {
        const display = sdohQuestionLabel(key);
        const answer = sdohAnswerText(key, value);
        fhirBundle.entry.push({
          resource: {
            resourceType: 'Observation',
            id: `obs-sdoh-${index}`,
            status: 'final',
            code: {
              coding: [{ system: 'http://healthyhomes.local/sdoh', code: key, display }],
              text: display,
            },
            subject: { reference: 'Patient/patient-1' },
            valueString: answer,
          },
        });
      });
    }

    const pretty = JSON.stringify(fhirBundle, null, 2);
    setFhirJson(pretty);
    setFhirOpen(true);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={generatePDFReport} disabled={!hasConsent} className="flex items-center gap-2" variant="outline">
            <FileText className="h-4 w-4" />
            {t('ui.downloadPdf')}
          </Button>

          <Button onClick={handleEmailReport} disabled={!hasConsent} className="flex items-center gap-2" variant="outline">
            <MailWarning className="h-4 w-4" />
            {t('ui.emailReport')}
          </Button>
        </div>

        <div>
          <Button onClick={generateFHIRBundle} disabled={!hasConsent} className="flex items-center gap-2 mt-2" variant="outline">
            <Database className="h-4 w-4" />
            FHIR Bundle
          </Button>
        </div>

        {!hasConsent && <p className="text-sm text-muted-foreground text-center">{t('ui.consentNeededDesc')}</p>}

        <Dialog open={fhirOpen} onOpenChange={setFhirOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>FHIR Bundle (JSON)</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <pre className="max-h-[50vh] overflow-auto rounded-md bg-muted p-3 text-sm"><code>{fhirJson}</code></pre>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(fhirJson); toast({ title: 'Copied', description: 'FHIR JSON copied to clipboard' }); }} className="flex items-center gap-2">
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" onClick={() => { const blob = new Blob([fhirJson], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fhir-bundle-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); }} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Download JSON
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ExportSection;