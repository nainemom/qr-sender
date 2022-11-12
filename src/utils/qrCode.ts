import * as qrCodeGenerator from 'qrcode-generator';
import jsQR from 'jsqr';

export const createQrCode = (data: string): string => {
  const qrCode = qrCodeGenerator(0, 'L');
  qrCode.addData(data, 'Byte');
  qrCode.make();
  return qrCode.createDataURL(12, 0);
};

export const scanQrCode = (image: ImageData): string | null => {
  const code = jsQR(image.data, image.width, image.height, {
    inversionAttempts: 'dontInvert',
  });
  return code?.data || null;
}