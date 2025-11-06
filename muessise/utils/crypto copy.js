import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export const encrypt = (data) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    const IV_LENGTH = 16;
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(SECRET_KEY, "hex"),
        iv
    );

    const jsonData = typeof data === "string" ? data : JSON.stringify(data);

    let encrypted = cipher.update(jsonData, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
};

export const decrypt = (encryptedData) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    const parts = encryptedData.split(":");

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(SECRET_KEY, "hex"),
        iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
};

export const createSessionId = () => uuidv4();

function getRawIp(req) {
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'localhost';
}

export const normalizeIp = (ip) => {
    console.log("🔍 normalizeIp called with:", ip);
    if (!ip) {
        console.log("🔍 normalizeIp result: 127.0.0.1 (empty ip)");
        return '127.0.0.1';
    }
    if (ip === '::1' || ip === 'localhost') {
        console.log("🔍 normalizeIp result: 127.0.0.1 (localhost/::1)");
        return '127.0.0.1';
    }
    if (ip.includes(':') && ip.includes('.')) {
        const result = ip.split(':').pop();
        console.log("🔍 normalizeIp result:", result, "(IPv6 mapped)");
        return result;
    }
    console.log("🔍 normalizeIp result:", ip, "(unchanged)");
    return ip;
}

export function generateFingerprint(req) {
    const rawIp = getRawIp(req);
    const ip = normalizeIp(rawIp);
    const ua = req.headers['user-agent'] || 'Unknown';
    console.log("🔍 generateFingerprint - Raw IP:", rawIp, "-> Normalized:", ip);
    return `${ip}-${ua}`;
}

export const getFingerprintFromRequest = generateFingerprint;

export function extractDeviceInfo(req) {
    const rawIp = getRawIp(req);
    const userAgent = req.headers["user-agent"] || "Unknown";
    const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
    const deviceOs = deviceOsRaw.startsWith('"') && deviceOsRaw.endsWith('"')
        ? deviceOsRaw.slice(1, -1)
        : deviceOsRaw;

    console.log("🔍 extractDeviceInfo - Raw IP:", rawIp);
    const normalizedIp = normalizeIp(rawIp);
    console.log("🔍 extractDeviceInfo - Normalized IP:", normalizedIp);

    return {
        ip: normalizedIp,
        userAgent,
        deviceOs
    };
}

export function compareFingerprints(storedFingerprint, currentFingerprint) {
    const [storedIp, storedUa] = storedFingerprint.split('-');
    const [currentIp, currentUa] = currentFingerprint.split('-');

    const normalizedStoredIp = normalizeIp(storedIp);
    const normalizedCurrentIp = normalizeIp(currentIp);

    return normalizedStoredIp === normalizedCurrentIp && storedUa === currentUa;
}