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

// ✅ Gelişmiş IP alma fonksiyonu - tutarlılık için gerçek kullanıcı IP'sini öncelemek
export const getRawIp = (req) => {
  // Öncelikle güvenilir proxy header'larını kontrol et
  const forwarded = req.get("x-forwarded-for");
  const realIp = req.get("x-real-ip");
  const cfConnectingIp = req.get("cf-connecting-ip"); // Cloudflare

  // ✅ TUTARLILIK İÇİN: Eğer cf-connecting-ip varsa, hep onu kullan
  // Yoksa x-forwarded-for'un ilk IP'sini (gerçek kullanıcı IP'si)
  let ip;

  if (cfConnectingIp) {
    ip = cfConnectingIp;
  } else if (forwarded) {
    // x-forwarded-for'da ilk IP gerçek kullanıcı IP'si
    ip = forwarded.split(",")[0].trim();
  } else {
    // Fallback: x-real-ip > req.ip > connection
    ip = realIp || req.ip || req.connection?.remoteAddress || "localhost";
  }

  // console.log("🔍 IP sources:", {
  //   'cf-connecting-ip': cfConnectingIp,
  //   'x-real-ip': realIp,
  //   'x-forwarded-for': forwarded,
  //   'req.ip': req.ip,
  //   'connection': req.connection?.remoteAddress,
  //   'selected': ip,
  //   'strategy': cfConnectingIp ? 'cf-connecting-ip' : forwarded ? 'x-forwarded-for-first' : 'fallback'
  // });

  return ip;
};

// ✅ Gelişmiş IP normalizasyon fonksiyonu
export const normalizeIp = (ip) => {
  // console.log("🔍 normalizeIp called with:", ip);
  if (!ip) {
    // console.log("🔍 normalizeIp result: 127.0.0.1 (empty ip)");
    return "127.0.0.1";
  }

  // localhost ve ::1 (IPv6 localhost) durumlarını handle et
  if (ip === "::1" || ip === "localhost" || ip === "::ffff:127.0.0.1") {
    // console.log("🔍 normalizeIp result: 127.0.0.1 (localhost variants)");
    return "127.0.0.1";
  }

  // IPv6 mapped IPv4 durumlarını temizle (örn: ::ffff:192.168.1.1)
  if (ip.includes("::ffff:")) {
    const result = ip.replace("::ffff:", "");
    // console.log("🔍 normalizeIp result:", result, "(IPv6 mapped removed)");
    return result;
  }

  // Pure IPv6 localhost
  if (ip === "::1") {
    // console.log("🔍 normalizeIp result: 127.0.0.1 (IPv6 localhost)");
    return "127.0.0.1";
  }

  // console.log("🔍 normalizeIp result:", ip, "(unchanged)");
  return ip;
};

// ✅ Fingerprint oluşturma - gelişmiş IP kaynağı kullanır
export function generateFingerprint(req) {
  const rawIp = getRawIp(req);
  const ip = normalizeIp(rawIp);
  const ua = req.headers["user-agent"] || "Unknown";
  // console.log("🔍 generateFingerprint - Raw IP:", rawIp, "-> Normalized:", ip);
  return `${ip}-${ua}`;
}

// ✅ Geriye uyumluluk için - aynı fonksiyonu işaret ediyor
export const getFingerprintFromRequest = generateFingerprint;

// ✅ Device bilgilerini normalize ederek çıkar
export function extractDeviceInfo(req) {
  const rawIp = getRawIp(req); // ✅ Gelişmiş IP kaynağı
  const userAgent = req.headers["user-agent"] || "Unknown";
  const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
  const deviceOs =
    deviceOsRaw.startsWith('"') && deviceOsRaw.endsWith('"')
      ? deviceOsRaw.slice(1, -1)
      : deviceOsRaw;

  // console.log("🔍 extractDeviceInfo - Raw IP:", rawIp);
  const normalizedIp = normalizeIp(rawIp);
  // console.log("🔍 extractDeviceInfo - Normalized IP:", normalizedIp);

  return {
    ip: normalizedIp, // ✅ IP normalize ediliyor
    userAgent,
    deviceOs,
  };
}

// ✅ Gelişmiş fingerprint karşılaştırma fonksiyonu
export function compareFingerprints(storedFingerprint, currentFingerprint) {
  if (!storedFingerprint || !currentFingerprint) {
    // console.log("🔍 compareFingerprints - One of fingerprints is empty");
    return false;
  }

  const storedParts = storedFingerprint.split("-");
  const currentParts = currentFingerprint.split("-");

  if (storedParts.length < 2 || currentParts.length < 2) {
    // console.log("🔍 compareFingerprints - Invalid fingerprint format");
    return false;
  }

  const [storedIp, ...storedUaParts] = storedParts;
  const [currentIp, ...currentUaParts] = currentParts;

  // User Agent'ları yeniden birleştir (- karakteri içerebilir)
  const storedUa = storedUaParts.join("-");
  const currentUa = currentUaParts.join("-");

  // IP normalizasyonu yaparak karşılaştır
  const normalizedStoredIp = normalizeIp(storedIp);
  const normalizedCurrentIp = normalizeIp(currentIp);

  const ipMatch = normalizedStoredIp === normalizedCurrentIp;
  const uaMatch = storedUa === currentUa;

  // console.log("🔍 compareFingerprints:", {
  //   storedIp,
  //   currentIp,
  //   normalizedStoredIp,
  //   normalizedCurrentIp,
  //   ipMatch,
  //   uaMatch,
  //   result: ipMatch && uaMatch
  // });

  return ipMatch && uaMatch;
}
