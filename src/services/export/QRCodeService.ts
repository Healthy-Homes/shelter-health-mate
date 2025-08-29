// src/services/export/QRCodeService.ts
// Enhanced QR code service with download and PDF integration capabilities

import QRCode from 'qrcode';
import { EncryptionService } from '../security/EncryptionService';
import { 
  AssessmentResults, 
  ResponseMap,
  ChecklistItem 
} from '../../types/checklist';

export interface QRCodeResult {
  dataUrl: string;
  downloadUrl: string;
  filename: string;
  index: number;
  total: number;
  size: string;
}

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}

export class QRCodeService {
  private static readonly DEFAULT_OPTIONS: QRCodeOptions = {
    errorCorrectionLevel: 'H', // High error correction for healthcare
    type: 'image/png',
    quality: 0.92,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 512 // High resolution for printing
  };

  /**
   * Generates downloadable QR codes with enhanced options
   */
  static async generateDownloadableQRCodes(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: {
      includeRawData?: boolean;
      includePersonalInfo?: boolean;
      expirationMinutes?: number;
      format?: 'FHIR' | 'JSON';
    } = {}
  ): Promise<QRCodeResult[]> {
    try {
      const { includeRawData = true, includePersonalInfo = false, expirationMinutes = 60, format = 'FHIR' } = options;

      // Prepare data payload based on format
      let dataPayload;
      if (format === 'FHIR') {
        // Use FHIR mapping service (would need to import)
        dataPayload = await this.prepareFHIRPayload(results, responses, questions);
      } else {
        dataPayload = {
          results,
          responses: includeRawData ? responses : {},
          questions: includeRawData ? questions : [],
          metadata: {
            exportDate: new Date().toISOString(),
            format: 'JSON',
            version: '1.0'
          }
        };
      }

      // Sanitize data if needed
      if (!includePersonalInfo) {
        dataPayload = EncryptionService.sanitizeForExport(dataPayload, {
          anonymizeIds: true,
          removeSensitiveResponses: true
        });
      }

      // Generate access token
      const accessToken = EncryptionService.generateAccessToken(expirationMinutes);

      // Always use chunking for assessment data to avoid size issues
      const maxSingleQRSize = 1500; // More conservative limit
      const chunks = EncryptionService.chunkDataForQR(dataPayload, maxSingleQRSize);
      const qrCodes: QRCodeResult[] = [];

      for (const chunk of chunks) {
        const qrCode = await this.createSingleQRCode(
          chunk.chunk, 
          accessToken, 
          chunk.index, 
          chunk.total
        );
        qrCodes.push(qrCode);
      }

      return qrCodes;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR codes');
    }
  }

  /**
   * Creates a single downloadable QR code
   */
  private static async createSingleQRCode(
    data: any, 
    accessToken: string, 
    index: number, 
    total: number
  ): Promise<QRCodeResult> {
    const payload = {
      data: EncryptionService.encryptData(data),
      token: accessToken,
      metadata: {
        part: index,
        total: total,
        timestamp: Date.now(),
        version: '2.1'
      }
    };

    const qrData = JSON.stringify(payload);
    
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrData, this.DEFAULT_OPTIONS);
    
    // Create downloadable blob URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const filename = total > 1 
              ? `health-assessment-qr-part${index}-of-${total}.png`
              : 'health-assessment-qr.png';

