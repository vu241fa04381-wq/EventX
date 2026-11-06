const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a unique cryptographically secure QR token
 */
const generateSecureToken = (prefix = 'EVTX') => {
  const randomHex = crypto.randomBytes(8).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${randomHex}`;
};

/**
 * Generate QR code as a base64 Data URL
 */
const generateQRDataUrl = async (payload) => {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('[QRService] Error generating QR code:', err);
    throw err;
  }
};

module.exports = {
  generateSecureToken,
  generateQRDataUrl,
};
