// src/services/export/QRCodeService.ts
// Generates secure QR codes for health assessment data portability

import QRCode from 'qrcode';
import { EncryptionService } from '../security/EncryptionService';
import { 
  AssessmentResults, 
  ResponseMap, 
  ChecklistItem, 
  QRCodeData 
} from '../../types/export/fhirTypes';

export class QRCodeService {
  private static readonly MAX_QR_SIZE = 2000; // Typical QR code data limit
  private static readonly QR_VERSION = '1.0';

  /**
   * Generates secure QR codes containing assessment data
   */
  static async generateReportQR(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    options: {
      includeRawData?: boolean;
      includePersonalInfo?: boolean;
      expirationMinutes?: number;
      compressionLevel?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<string[]> {
    
    try {
      // Set defaults
      const config = {
        includeRawData: options.includeRawData ?? false,
        includePersonalInfo: options.includePersonalInfo ?? false,
        expirationMinutes: options.expirationMinutes ?? 60,
        compressionLevel: options.compressionLevel ?? 'medium'
      };

      // Build QR data payload
      const qrData = this.buildQRDataPayload(
        results, 
        responses, 
        questions, 
        config
      );

      // Encrypt and compress the data
      const encryptedData = EncryptionService.encryptData(qrData);

      // Split into chunks if data is too large
      const chunks = this.chunkData(encryptedData, this.MAX_QR_SIZE);

      // Generate QR codes for each chunk
      const qrCodes = await Promise.all(
        chunks.map((chunk, index) => this.generateQRCode(chunk, index, chunks.length))
      );

      return qrCodes;

    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR codes');
    }
  }

  /**
   * Builds the data payload for QR codes
   */
  private static buildQRDataPayload(
    results: AssessmentResults,
    responses: ResponseMap,
    questions: ChecklistItem[],
    config: any
  ): QRCodeData {
    
    // Generate access token if including sensitive data
    const accessToken = (config.includeRawData || config.includePersonalInfo) 
      ? EncryptionService.generateAccessToken(config.expirationMinutes)
      : undefined;

    // Build assessment types list
    const assessmentTypes = this.getAssessmentTypes(questions);

    const qrData: QRCodeData = {
      version: this.QR_VERSION,
      timestamp: new Date().toISOString(),
      accessToken,
      data: {
        riskScore: results.risk_score,
        riskLevel: results.risk_level,
        completionRate: Object.keys(responses).length / questions.length,
        priorityInterventions: results.priority_interventions.slice(0, 5), // Limit to top 5
        ...(config.includeRawData && { 
          responses: this.sanitizeResponses(responses, questions) 
        }),
        ...(config.includePersonalInfo && {
          patientInfo: {
            id: EncryptionService.generateSecureId('patient'),
            language: 'en' // Could be passed as parameter
          }
        })
      },
      metadata: {
        exportFormat: 'qr-encrypted',
        questionCount: questions.length,
        assessmentTypes
      }
    };

    return qrData;
  }

  /**
   * Sanitizes response data for QR code inclusion
   */
  private static sanitizeResponses(
    responses: ResponseMap, 
    questions: ChecklistItem[]
  ): ResponseMap {
    const sanitized: ResponseMap = {};
    const sensitiveKeywords = ['income', 'financial', 'abuse', 'violence', 'personal'];

    Object.entries(responses).forEach(([questionId, response]) => {
      const question = questions.find(q => q.item_id === questionId);
      
      if (question) {
        const questionText = question.question_text.toLowerCase();
        const isSensitive = sensitiveKeywords.some(keyword => 
          questionText.includes(keyword)
        );

        if (!isSensitive) {
          sanitized[questionId] = response;
        } else {
          // Replace sensitive responses with anonymized indicator
          sanitized[questionId] = 'REDACTED_FOR_PRIVACY';
        }
      }
    });

    return sanitized;
  }

  /**
   * Determines assessment types from question list
   */
  private static getAssessmentTypes(questions: ChecklistItem[]): string[] {
    const types = new Set<string>();

    questions.forEach(question => {
      if (question.item_id.startsWith('HALST_')) {
        types.add('Taiwan HALST');
      } else if (question.item_id.startsWith('US')) {
        types.add('US Healthy Homes');
      } else if (question.item_id.startsWith('ELDER_')) {
        types.add('Elder Safety');
      } else if (question.item_id.startsWith('SDOH_')) {
        types.add('Social Determinants');
      }
    });

    return Array.from(types);
  }

  /**
   * Splits data into manageable chunks for QR codes
   */
  private static chunkData(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Generates a single QR code for a data chunk
   */
  private static async generateQRCode(
    chunk: string, 
    index: number, 
    total: number
  ): Promise<string> {
    
    const chunkData = {
      part: index + 1,
      total: total,
      data: chunk,
      checksum: this.calculateChecksum(chunk)
    };

    const qrOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    return await QRCode.toDataURL(JSON.stringify(chunkData), qrOptions);
  }

  /**
   * Calculates checksum for data integrity
   */
  private static calculateChecksum(data: string): string {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum += data.charCodeAt(i);
    }
    return checksum.toString(16);
  }

  /**
   * Reconstructs data from multiple QR code chunks
   */
  static reconstructDataFromQRs(qrChunks: any[]): string {
    try {
      // Sort chunks by part number
      const sortedChunks = qrChunks.sort((a, b) => a.part - b.part);

      // Verify all parts are present
      const expectedTotal = sortedChunks[0]?.total || 1;
      if (sortedChunks.length !== expectedTotal) {
        throw new Error('Missing QR code parts');
      }

      // Verify checksums and reconstruct data
      let reconstructedData = '';
      
      sortedChunks.forEach((chunk, index) => {
        if (chunk.part !== index + 1) {
          throw new Error(`QR code part ${index + 1} is missing or out of order`);
        }

        const expectedChecksum = this.calculateChecksum(chunk.data);
        if (chunk.checksum !== expectedChecksum) {
          throw new Error(`QR code part ${chunk.part} failed checksum verification`);
        }

        reconstructedData += chunk.data;
      });

      return reconstructedData;

    } catch (error) {
      console.error('QR reconstruction failed:', error);
      throw new Error('Failed to reconstruct data from QR codes');
    }
  }

  /**
   * Decodes and decrypts QR code data
   */
  static decodeQRData(encryptedData: string): QRCodeData {
    try {
      const decryptedData = EncryptionService.decryptData(encryptedData);
      
      // Validate data structure
      if (!decryptedData.version || !decryptedData.data) {
        throw new Error('Invalid QR data structure');
      }

      // Check version compatibility
      if (decryptedData.version !== this.QR_VERSION) {
        console.warn(`QR data version mismatch: expected ${this.QR_VERSION}, got ${decryptedData.version}`);
      }

      return decryptedData as QRCodeData;

    } catch (error) {
      console.error('QR decoding failed:', error);
      throw new Error('Failed to decode QR data');
    }
  }

  /**
   * Generates summary QR code with basic risk information only
   */
  static async generateSummaryQR(results: AssessmentResults): Promise<string> {
    const summaryData = {
      version: this.QR_VERSION,
      timestamp: new Date().toISOString(),
      summary: {
        riskScore: results.risk_score,
        riskLevel: results.risk_level,
        interventionsCount: results.priority_interventions.length,
        issuesCount: results.questions_with_issues
      }
    };

    const qrOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      width: 300,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    };

    return await QRCode.toDataURL(JSON.stringify(summaryData), qrOptions);
  }

  /**
   * Validates QR code data integrity
   */
  static validateQRData(qrData: QRCodeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!qrData.version) {
      errors.push('Missing version information');
    }

    if (!qrData.timestamp) {
      errors.push('Missing timestamp');
    }

    if (!qrData.data) {
      errors.push('Missing data payload');
    } else {
      if (typeof qrData.data.riskScore !== 'number') {
        errors.push('Invalid risk score');
      }

      if (!qrData.data.riskLevel) {
        errors.push('Missing risk level');
      }

      if (typeof qrData.data.completionRate !== 'number' || 
          qrData.data.completionRate < 0 || 
          qrData.data.completionRate > 1) {
        errors.push('Invalid completion rate');
      }
    }

    // Validate access token if present
    if (qrData.accessToken && !EncryptionService.validateAccessToken(qrData.accessToken)) {
      errors.push('Invalid or expired access token');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
