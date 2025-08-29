// src/services/export/PDFReportService.ts
// Generates professional PDF reports from health assessment data

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  AssessmentResults, 
  ResponseMap, 
  ChecklistItem,
  ReportData
} from '../../types/export/fhirTypes';
import { EncryptionService } from '../security/EncryptionService';

export class PDFReportService {
  private static readonly PDF_OPTIONS = {
    format: 'a4' as const,
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    compress: true
  };

  private static readonly CANVAS_OPTIONS = {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 794,  // A4 width in pixels at 96 DPI
    height: 1123 // A4 height in pixels at 96 DPI
  };

  /**
   * Main method to generate PDF report from HTML template
   */
  static async generateReport(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    language: string = 'en',
    options: {
      includeRawData?: boolean;
      includeQRCode?: boolean;
      watermark?: string;
    } = {}
  ): Promise<Blob> {
    
    try {
      // Find or create the report template element
      const reportElement = this.findOrCreateReportElement();
      
      if (!reportElement) {
        throw new Error('Report template element not found');
      }

      // Populate the template with data
      await this.populateReportTemplate(
        reportElement, 
        results, 
        responses, 
        questions, 
        language,
        options
      );

      // Convert to canvas
      const canvas = await html2canvas(reportElement, this.CANVAS_OPTIONS);

      // Generate PDF
      const pdf = await this.createPDFFromCanvas(canvas, results, language);

      // Clean up temporary elements
      this.cleanupReportElement(reportElement);

      return pdf.output('blob');

    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * Finds existing report element or creates a temporary one
   */
  private static findOrCreateReportElement(): HTMLElement {
    let reportElement = document.getElementById('pdf-report');
    
    if (!reportElement) {
      // Create temporary element for PDF generation
      reportElement = document.createElement('div');
      reportElement.id = 'pdf-report';
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.top = '0';
      reportElement.style.width = '794px'; // A4 width
      reportElement.style.backgroundColor = '#ffffff';
      reportElement.style.padding = '40px';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      reportElement.style.fontSize = '14px';
      reportElement.style.lineHeight = '1.4';
      reportElement.style.color = '#333333';
      
      document.body.appendChild(reportElement);
    }

    return reportElement;
  }

  /**
   * Populates the report template with assessment data
   */
  private static async populateReportTemplate(
    element: HTMLElement,
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    language: string,
    options: any
  ): Promise<void> {
    
    const reportData: ReportData = {
      assessment: { results, responses, questions },
      metadata: {
        language,
        timestamp: new Date().toISOString(),
        version: '1.0',
        generatedBy: 'Shelter Health Assessment System'
      }
    };

    // Generate report HTML content
    const htmlContent = this.generateReportHTML(reportData, options);
    element.innerHTML = htmlContent;

    // Wait for any images or fonts to load
    await this.waitForContentLoad(element);
  }

  /**
   * Generates the HTML content for the report
   */
  private static generateReportHTML(reportData: ReportData, options: any): string {
    const { results, responses, questions } = reportData.assessment;
    const { language, timestamp } = reportData.metadata;
    
    const isEnglish = language === 'en';
    const completionRate = Math.round((Object.keys(responses).length / questions.length) * 100);

    return `
      <div class="report-container">
        <!-- Header -->
        <div class="report-header" style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">
            ${isEnglish ? 'Home Health Assessment Report' : '居家健康評估報告'}
          </h1>
          <div style="font-size: 12px; color: #6b7280;">
            <div>${isEnglish ? 'Generated on' : '生成日期'}: ${new Date(timestamp).toLocaleDateString()}</div>
            <div>${isEnglish ? 'Language' : '語言'}: ${isEnglish ? 'English' : '繁體中文'}</div>
            <div>${isEnglish ? 'Report ID' : '報告編號'}: ${EncryptionService.generateSecureId('report').substring(0, 12)}</div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary" style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
            ${isEnglish ? 'Executive Summary' : '執行摘要'}
          </h2>
          
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${results.risk_score}</div>
              <div style="font-size: 12px; color: #7f1d1d;">${isEnglish ? 'Risk Score' : '風險評分'}</div>
              <div style="font-size: 10px; color: #7f1d1d;">${isEnglish ? 'out of 100' : '滿分 100 分'}</div>
            </div>
            
            <div style="flex: 1; background: ${this.getRiskLevelColor(results.risk_level).bg}; padding: 15px; border-radius: 8px; border-left: 4px solid ${this.getRiskLevelColor(results.risk_level).border};">
              <div style="font-size: 24px; font-weight: bold; color: ${this.getRiskLevelColor(results.risk_level).text};">
                ${isEnglish ? results.risk_level : this.translateRiskLevel(results.risk_level)}
              </div>
              <div style="font-size: 12px; color: ${this.getRiskLevelColor(results.risk_level).text};">
                ${isEnglish ? 'Risk Level' : '風險等級'}
              </div>
            </div>
            
            <div style="flex: 1; background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${completionRate}%</div>
              <div style="font-size: 12px; color: #1e40af;">${isEnglish ? 'Completion Rate' : '完成率'}</div>
              <div style="font-size: 10px; color: #1e40af;">
                ${Object.keys(responses).length}/${questions.length} ${isEnglish ? 'questions' : '題'}
              </div>
            </div>
          </div>
        </div>

        <!-- Issues Summary -->
        ${results.questions_with_issues > 0 ? `
        <div class="issues-summary" style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
            ${isEnglish ? 'Issues Identified' : '已識別問題'}
          </h2>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">
              ${results.questions_with_issues} ${isEnglish ? 'areas need attention' : '個區域需要關注'}
            </div>
            <div style="font-size: 12px; color: #92400e;">
              ${isEnglish ? 'Review the priority interventions below for specific actions' : '請查看下方的優先處理事項以了解具體行動'}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Priority Interventions -->
        <div class="interventions" style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
            ${isEnglish ? 'Priority Interventions' : '優先處理事項'}
          </h2>
          
          ${results.priority_interventions.slice(0, 10).map((intervention, index) => `
            <div style="margin-bottom: 15px; padding: 12px; border-radius: 6px; background: #f9fafb; border-left: 3px solid ${this.getPriorityColor(intervention.priority)};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="flex: 1;">
                  <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">
                    ${intervention.section}
                  </div>
                  ${intervention.explanation ? `
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                      ${intervention.explanation}
                    </div>
                  ` : ''}
                  <div style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; color: white; background: ${this.getPriorityColor(intervention.priority)};">
                    ${isEnglish ? intervention.priority : this.translatePriority(intervention.priority)} ${isEnglish ? 'priority' : '優先級'}
                  </div>
                </div>
                <div style="text-align: right; margin-left: 15px;">
                  <div style="font-size: 18px; font-weight: bold; color: ${intervention.risk_score > 70 ? '#dc2626' : intervention.risk_score > 40 ? '#f59e0b' : '#10b981'};">
                    ${intervention.risk_score}/100
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Assessment Details by Section -->
        <div class="section-details" style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
            ${isEnglish ? 'Detailed Findings' : '詳細發現'}
          </h2>
          
          ${this.generateSectionDetails(results, questions, responses, isEnglish)}
        </div>

        <!-- Footer -->
        <div class="report-footer" style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
          <div style="font-size: 10px; color: #6b7280; line-height: 1.5;">
            <p><strong>${isEnglish ? 'Important Disclaimer' : '重要免責聲明'}:</strong> 
            ${isEnglish 
              ? 'This assessment is for informational purposes only and does not constitute medical advice. Please consult with healthcare professionals for medical concerns.' 
              : '此評估僅供參考，不構成醫療建議。如有醫療問題，請諮詢醫療專業人員。'}
            </p>
            <p><strong>${isEnglish ? 'Data Processing' : '數據處理'}:</strong> 
            ${isEnglish 
              ? 'All data processed securely with end-to-end encryption. No personal health information is stored or transmitted without consent.' 
              : '所有數據均經過端對端加密安全處理。未經同意，不會存儲或傳輸個人健康信息。'}
            </p>
            <p>${isEnglish ? 'Generated by' : '生成者'}: Shelter Health Assessment System v1.0</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generates detailed findings by section
   */
  private static generateSectionDetails(
    results: AssessmentResults,
    questions: ChecklistItem[],
    responses: ResponseMap,
    isEnglish: boolean
  ): string {
    const sectionMap = new Map<string, ChecklistItem[]>();
    
    // Group questions by section
    questions.forEach(question => {
      if (!sectionMap.has(question.section)) {
        sectionMap.set(question.section, []);
      }
      sectionMap.get(question.section)!.push(question);
    });

    return Array.from(sectionMap.entries()).map(([section, sectionQuestions]) => {
      const answeredQuestions = sectionQuestions.filter(q => responses[q.item_id]);
      const completionRate = Math.round((answeredQuestions.length / sectionQuestions.length) * 100);
      
      return `
        <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">
            ${section}
          </h3>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 12px; color: #6b7280;">
              ${answeredQuestions.length}/${sectionQuestions.length} ${isEnglish ? 'questions completed' : '題已完成'}
            </div>
            <div style="font-size: 12px; font-weight: bold; color: ${completionRate === 100 ? '#10b981' : '#f59e0b'};">
              ${completionRate}%
            </div>
          </div>
          <div style="width: 100%; background: #e5e7eb; border-radius: 4px; height: 6px;">
            <div style="width: ${completionRate}%; background: ${completionRate === 100 ? '#10b981' : '#f59e0b'}; border-radius: 4px; height: 6px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Converts canvas to PDF
   */
  private static async createPDFFromCanvas(
    canvas: HTMLCanvasElement,
    results: AssessmentResults,
    language: string
  ): Promise<jsPDF> {
    const pdf = new jsPDF(this.PDF_OPTIONS);
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let position = 0;
    const pageHeight = 297; // A4 height in mm
    let pageNumber = 1;

    // Add pages as needed
    while (position < imgHeight) {
      const remainingHeight = imgHeight - position;
      const currentPageHeight = Math.min(pageHeight - 20, remainingHeight); // Leave margin for page numbers
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        -position,
        imgWidth,
        imgHeight
      );
      
      // Add page number
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `${language === 'en' ? 'Page' : '第'} ${pageNumber} ${language === 'en' ? '' : '頁'}`,
        imgWidth - 20,
        pageHeight - 5
      );
      
      position += currentPageHeight;
      pageNumber++;
      
      if (position < imgHeight) {
        pdf.addPage();
      }
    }

    return pdf;
  }

  /**
   * Helper method to get risk level colors
   */
  private static getRiskLevelColor(level: string) {
    switch (level.toLowerCase()) {
      case 'critical':
        return { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' };
      case 'high':
        return { bg: '#fff7ed', border: '#ea580c', text: '#ea580c' };
      case 'elevated':
        return { bg: '#fefce8', border: '#eab308', text: '#eab308' };
      case 'moderate':
        return { bg: '#eff6ff', border: '#2563eb', text: '#2563eb' };
      default:
        return { bg: '#f0fdf4', border: '#16a34a', text: '#16a34a' };
    }
  }

  /**
   * Helper method to get priority colors
   */
  private static getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#eab308';
      default: return '#16a34a';
    }
  }

  /**
   * Translates risk level to Chinese
   */
  private static translateRiskLevel(level: string): string {
    const translations: Record<string, string> = {
      'low': '低風險',
      'moderate': '中度風險',
      'elevated': '升高風險',
      'high': '高風險',
      'critical': '極高風險'
    };
    return translations[level.toLowerCase()] || level;
  }

  /**
   * Translates priority to Chinese
   */
  private static translatePriority(priority: string): string {
    const translations: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'critical': '極高'
    };
    return translations[priority.toLowerCase()] || priority;
  }

  /**
   * Waits for content to load (images, fonts)
   */
  private static async waitForContentLoad(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(resolve, 3000); // Timeout after 3 seconds
      });
    });

    await Promise.all(imagePromises);
    
    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Cleans up temporary report element
   */
  private static cleanupReportElement(element: HTMLElement): void {
    if (element.id === 'pdf-report' && element.style.position === 'absolute') {
      document.body.removeChild(element);
    }
  }

  /**
   * Downloads the PDF with a specific filename
   */
  static downloadReport(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename || `health-assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
