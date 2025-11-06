export const getFingerprintFromHeaders = (headers) => {
  return headers['x-fingerprint'] || headers['X-Fingerprint'] || '';
};