            resolve({
              dataUrl,
              downloadUrl,
              filename,
              index,
              total,
              size: this.formatFileSize(blob.size)
            });
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 0.92);
      };
      
      img.onerror = () => reject(new Error('Failed to load QR image'));
      img.src = dataUrl;
    });
  }

  /**
   * Downloads a QR code file
   */
  static downloadQRCode(qrResult: QRCodeResult): void {
    const link = document.createElement('a');
    link.href = qrResult.downloadUrl;
    link.download = qrResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Downloads all QR codes as a ZIP file (simplified version)
   */
  static async downloadAllQRCodes(qrResults: QRCodeResult[]): Promise<void> {
    // For now, download individually
    // In production, you might want to use a ZIP library
    for (const qr of qrResults) {
      this.downloadQRCode(qr);
      // Small delay to prevent browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Generates QR codes for PDF embedding
   */
  static async generatePDFEmbeddableQRCodes(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: {
      includeRawData?: boolean;
      includePersonalInfo?: boolean;
      expirationMinutes?: number;
    } = {}
  ): Promise<{ dataUrl: string; width: number; height: number }[]> {
    const qrResults = await this.generateDownloadableQRCodes(results, responses, questions, {
      ...options,
      format: 'FHIR' // Always use FHIR for PDF embedding
    });

    return qrResults.map(qr => ({
      dataUrl: qr.dataUrl,
      width: this.DEFAULT_OPTIONS.width || 512,
      height: this.DEFAULT_OPTIONS.width || 512
    }));
  }

  /**
   * Validates and reconstructs data from multiple QR codes
   */
  static async reconstructFromQRCodes(qrDataArray: string[]): Promise<any> {
    try {
      const chunks: Array<{data: any, metadata: any}> = [];

      // Parse and decrypt each QR code
      for (const qrData of qrDataArray) {
        const payload = JSON.parse(qrData);
        
        // Validate access token
        if (!EncryptionService.validateAccessToken(payload.token)) {
          throw new Error('Invalid or expired access token');
        }

        // Decrypt data
        const decryptedData = EncryptionService.decryptData(payload.data);
        
        // Extract chunk data and metadata
        if (decryptedData.data && decryptedData.metadata) {
          chunks.push({
            data: decryptedData.data,
            metadata: decryptedData.metadata
          });
        } else {
          // Single chunk case
          chunks.push({
            data: decryptedData,
            metadata: { chunkIndex: 1, totalChunks: 1 }
          });
        }
      }

      // Use EncryptionService reconstruction method
      return EncryptionService.reconstructFromChunks(chunks);
    } catch (error) {
      console.error('QR reconstruction failed:', error);
      throw new Error('Failed to reconstruct data from QR codes');
    }
  }

  /**
   * Prepares optimized payload for QR codes - minimal data only
   */
  private static async prepareFHIRPayload(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): Promise<any> {
    // Create minimal QR-optimized payload
    return {
      // Essential assessment data only
      assessmentId: results.assessmentId || 'unknown',
      assessmentType: results.assessmentType || 'health-assessment',
      timestamp: new Date().toISOString(),
      
      // Compact responses - question ID and answer only
      responses: Object.entries(responses).map(([questionId, answer]) => ({
        q: questionId,
        a: answer
      })),
      
      // Summary data only
      summary: {
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(responses).length,
        riskScore: results.risk_score,
        riskLevel: results.risk_level,
        issueCount: results.questions_with_issues,
        priorityInterventions: results.priority_interventions?.slice(0, 3) || [] // Top 3 only
      },
      
      // Section scores without detailed breakdown
      sectionScores: results.sectionScores,
      
      // Minimal metadata
      meta: {
        version: '1.0',
        format: 'qr-optimized',
        language: 'en', // Could be dynamic
        exportType: 'assessment-summary'
      }
    };
  }

  /**
   * Prepares comprehensive FHIR payload for JSON export
   */
  static async prepareFullFHIRPayload(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[]
  ): Promise<any> {
    // Import FHIR mapping service dynamically to avoid circular dependencies
    const { FHIRMappingService } = await import('./FHIRMappingService');
    
    // Use the full FHIR bundle creation
    return FHIRMappingService.createFHIRBundle(results, responses, questions);
  }

  /**
   * Formats file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Cleanup blob URLs to prevent memory leaks
   */
  static cleanupBlobUrls(qrResults: QRCodeResult[]): void {
    qrResults.forEach(qr => {
      if (qr.downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qr.downloadUrl);
      }
    });
  }
}
