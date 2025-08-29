// src/services/security/EncryptionService.ts
// Security service for encrypting health assessment data

import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

export class EncryptionService {
  // In production, this should be an environment variable
  private static readonly SECRET_KEY = 'health-assessment-2025-key';
  private static readonly SALT = 'shelter-health-salt';

  /**
   * Encrypts and compresses data for secure storage/transmission
   */
  static encryptData(data: any): string {
    try {
      // Convert to JSON string
      const jsonString = JSON.stringify(data);
      
      // Compress the data to reduce size
      const compressed = LZString.compress(jsonString);
      
      if (!compressed) {
        throw new Error('Data compression failed');
      }
      
      // Encrypt the compressed data
      const encrypted = CryptoJS.AES.encrypt(compressed, this.SECRET_KEY).toString();
      
      // Add timestamp and hash for integrity check
      const payload = {
        data: encrypted,
        timestamp: Date.now(),
        hash: CryptoJS.SHA256(compressed).toString()
      };
      
      return btoa(JSON.stringify(payload));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts and decompresses data
   */
  static decryptData(encryptedPayload: string): any {
    try {
      // Decode base64
      const payload = JSON.parse(atob(encryptedPayload));
      
      // Check if data is too old (24 hours default)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - payload.timestamp > maxAge) {
        throw new Error('Data has expired');
      }
      
      // Decrypt the data
      const decryptedBytes = CryptoJS.AES.decrypt(payload.data, this.SECRET_KEY);
      const compressed = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!compressed) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      // Verify integrity
      const expectedHash = CryptoJS.SHA256(compressed).toString();
      if (expectedHash !== payload.hash) {
        throw new Error('Data integrity check failed');
      }
      
      // Decompress the data
      const jsonString = LZString.decompress(compressed);
      
      if (!jsonString) {
        throw new Error('Data decompression failed');
      }
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generates a secure access token with expiration
   */
  static generateAccessToken(expirationMinutes: number = 60): string {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    const randomValue = Math.random().toString(36).substring(2);
    
    const tokenData = {
      exp: expirationTime,
      rand: randomValue,
      salt: this.SALT
    };
    
    return this.encryptData(tokenData);
  }

  /**
   * Validates an access token
   */
  static validateAccessToken(token: string): boolean {
    try {
      const tokenData = this.decryptData(token);
      
      // Check expiration
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
    return CryptoJS.SHA256(sensitiveValue + this.SALT).toString().substring(0, 16);
  }

  /**
   * Generates a secure random ID
   */
  static generateSecureId(prefix: string = 'assessment'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const hash = CryptoJS.SHA256(timestamp + random + this.SALT).toString().substring(0, 8);
    
    return `${prefix}-${timestamp}-${hash}`;
  }

  /**
   * Sanitizes data for export by removing or anonymizing sensitive fields
   */
  static sanitizeForExport(data: any, options: {
    anonymizeIds?: boolean;
    removeTimestamps?: boolean;
    removeSensitiveResponses?: boolean;
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
      const sensitivePatterns = ['income', 'financial', 'abuse', 'violence'];
      
      Object.keys(sanitized.responses).forEach(questionId => {
        const question = data.questions?.find((q: any) => q.item_id === questionId);
        if (question) {
          const questionText = question.question_text.toLowerCase();
          if (sensitivePatterns.some(pattern => questionText.includes(pattern))) {
            delete sanitized.responses[questionId];
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
    return CryptoJS.HmacSHA256(dataString, this.SECRET_KEY).toString();
  }

  /**
   * Verifies a cryptographic signature
   */
  static verifySignature(data: any, signature: string): boolean {
    const expectedSignature = this.signData(data);
    return expectedSignature === signature;
  }
}
