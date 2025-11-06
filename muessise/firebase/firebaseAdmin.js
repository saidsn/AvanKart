import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(
  __dirname,
  "../avasystem-notifications-firebase-adminsdk-fbsvc-e3747e1451.json"
);

// JSON faylı mövcuddursa initialize et
if (!admin.apps.length && fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
