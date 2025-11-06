import mongoose from 'mongoose';
import connectDB from './utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.join(__dirname, 'seeds');
const seedFiles = fs.readdirSync(seedDir);

const [, , seedArg] = process.argv;
const seedFileName = seedArg ? `${seedArg}.js` : null;

const runSeeds = async () => {
  await connectDB();
  if (seedFileName) {
    const seedFilePath = path.join(seedDir, seedFileName);
    if (!fs.existsSync(seedFilePath)) {
      console.error(`❌ Error: ${seedFileName} not found.`);
      mongoose.connection.close();
      process.exit(1);
    }

    console.log(`🚀 ${seedFileName} running...`);
    const { default: seed } = await import(`./seeds/${seedFileName}`);
    await seed();
  } else {
    // Tüm seed dosyalarını çalıştır
    for (const file of seedFiles) {
      console.log(`🚀 ${file} running...`);
      const { default: seed } = await import(`./seeds/${file}`);
      await seed();
    }
  }
  mongoose.connection.close();
};

runSeeds().catch(err => {
  console.error('Error seeding the database:', err);
  mongoose.connection.close();
});
