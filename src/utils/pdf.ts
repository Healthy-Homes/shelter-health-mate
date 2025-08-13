import jsPDF from 'jspdf';
import { encryptCompressedJsonToPayload, sha256Hex } from '@/utils/crypto';
import { generateQRDataUrl } from '@/utils/qr';

export interface PDFBuildOptions {
  residentName?: string;
  include: { residents: boolean; home: boolean; sdoh: boolean };
  checklist: Record<string, any>;
  sdoh: Record<string, any>;
  risk?: { score?: number; category?: string };
  consent?: { confirmed: boolean; dateISO?: string; text?: string };
  translations: { t: (key: string) => string; tList: (key: string) => string[] };
  // Optional FHIR payload and QR settings
  fhirBundle?: any;
  qr?: { passphrase?: string; size?: number };
}

export async function buildReportPDF(opts: PDFBuildOptions): Promise<Blob> {
  const { residentName, include, checklist, sdoh, risk, translations, consent } = opts;
  const { t, tList } = translations;

  const doc = new jsPDF();
  let y = 14;

  // Helpers
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

  // Title
  doc.setFontSize(16);
  doc.text(resolved('ui.appTitle') || 'Shelter Health App', 14, y);
  y += 10;

  // PHI warning
  doc.setFontSize(10);
  doc.setTextColor(200, 0, 0);
  doc.text(resolved('ui.phiWarning') || 'Warning: Do not share PHI insecurely.', 14, y, { maxWidth: 180 });
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Consent
  doc.setFontSize(12);
  doc.text(resolved('consent.title') || 'Consent', 14, y);
  y += 6;
  doc.setFontSize(10);
  const dateStr = (consent?.dateISO ? new Date(consent.dateISO) : new Date()).toLocaleString();
  const confirmedOn = resolved('ui.confirmedOn') || 'Confirmed on';
  const notConfirmed = resolved('ui.notConfirmed') || 'Not confirmed';
  const consentLine = consent?.confirmed ? `✓ ${confirmedOn}: ${dateStr}` : `✗ ${notConfirmed}`;
  doc.text(consentLine, 18, y, { maxWidth: 180 });
  y += 6;
  const consentText = consent?.text || resolved('consent.text') || '';
  if (consentText) {
    const split = doc.splitTextToSize(consentText, 180);
    doc.text(split as string[], 18, y);
    y += (split as string[]).length * 6;
  }
  y += 4;

  // Resident name
  if (residentName) {
    doc.text(`${resolved('consent.residentName') || 'Resident Name'}: ${residentName}`, 14, y);
    y += 8;
  }

  // Residents section (placeholder)
  if (include.residents) {
    doc.setFontSize(12);
    doc.text(resolved('sections.residents') || 'Residents', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text('- Included in report', 18, y);
    y += 8;
  }

  // Home Inspection
  if (include.home) {
    doc.setFontSize(12);
    doc.text(resolved('sections.homeInspection') || 'Home Inspection', 14, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(checklist).forEach(([key, val]) => {
      const label = checklistLabel(key);
      const isYes = typeof val === 'boolean' ? val : Boolean(val);
      const valueTxt = typeof val === 'boolean' ? (val ? yesTxt : noTxt) : String(val);
      const line = `${isYes ? '✓' : '✗'} ${label}: ${valueTxt}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split as string[], 18, y);
      y += (split as string[]).length * 6;
    });
    y += 4;
  }

  // SDOH
  if (include.sdoh) {
    doc.setFontSize(12);
    doc.text(resolved('sections.sdoh') || 'Social Determinants of Health', 14, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(sdoh).forEach(([key, val]) => {
      const q = sdohQuestionLabel(key);
      const a = sdohAnswerText(key, val);
      const line = `• ${q}: ${a}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split as string[], 18, y);
      y += (split as string[]).length * 6;
    });
  }

  // Risk
  if (risk?.score !== undefined) {
    y += 6;
    doc.setFontSize(12);
    doc.text(resolved('sections.risk') || 'Risk Scoring', 14, y);
    y += 6;
    doc.setFontSize(10);
    const label = resolved('riskScore') || 'Risk Score';
    const category = risk.category || '';
    doc.text(`${label}: ${risk.score} (${category})`, 18, y);
  }

  // Encrypted FHIR QR (optional)
  if (opts.fhirBundle && opts.qr?.passphrase) {
    // Ensure space
    const sectionTitle = resolved('ui.encryptedFhirQr') || 'Encrypted FHIR QR';
    const infoText = resolved('ui.scanWithProviderApp') || 'Scan with provider app and decrypt with shared key.';
    const qrSize = Math.min(Math.max(opts.qr.size || 128, 128), 256);

    y += 8;
    if (y + qrSize + 20 > 280) {
      doc.addPage();
      y = 14;
    }

    doc.setFontSize(12);
    doc.text(sectionTitle, 14, y);
    y += 6;
    doc.setFontSize(9);

    const payload = await encryptCompressedJsonToPayload(opts.fhirBundle, opts.qr.passphrase);
    const fingerprint = (await sha256Hex(payload)).slice(0, 12);
    const qrDataUrl = await generateQRDataUrl(payload, qrSize);

    // Place QR image
    const x = 14;
    doc.addImage(qrDataUrl, 'PNG', x, y, qrSize / 3, qrSize / 3); // scale down to fit PDF units

    // Instructions beside QR
    const textX = x + qrSize / 3 + 6;
    const lines = doc.splitTextToSize(`${infoText}\nRef: ${fingerprint}`, 180 - textX);
    doc.text(lines as string[], textX, y + 6);

    y += qrSize / 3 + 6;
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename = 'HealthyHomesReport.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
