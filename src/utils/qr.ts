import QRCode from 'qrcode';

export async function generateQRDataUrl(text: string, size = 256): Promise<string> {
  // Use medium error correction to balance capacity and resiliency
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    width: size,
    margin: 1,
    type: 'image/png',
    color: { dark: '#000000', light: '#ffffff' },
  });
}
