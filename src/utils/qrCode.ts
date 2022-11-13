import * as qrCodeGenerator from 'qrcode-generator';
import qrScanner from 'qr-scanner';

export const createQrCode = (data: string): string => {
  const qrCode = qrCodeGenerator(0, 'L');
  qrCode.addData(data, 'Byte');
  qrCode.make();
  return qrCode.createDataURL(32, 0);
};

export const scanQrCode = (imageUrl: string) => qrScanner.scanImage(imageUrl, {
  returnDetailedScanResult: true,
});