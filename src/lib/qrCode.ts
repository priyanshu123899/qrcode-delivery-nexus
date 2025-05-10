
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// Generate a QR code as a data URL
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate a unique QR value based on package details
export const generateQRValue = (packageId: string, customerId: string, deliveryAgentId: string): string => {
  const timestamp = Date.now();
  return `${packageId}|${customerId}|${deliveryAgentId}|${timestamp}`;
};

// Read QR code from a video or canvas element
export const scanQRCodeFromCanvas = (canvas: HTMLCanvasElement): string | null => {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height, {
    inversionAttempts: 'dontInvert',
  });

  return code?.data || null;
};

// Process video frame to canvas for QR scanning
export const processVideoFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement): boolean => {
  if (video.readyState !== video.HAVE_ENOUGH_DATA) return false;

  const context = canvas.getContext('2d');
  if (!context) return false;

  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return true;
};
