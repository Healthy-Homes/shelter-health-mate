import jsPDF from 'jspdf';

export interface PDFBuildOptions {
  residentName?: string;
  include: { residents: boolean; home: boolean; sdoh: boolean };
  checklist: Record<string, any>;
  sdoh: Record<string, any>;
  risk?: { score?: number; category?: string };
  translations: { t: (key: string) => string; tList: (key: string) => string[] };
}

export async function buildReportPDF(opts: PDFBuildOptions): Promise<Blob> {
  const { residentName, include, checklist, sdoh, risk, translations } = opts;
  const { t, tList } = translations;

  const doc = new jsPDF();
  let y = 14;

  doc.setFontSize(16);
  doc.text(t('ui.appTitle') || 'Shelter Health App', 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(200, 0, 0);
  doc.text(t('ui.phiWarning'), 14, y, { maxWidth: 180 });
  doc.setTextColor(0, 0, 0);
  y += 10;

  if (residentName) {
    doc.text(`${t('consent.residentName')}: ${residentName}`, 14, y);
    y += 8;
  }

  if (include.residents) {
    doc.setFontSize(12);
    doc.text(t('sections.residents'), 14, y);
    y += 6;
    doc.setFontSize(10);
    // In a full implementation, list resident details here (placeholder)
    doc.text('- Included in report', 18, y);
    y += 8;
  }

  if (include.home) {
    doc.setFontSize(12);
    doc.text(t('sections.homeInspection'), 14, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(checklist).forEach(([key, val]) => {
      const line = `${key}: ${Array.isArray(val) ? val.join(', ') : String(val)}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split as string[], 18, y);
      y += (split as string[]).length * 6;
    });
    y += 4;
  }

  if (include.sdoh) {
    doc.setFontSize(12);
    doc.text(t('sections.sdoh'), 14, y);
    y += 6;
    doc.setFontSize(10);
    Object.entries(sdoh).forEach(([key, val]) => {
      const line = `${key}: ${Array.isArray(val) ? val.join(', ') : String(val)}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split as string[], 18, y);
      y += (split as string[]).length * 6;
    });
  }

  if (risk?.score !== undefined) {
    y += 6;
    doc.setFontSize(12);
    doc.text(t('sections.risk'), 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${t('riskScore') || 'Risk Score'}: ${risk.score} (${risk.category})`, 18, y);
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
