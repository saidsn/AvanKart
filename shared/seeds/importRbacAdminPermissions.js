// Simple import script for rbacAdminPermission seed JSON
// Usage (PowerShell from project root):
// node ./shared/seeds/importRbacAdminPermissions.js

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/rbacAdminPermission.model.js';
import RbacAdminPermission from '../models/rbacAdminPermission.model.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/avankart';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('[rbacAdminPermission import] Connected');

    const filePath = path.resolve(process.cwd(), 'shared', 'seeds', 'rbacAdminPermissions.seed.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const docs = JSON.parse(raw);

    for (const doc of docs) {
      const existing = await RbacAdminPermission.findOne({ name: doc.name });
      if (existing) {
        console.log(` - Skip (exists): ${doc.name}`);
        continue;
      }
      await RbacAdminPermission.create(doc);
      console.log(` + Inserted: ${doc.name}`);
    }

    const count = await RbacAdminPermission.countDocuments();
    console.log(`Total groups now: ${count}`);
  } catch (e) {
    console.error('Import error:', e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
