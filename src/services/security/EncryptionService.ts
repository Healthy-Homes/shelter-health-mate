// src/services/security/EncryptionService.ts
// Security service for encrypting health assessment data

import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

export class EncryptionService {
  // In production, this should be an environment variable
  private static readonly SECRET_KEY = 'health-assessment-2025-key';
  private static readonly SALT = 'shelter-health-salt';

  /**
   * Sanitizes data before encryption to handle Unicode and special characters
   */
  private static sanitizeForEncryption(data: any): any {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'string') {
        // Handle Unicode characters and normalize
        return value
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/[\uFFFD]/g, '') // Remove replacement characters
          .trim();
      }
      
      return value;
    }));
  }

  /**
   * Encrypts and compresses data for secure storage/transmission
   */
  static encryptData(data: any): string {
    try {
      // Sanitize data first
      const sanitizedData = this.sanitizeForEncryption(data);
      
      // Convert to JSON string
      const jsonString = JSON.stringify(sanitizedData);
      
      // Skip compression and use direct encryption to avoid encoding issues
      // Convert string to WordArray for CryptoJS
      const message = CryptoJS.enc.Utf8.parse(jsonString);
      
      // Encrypt directly
      const encrypted = CryptoJS.AES.encrypt(message, this.SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const encryptedString = encrypted.toString();
      
      // Create simple payload without compression
      const payload = {
        data: encryptedString,
        timestamp: Date.now(),
        version: '2.1' // Updated version
      };
      
      // Simple base64 encoding
      const payloadString = JSON.stringify(payload);
      return btoa(payloadString);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts and decompresses data with proper Unicode handling
   */
  static decryptData(encryptedPayload: string): any {
    try {
      // Decode base64
      const payloadJson = atob(encryptedPayload);
      const payload = JSON.parse(payloadJson);
      
      // Check version for compatibility
      if (payload.version === '2.1') {
        // New simplified decryption
        const decrypted = CryptoJS.AES.decrypt(payload.data, this.SECRET_KEY, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) {
          throw new Error('Decryption failed - invalid key or corrupted data');
        }
        
        return JSON.parse(decryptedString);
      } else {
        // Legacy version handling
        console.warn('Using legacy decryption method');
        throw new Error('Legacy payload format no longer supported');
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generates a secure access token with configurable expiration
   */
  static generateAccessToken(expirationMinutes: number = 60): string {
    // Handle "never expire" case
    const expirationTime = expirationMinutes === 0 
      ? Date.now() + (100 * 365 * 24 * 60 * 60 * 1000) // 100 years from now
      : Date.now() + (expirationMinutes * 60 * 1000);
    
    const randomValue = Math.random().toString(36).substring(2);
    
    const tokenData = {
      exp: expirationTime,
      rand: randomValue,
      salt: this.SALT,
      neverExpire: expirationMinutes === 0
    };
    
    return this.encryptData(tokenData);
  }

  /**
   * Validates an access token
   */
  static validateAccessToken(token: string): boolean {
    try {
      const tokenData = this.decryptData(token);
      
      // Check if token is set to never expire
      if (tokenData.neverExpire) {
        return tokenData.salt === this.SALT;
      }
      
      // Check expiration for normal tokens
      if (tokenData.exp <= Date.now()) {
        return false;
      }
      
      // Check salt
      if (tokenData.salt !== this.SALT) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a secure hash of sensitive data for anonymization
   */
  static anonymizeData(sensitiveValue: string): string {
    // Handle Unicode properly in hashing
    const utf8Value = CryptoJS.enc.Utf8.parse(sensitiveValue + this.SALT);
    return CryptoJS.SHA256(utf8Value).toString().substring(0, 16);
  }

  /**
   * Generates a secure random ID
   */
  static generateSecureId(prefix: string = 'assessment'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const combinedValue = timestamp + random + this.SALT;
    const utf8Value = CryptoJS.enc.Utf8.parse(combinedValue);
    const hash = CryptoJS.SHA256(utf8Value).toString().substring(0, 8);
    
    return `${prefix}-${timestamp}-${hash}`;
  }

  /**
   * Enhanced data sanitization for export with research options
   */
  static sanitizeForExport(data: any, options: {
    anonymizeIds?: boolean;
    removeTimestamps?: boolean;
    removeSensitiveResponses?: boolean;
    researchMode?: boolean;
  } = {}): any {
    const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone
    
    if (options.anonymizeIds && sanitized.patientId) {
      sanitized.patientId = this.anonymizeData(sanitized.patientId);
    }
    
    if (options.removeTimestamps) {
      delete sanitized.timestamp;
      delete sanitized.createdAt;
      delete sanitized.modifiedAt;
    }
    
    if (options.removeSensitiveResponses && sanitized.responses) {
      // Remove responses to potentially sensitive questions
      const sensitivePatterns = ['income', 'financial', 'abuse', 'violence', 'substance'];
      
      Object.keys(sanitized.responses).forEach(questionId => {
        const question = data.questions?.find((q: any) => q.item_id === questionId);
        if (question) {
          const questionText = question.question_text.toLowerCase();
          if (sensitivePatterns.some(pattern => questionText.includes(pattern))) {
            if (options.researchMode) {
              // For research, replace with anonymized response
              sanitized.responses[questionId] = '[REDACTED_FOR_RESEARCH]';
            } else {
              delete sanitized.responses[questionId];
            }
          }
        }
      });
    }
    
    return sanitized;
  }

  /**
   * Generates a cryptographic signature for data integrity
   */
  static signData(data: any): string {
    const dataString = JSON.stringify(data);
    const utf8Data = CryptoJS.enc.Utf8.parse(dataString);
    return CryptoJS.HmacSHA256(utf8Data, this.SECRET_KEY).toString();
  }

  /**
   * Verifies a cryptographic signature
   */
  static verifySignature(data: any, signature: string): boolean {
    const expectedSignature = this.signData(data);
    return expectedSignature === signature;
  }

  /**
   * Estimates encrypted payload size for QR code planning
   */
  static estimateEncryptedSize(data: any): number {
    try {
      const encrypted = this.encryptData(data);
      return encrypted.length;
    } catch {
      // Fallback estimation
      const jsonSize = JSON.stringify(data).length;
      return Math.ceil(jsonSize * 1.4); // Rough encryption overhead estimate
    }
  }

  /**
   * Splits large data into chunks for multi-QR code generation
   */
  static chunkDataForQR(data: any, maxChunkSize: number = 2000): Array<{chunk: any, index: number, total: number}> {
    const sanitizedData = this.sanitizeForEncryption(data);
    const jsonString = JSON.stringify(sanitizedData);
    
    // If data is small enough for single QR
    if (jsonString.length <= maxChunkSize) {
      return [{
        chunk: sanitizedData,
        index: 1,
        total: 1
      }];
    }
    
    // Split into chunks
    const chunks = [];
    const chunkCount = Math.ceil(jsonString.length / maxChunkSize);
    
    for (let i = 0; i < chunkCount; i++) {
      const start = i * maxChunkSize;
      const end = Math.min(start + maxChunkSize, jsonString.length);
      const chunkData = jsonString.slice(start, end);
      
      chunks.push({
        chunk: {
          data: chunkData,
          metadata: {
            chunkIndex: i + 1,
            totalChunks: chunkCount,
            originalSize: jsonString.length,
            checksum: CryptoJS.SHA256(jsonString).toString()
          }
        },
        index: i + 1,
        total: chunkCount
      });
    }
    
    return chunks;
  }
}
