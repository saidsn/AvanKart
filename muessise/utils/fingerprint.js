
/**
 * Normalizes IP addresses for consistent handling
 * @param {string} ip - Raw IP address from request
 * @returns {string} - Normalized IP address
 */
export function normalizeIP(ip) {
    if (!ip || typeof ip !== 'string') return 'unknown';

    if (ip.startsWith('::ffff:')) ip = ip.substring(7);

    // Normalize localhost variants
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return 'localhost';

    // Handle proxy headers if multiple IPs
    if (ip.includes(',')) return ip.split(',')[0].trim();

    return ip;
}

/**
 * Generates a consistent fingerprint
 * @param {Object} req - Express request object
 * @returns {string} - Fingerprint string
 */
export function generateFingerprint(req) {
    const ip = normalizeIP(req.ip || req.connection?.remoteAddress);
    const userAgent = req.headers["user-agent"] || "Unknown";
    const clientFingerprint = req.headers["x-client-fingerprint"];

    // Priority: Use client-provided fingerprint if valid
    if (clientFingerprint && clientFingerprint.trim() && clientFingerprint !== 'undefined') {
        return clientFingerprint.trim();
    }

    // Otherwise generate server-side fingerprint
    return `${ip}-${userAgent}`;
}

/**
 * Validates if two fingerprints match
 * @param {string} stored - Stored fingerprint
 * @param {string} current - Current request fingerprint
 * @returns {boolean}
 */
export function validateFingerprint(stored, current) {
    if (!stored || !current) return false;

    // Treat localhost (::1) and 'localhost' as equal
    const normalize = (fp) => fp.replace(/^::1-/, 'localhost-');
    return normalize(stored) === normalize(current);
}

/**
 * Extract device info from request
 * @param {Object} req - Express request object
 * @returns {Object}
 */
export function extractDeviceInfo(req) {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const deviceOs = (req.headers["sec-ch-ua-platform"] || "Unknown").replace(/"/g, '');
    const ip = normalizeIP(req.ip || req.connection?.remoteAddress);

    return {
        userAgent,
        deviceOs,
        ip,
        fingerprint: generateFingerprint(req)
    };
}
