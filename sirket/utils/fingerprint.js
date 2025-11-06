// /**
// * Normalizes IP addresses for consistent handling
// * @param {string} ip - Raw IP address from request
// * @returns {string} - Normalized IP address
// */
// export function normalizeIP(ip) {
//     if (!ip || typeof ip !== 'string') {
//         console.log('🌐 normalizeIP: Invalid IP provided:', ip);
//         return 'unknown';
//     }

//     // Remove IPv6 prefix for IPv4-mapped addresses
//     if (ip.startsWith('::ffff:')) {
//         ip = ip.substring(7);
//         console.log('🌐 normalizeIP: Removed IPv6 prefix, result:', ip);
//     }

//     // Normalize localhost variations
//     if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
//         console.log('🌐 normalizeIP: Normalized localhost variant:', ip);
//         return 'localhost';
//     }

//     // Handle proxy headers (if trust proxy is configured)
//     if (ip.includes(',')) {
//         const firstIP = ip.split(',')[0].trim();
//         console.log('🌐 normalizeIP: Multiple IPs detected, using first:', firstIP);
//         return firstIP;
//     }

//     console.log('🌐 normalizeIP: Final normalized IP:', ip);
//     return ip;
// };

// /**
//  * Generates a consistent fingerprint for session validation
//  * @param {Object} req - Express request object
//  * @returns {string} - Consistent fingerprint string
//  */

// export function generateFingerprint(req) {
//     console.log('👆 === GENERATING FINGERPRINT ===');
//     const ip = normalizeIP(req.ip || req.connection.remoteAddress);
//     const userAgent = req.headers["user-agent"] || "Unknown";
//     const clientFingerprint = req.headers["x-client-fingerprint"];

//     console.log('👆 Raw IP:', req.ip);
//     console.log('👆 Normalized IP:', ip);
//     console.log('👆 User Agent:', userAgent);
//     console.log('👆 Client Fingerprint Header:', clientFingerprint);

//     // Priority 1: Use client-provided fingerprint if available and valid
//     if (clientFingerprint && clientFingerprint.trim() !== '' && clientFingerprint !== 'undefined') {
//         const cleanFingerprint = clientFingerprint.trim();
//         console.log('👆 Using client fingerprint:', cleanFingerprint);
//         return cleanFingerprint;
//     }

//     // Priority 2: Generate server-side fingerprint
//     const serverFingerprint = `${ip}-${userAgent}`;
//     console.log('👆 Generated server fingerprint:', serverFingerprint);

//     return serverFingerprint;
// };

// /**
//  * Legacy function for compatibility - redirects to generateFingerprint
//  * @param {Object} req - Express request object
//  * @returns {string} - Fingerprint string
//  */
// export function getFingerprintFromRequest(req) {
//     console.log('👆 Legacy getFingerprintFromRequest called - redirecting to generateFingerprint');
//     return generateFingerprint(req);
// }

// /**
//  * Validates if two fingerprints match
//  * @param {string} stored - Stored fingerprint
//  * @param {string} current - Current request fingerprint
//  * @returns {boolean} - Whether fingerprints match
//  */
// export function validateFingerprint(stored, current) {
//     console.log('👆 === VALIDATING FINGERPRINT ===');
//     console.log('👆 Stored fingerprint:', stored);
//     console.log('👆 Current fingerprint:', current);

//     if (!stored || !current) {
//         console.log('👆 ❌ Missing fingerprint data');
//         return false;
//     }

//     const match = stored === current;
//     console.log('👆 Fingerprints match:', match);

//     return match;
// }

// /**
//  * Clean quotes from header values (mainly for device OS)
//  * @param {string} str - String with potential quotes
//  * @returns {string} - Clean string
//  */
// export function cleanQuotes(str = '') {
//     if (typeof str !== 'string') {
//         return 'Unknown';
//     }

//     if (str.startsWith('"') && str.endsWith('"')) {
//         return str.slice(1, -1);
//     }

//     return str;
// }

// /**
//  * Extract device information from request headers
//  * @param {Object} req - Express request object
//  * @returns {Object} - Device information
//  */

// export function extractDeviceInfo(req) {
//     const userAgent = req.headers["user-agent"] || "Unknown";
//     const rawDeviceOs = req.headers["sec-ch-ua-platform"] || "Unknown";
//     const deviceOs = cleanQuotes(rawDeviceOs);
//     const ip = normalizeIP(req.ip);

//     console.log('📱 === EXTRACTING DEVICE INFO ===');
//     console.log('📱 User Agent:', userAgent);
//     console.log('📱 Raw Device OS:', rawDeviceOs);
//     console.log('📱 Clean Device OS:', deviceOs);
//     console.log('📱 IP:', ip);

//     return {
//         userAgent,
//         deviceOs,
//         ip,
//         fingerprint: generateFingerprint(req)
//     };
// }

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
