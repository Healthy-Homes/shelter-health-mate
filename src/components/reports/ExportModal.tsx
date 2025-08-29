// src/components/reports/ExportModal.tsx
// Modal component for exporting health assessment data in various formats

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFReportService } from '../../services/export/PDFReportService';
import { FHIRMappingService } from '../../services/export/FHIRMappingService';
import { QRCodeService } from '../../services/export/QRCodeService';
import { 
  AssessmentResults, 
  ResponseMap, 
  ChecklistItem 
} from '../../types/export/fhirTypes';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AssessmentResults;
  responses: ResponseMap;
  questions: ChecklistItem[];
}

type ExportFormat = 'pdf' | 'json' | 'fhir' | 'qr';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  results,
  responses,
  questions
}) => {
  const { t, i18n } = useTranslation();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [qrCodes, setQRCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Export options
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [qrExpiration, setQRExpiration] = useState(60);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setQRCodes([]);
    
    try {
      switch (exportFormat) {
        case 'pdf':
          await handlePDFExport();
          break;
        case 'json':
          await handleJSONExport();
          break;
        case 'fhir':
          await handleFHIRExport();
          break;
        case 'qr':
          await handleQRExport();
          break;
      }
      setExportComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
    
    setIsExporting(false);
  };

  const handlePDFExport = async () => {
    const pdfBlob = await PDFReportService.generateReport(
      results,
      responses,
      questions,
      i18n.language,
      {
        includeRawData,
        includeQRCode: false,
        watermark: 'CONFIDENTIAL'
      }
    );
    
    PDFReportService.downloadReport(
      pdfBlob,
      `health-assessment-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const handleJSONExport = async () => {
    const jsonData = {
      assessment: {
        results,
        responses: includeRawData ? responses : {},
        summary: {
          riskScore: results.risk_score,
          riskLevel: results.risk_level,
          completionRate: Object.keys(responses).length / questions.length,
          priorityInterventions: results.priority_interventions.slice(0, 5)
        }
      },
      metadata: {
        language: i18n.language,
        timestamp: new Date().toISOString(),
        version: '1.0',
        exportFormat: 'json',
        questionCount: questions.length
      }
    };

    downloadJSON(jsonData, 'health-assessment-data.json');
  };

  const handleFHIRExport = async () => {
    const fhirBundle = FHIRMappingService.mapAssessmentToFHIR(
      responses,
      questions,
      results,
      'patient-001',
      i18n.language
    );

    // Validate bundle before export
    const validation = FHIRMappingService.validateBundle(fhirBundle);
    if (!validation.isValid) {
      throw new Error(`FHIR validation failed: ${validation.errors.join(', ')}`);
    }

    const fhirJSON = FHIRMappingService.exportBundleAsJSON(fhirBundle, true);
    downloadJSONString(fhirJSON, 'health-assessment-fhir-bundle.json');
  };

  const handleQRExport = async () => {
    const codes = await QRCodeService.generateReportQR(
      results,
      responses,
      questions,
      {
        includeRawData,
        includePersonalInfo,
        expirationMinutes: qrExpiration
      }
    );
    setQRCodes(codes);
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadJSONString(jsonString, filename);
  };

  const downloadJSONString = (jsonString: string, filename: string) => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setExportFormat('pdf');
    setIsExporting(false);
    setExportComplete(false);
    setQRCodes([]);
    setError(null);
    setIncludeRawData(false);
    setIncludePersonalInfo(false);
    setQRExpiration(60);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('export.title')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Success Message */}
          {exportComplete && !qrCodes.length && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 mr-3">✓</div>
                <div className="text-green-800">
                  {t('export.success')}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 mr-3">⚠</div>
                <div className="text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('export.selectFormat')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Option */}
              <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {exportFormat === 'pdf' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {t('export.formats.pdf')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('export.formats.pdfDesc')}
                    </div>
                  </div>
                </div>
              </label>

              {/* FHIR Option */}
              <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'fhir' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="fhir"
                  checked={exportFormat === 'fhir'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                    exportFormat === 'fhir'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {exportFormat === 'fhir' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {t('export.formats.fhir')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('export.formats.fhirDesc')}
                    </div>
                  </div>
                </div>
              </label>

              {/* JSON Option */}
              <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'json' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                    exportFormat === 'json'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {exportFormat === 'json' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {t('export.formats.json')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('export.formats.jsonDesc')}
                    </div>
                  </div>
                </div>
              </label>

              {/* QR Code Option */}
              <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'qr' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="qr"
                  checked={exportFormat === 'qr'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                    exportFormat === 'qr'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {exportFormat === 'qr' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {t('export.formats.qr')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('export.formats.qrDesc')}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              {t('export.options')}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="mr-3 rounded border-gray-300"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {t('export.includeRawData')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t('export.includeRawDataDesc')}
                  </div>
                </div>
              </label>

              {(exportFormat === 'qr' || exportFormat === 'json') && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includePersonalInfo}
                    onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                    className="mr-3 rounded border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {t('export.includePersonalInfo')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t('export.includePersonalInfoDesc')}
                    </div>
                  </div>
                </label>
              )}

              {exportFormat === 'qr' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {t('export.qrExpiration')}
                  </label>
                  <select
                    value={qrExpiration}
                    onChange={(e) => setQRExpiration(parseInt(e.target.value))}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 {t('export.minutes')}</option>
                    <option value={60}>1 {t('export.hour')}</option>
                    <option value={240}>4 {t('export.hours')}</option>
                    <option value={1440}>24 {t('export.hours')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          {qrCodes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('export.qrCodes')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {qrCodes.map((qr, index) => (
                  <div key={index} className="text-center">
                    <img 
                      src={qr} 
                      alt={`QR Code ${index + 1}`} 
                      className="mx-auto mb-2 border rounded"
                    />
                    <p className="text-sm text-gray-600">
                      {t('export.qrPart', { current: index + 1, total: qrCodes.length })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {t('export.qrInstructions')}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isExporting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('export.generating')}
                </div>
              ) : (
                t('export.generate')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
