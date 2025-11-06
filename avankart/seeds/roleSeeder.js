import mongoose from 'mongoose';
import Role from '../models/roleModel.js';

const seedData = [
  { name: 'superadmin', permissions: [] },
  { name: 'admin', permissions: [] },
  { name: 'moder', permissions: [] },
  { name: 'user', permissions: [] }
];

// Seed fonksiyonu
const seedDB = async () => {
  await Role.deleteMany({});
  await Role.insertMany(seedData);
  console.log('✅ Permission Database seeded successfully.');
};

export default seedDB;
