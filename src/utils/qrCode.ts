import * as qrCodeGenerator from 'qrcode-generator';

export const createQrCode = (data: string): string => {
  const qrCode = qrCodeGenerator(0, 'L');
  qrCode.addData(data, 'Byte');
  qrCode.make();
  return qrCode.createDataURL(12, 0);
};