// src/services/export/DirectPDFService.ts
import jsPDF from 'jspdf';
import { ChecklistItem, ResponseMap } from '../../types/checklist';
// Logo as base64
const SHELTER_HEALTH_LOGO = '';  // Empty for now

export class DirectPDFService {
  private pageHeight = 280;
  private currentY = 20;
  private leftMargin = 20;
  private pageWidth = 170;
  
  constructor() {
    this.doc = new jsPDF();
  }

  private checkPageBreak(neededSpace: number = 20) {
    if (this.currentY + neededSpace > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addTitle(text: string, fontSize: number = 16) {
    this.checkPageBreak(15);
    this.doc.setFontSize(fontSize);
    this.doc.setFont(undefined, 'bold');
    this.doc.text(text, this.leftMargin, this.currentY);
    this.currentY += fontSize * 0.5;
  }

  private addText(text: string, fontSize: number = 11) {
    this.checkPageBreak(10);
    this.doc.setFontSize(fontSize);
    this.doc.setFont(undefined, 'normal');
    const lines = this.doc.splitTextToSize(text, this.pageWidth);
    this.doc.text(lines, this.leftMargin, this.currentY);
    this.currentY += lines.length * fontSize * 0.4;
  }

  private addSection(title: string, content: () => void) {
    this.currentY += 5;
    this.checkPageBreak(30);
    this.addTitle(title, 14);
    this.currentY += 3;
    content();
    this.currentY += 5;
  }

  private drawProgressBar(label: string, percentage: number, y: number) {
    // Draw label
    this.doc.setFontSize(10);
    this.doc.text(label, this.leftMargin, y);
    
    // Draw background bar
    this.doc.setFillColor(229, 231, 235);
    this.doc.rect(this.leftMargin, y + 2, 100, 4, 'F');
    
    // Draw progress
    const color = percentage === 100 ? [16, 185, 129] : [245, 158, 11];
    this.doc.setFillColor(...color);
    this.doc.rect(this.leftMargin, y + 2, percentage, 4, 'F');
    
    // Draw percentage text
    this.doc.text(`${percentage}%`, this.leftMargin + 105, y);
  }

  generateReport(
    responses: ResponseMap,
    questions: ChecklistItem[],
    language: string = 'en',
    residentInfo?: any
  ): Blob {
    const isEnglish = language === 'en';
    
  
// Header with logo
this.doc.setFillColor(59, 130, 246);
this.doc.rect(0, 0, 210, 30, 'F');

// Add logo on right side of header
try {
  this.doc.addImage(SHELTER_HEALTH_LOGO, 'PNG', 165, 5, 35, 20);
} catch (error) {
  console.log('Logo failed to load:', error);
}

this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont(undefined, 'bold');
    this.doc.text(
      isEnglish ? 'Shelter Health Assessment Report' : '庇護所健康評估報告',
      this.leftMargin,
      18
    );
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 40;

    // Report Info
    this.doc.setFontSize(10);
    this.addText(`${isEnglish ? 'Date' : '日期'}: ${new Date().toLocaleDateString()}`);
    this.addText(`${isEnglish ? 'Report ID' : '報告編號'}: ${Date.now().toString(36).toUpperCase()}`);
    
    // Resident Info
    if (residentInfo) {
      this.addSection(isEnglish ? 'Resident Information' : '居民資訊', () => {
        this.addText(`${isEnglish ? 'Name/ID' : '姓名/識別碼'}: ${residentInfo.name || 'Not provided'}`);
        this.addText(`${isEnglish ? 'Number of Residents' : '居民人數'}: ${residentInfo.numberOfResidents || 1}`);
        this.addText(`${isEnglish ? 'Months in Residence' : '居住月數'}: ${residentInfo.tenureMonths || 'Not provided'}`);
      });
    }

    // Completion Summary
    const completionRate = Math.round((Object.keys(responses).length / questions.length) * 100);
    this.addSection(isEnglish ? 'Assessment Summary' : '評估摘要', () => {
      this.drawProgressBar(
        isEnglish ? 'Overall Completion' : '整體完成率',
        completionRate,
        this.currentY
      );
      this.currentY += 10;
      this.addText(`${Object.keys(responses).length}/${questions.length} ${isEnglish ? 'questions answered' : '題已回答'}`);
    });

    // Issues List
    const issues = this.identifyIssues(questions, responses);
    this.addSection(isEnglish ? 'Items Requiring Attention' : '需要關注的項目', () => {
      if (issues.length === 0) {
        this.doc.setTextColor(16, 185, 129);
        this.addText(isEnglish ? 'No critical issues identified.' : '未發現重要問題。');
        this.doc.setTextColor(0, 0, 0);
      } else {
        issues.forEach(issue => {
          this.checkPageBreak(15);
          this.doc.setFontSize(10);
          this.doc.text('• ', this.leftMargin, this.currentY);
          const text = `${issue.question_text} (${responses[issue.item_id]})`;
          const lines = this.doc.splitTextToSize(text, this.pageWidth - 5);
          this.doc.text(lines, this.leftMargin + 5, this.currentY);
          this.currentY += lines.length * 4;
        });
      }
    });

    // Section Details
    this.addSection(isEnglish ? 'Section Completion Details' : '分項完成詳情', () => {
      const sections = this.groupBySection(questions);
      sections.forEach(([section, sectionQuestions]) => {
        const answered = sectionQuestions.filter(q => responses[q.item_id]).length;
        const rate = Math.round((answered / sectionQuestions.length) * 100);
        
        this.checkPageBreak(20);
        this.doc.setFontSize(11);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(section, this.leftMargin, this.currentY);
        this.currentY += 5;
        
        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(10);
        this.drawProgressBar(
          `${answered}/${sectionQuestions.length} ${isEnglish ? 'completed' : '已完成'}`,
          rate,
          this.currentY
        );
        this.currentY += 10;
      });
    });

    // Footer
    this.checkPageBreak(30);
    this.doc.setFontSize(8);
    this.doc.setTextColor(107, 114, 128);
    this.doc.text(
      isEnglish 
        ? 'This assessment is for informational purposes only.'
        : '此評估僅供參考。',
      this.leftMargin,
      this.pageHeight - 10
    );

    return this.doc.output('blob');
  }

  private identifyIssues(questions: ChecklistItem[], responses: ResponseMap): ChecklistItem[] {
    return questions.filter(q => {
      const response = responses[q.item_id];
      if (!response) return false;
      
      if (response === 'yes' && q.risk_score_yes > q.risk_score_no) return true;
      if (response === 'no' && q.risk_score_no > q.risk_score_yes) return true;
      if (['poor', 'very_poor', 'broken', 'absent', 'not_working'].includes(response)) return true;
      
      return false;
    });
  }

  private groupBySection(questions: ChecklistItem[]): Array<[string, ChecklistItem[]]> {
    const map = new Map<string, ChecklistItem[]>();
    questions.forEach(q => {
      if (!map.has(q.section)) map.set(q.section, []);
      map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
  }
}
