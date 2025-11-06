import mongoose from 'mongoose';
import Permission from '../models/permissionModel.js';

const seedData = [
  { name: 'dashboard' },
  { name: 'add' },
  { name: 'logs' },
  { name: 'settings' }
];

// Seed fonksiyonu
const seedDB = async () => {
  await Permission.deleteMany({});
  await Permission.insertMany(seedData);
  console.log('✅ Permission Database seeded successfully.');
};

export default seedDB;
