// src/components/reports/ExportModal.tsx
// Enhanced modal component with QR functionality temporarily disabled

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFReportService } from '../../services/export/PDFReportService';
import { QRCodeService, QRCodeResult } from '../../services/export/QRCodeService';
import { AssessmentResults, ResponseMap, ChecklistItem } from '../../types/checklist';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AssessmentResults;
  responses: ResponseMap;
  questions: ChecklistItem[];
}

type ExportFormat = 'clinical-pdf' | 'fhir-json' | 'research-csv';

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  results,
  responses,
  questions
}) => {
  const { t } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('clinical-pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // QR Code specific state - DISABLED FOR NOW
  const [qrCodes, setQrCodes] = useState<QRCodeResult[]>([]);
  const [qrExpiration, setQrExpiration] = useState<number>(60);
  const [showNeverExpireWarning, setShowNeverExpireWarning] = useState(false);
  const [neverExpireConsent, setNeverExpireConsent] = useState(false);
  
  // Export options
  const [includeRawData, setIncludeRawData] = useState(true);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [anonymizeResearch, setAnonymizeResearch] = useState(true);

  if (!isOpen) return null;

  const handleExpirationChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue === 0) {
      setShowNeverExpireWarning(true);
      setNeverExpireConsent(false);
    } else {
      setShowNeverExpireWarning(false);
      setNeverExpireConsent(false);
    }
    setQrExpiration(numValue);
  };

  const handleGenerateExport = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    setQrCodes([]);

    try {
      switch (selectedFormat) {
        case 'clinical-pdf':
          await generateClinicalReport();
          break;
        case 'fhir-json':
          await generateFHIRExport();
          break;
        case 'research-csv':
          await generateResearchCSV();
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError(t('export.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateClinicalReport = async () => {
    // QR CODE FUNCTIONALITY TEMPORARILY DISABLED
    // Uncomment the following lines to re-enable QR generation:
    
    // const qrResults = await QRCodeService.generateDownloadableQRCodes(
    //   results,
    //   responses,
    //   questions,
    //   {
    //     includeRawData,
    //     includePersonalInfo,
    //     expirationMinutes: qrExpiration,
    //     format: 'FHIR'
    //   }
    // );
    // setQrCodes(qrResults);

    // const pdfEmbeddableQRs = await QRCodeService.generatePDFEmbeddableQRCodes(
    //   results,
    //   responses,
    //   questions,
    //   {
    //     includeRawData,
    //     includePersonalInfo,
    //     expirationMinutes: qrExpiration
    //   }
    // );

    // Generate PDF without QR codes
    const pdfBlob = await PDFReportService.generateReport(
      results,
      responses,
      questions,
      'en', // language
      {
        includeRawData,
        includeQRCode: false // QR functionality disabled
      }
    );

    // Download the PDF
    PDFReportService.downloadReport(pdfBlob);

    setSuccessMessage('Clinical report generated successfully!');
  };

  const generateFHIRExport = async () => {
    // Use full FHIR payload for JSON export
    const fhirBundle = await QRCodeService.prepareFullFHIRPayload(
      results,
      responses,
      questions
    );

    // Download as JSON file
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'health-assessment-fhir-bundle.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessMessage('FHIR bundle downloaded successfully!');
  };

  const generateResearchCSV = async () => {
    const { CSVExportService } = await import('../../services/export/CSVExportService');
    
    const csvOptions = {
      includePersonalInfo,
      anonymizeSensitiveData: anonymizeResearch,
      includeRiskScores: true,
      includeMetadata: true,
      includeBilingualText: true
    };

    const { csv, summary, filename } = CSVExportService.generateBulkExport(
      results,
      responses,
      questions,
      csvOptions
    );

    // Download the CSV file
    CSVExportService.downloadCSV(csv, filename);

    // Download summary report
    if (summary) {
      const summaryBlob = new Blob([summary], { type: 'text/plain' });
      const summaryUrl = URL.createObjectURL(summaryBlob);
      const summaryLink = document.createElement('a');
      summaryLink.href = summaryUrl;
      summaryLink.download = filename.replace('.csv', '-summary.txt');
      document.body.appendChild(summaryLink);
      summaryLink.click();
      document.body.removeChild(summaryLink);
      URL.revokeObjectURL(summaryUrl);
    }

    setSuccessMessage('Research CSV and summary report downloaded successfully!');
  };

  // QR-related functions preserved but not used
  const handleDownloadQR = (qrResult: QRCodeResult) => {
    QRCodeService.downloadQRCode(qrResult);
  };

  const handleDownloadAllQRs = async () => {
    await QRCodeService.downloadAllQRCodes(qrCodes);
  };

  const handleClose = () => {
    // Cleanup blob URLs
    QRCodeService.cleanupBlobUrls(qrCodes);
    setQrCodes([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('export.title')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t('export.selectFormat')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Clinical Report Option - QR functionality removed from UI */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'clinical-pdf'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFormat('clinical-pdf')}
            >
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                📄 Clinical Report (PDF)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Professional clinical report for healthcare providers
              </div>
            </div>

            {/* FHIR Export Option */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'fhir-json'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFormat('fhir-json')}
            >
              <div className="font-semibold text-green-600 dark:text-green-400">
                🏥 FHIR Bundle (JSON)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Complete clinical documentation with US Core and Gravity SDOH compliance for EHR integration
              </div>
            </div>

            {/* Research CSV Option */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'research-csv'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFormat('research-csv')}
            >
              <div className="font-semibold text-purple-600 dark:text-purple-400">
                📊 Research Data (CSV)
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Complete bilingual dataset for research analysis and statistics
              </div>
            </div>
          </div>
        </div>

        {/* Export Options - QR-related options hidden */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t('export.options')}</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{t('export.includeRawData')}</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includePersonalInfo}
                onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{t('export.includePersonalInfo')}</span>
            </label>

            {selectedFormat === 'research-csv' && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={anonymizeResearch}
                  onChange={(e) => setAnonymizeResearch(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Anonymize sensitive research data</span>
              </label>
            )}

            {/* QR expiration options hidden when QR functionality is disabled
            {selectedFormat === 'clinical-pdf' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('export.qrExpiration')}
                </label>
                <select
                  value={qrExpiration}
                  onChange={(e) => handleExpirationChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="60">1 {t('export.hour')}</option>
                  <option value="1440">24 {t('export.hours')}</option>
                  <option value="10080">7 days</option>
                  <option value="43200">30 days</option>
                  <option value="0">Never expire</option>
                </select>
              </div>
            )}
            */}
          </div>
        </div>

        {/* Never Expire Consent - Hidden when QR disabled
        {showNeverExpireWarning && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Privacy Notice for Never-Expire QR Codes
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              QR codes that never expire contain your health assessment data permanently. 
              If lost or shared inappropriately, this could pose privacy risks. Only select 
              this option if you understand and accept these risks.
            </div>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={neverExpireConsent}
                onChange={(e) => setNeverExpireConsent(e.target.checked)}
                className="mt-1 rounded"
              />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                I understand the privacy implications and consent to generating never-expire QR codes containing my health data.
              </span>
            </label>
          </div>
        )}
        */}

        {/* Generated QR Codes Display - Hidden when QR disabled
        {qrCodes.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{t('export.qrCodes')}</h3>
              {qrCodes.length > 1 && (
                <button
                  onClick={handleDownloadAllQRs}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Download All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.index} className="border border-gray-200 rounded-lg p-4">
                  <img
                    src={qrCode.dataUrl}
                    alt={`QR Code ${qrCode.index}`}
                    className="w-full max-w-[300px] mx-auto"
                  />
                  <div className="text-center mt-2">
                    <div className="font-medium">
                      Assessment Summary QR Code
                    </div>
                    <div className="text-sm text-gray-500">Size: {qrCode.size}</div>
                    <button
                      onClick={() => handleDownloadQR(qrCode)}
                      className="mt-2 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-blue-600 dark:text-blue-400 text-center">
              QR code contains assessment summary with risk scores and key findings. Full clinical data available in FHIR export.
            </div>
          </div>
        )}
        */}

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="text-red-700 dark:text-red-300">❌ {error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="text-green-700 dark:text-green-300">✅ {successMessage}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateExport}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? t('export.generating') : t('export.generate')}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ExportModal };
export default ExportModal;
