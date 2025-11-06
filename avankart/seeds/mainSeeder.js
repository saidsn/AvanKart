import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import argon2 from 'argon2';

const hashedPassword = await argon2.hash('Capslock999!');
let superAdminRole = await Role.findOne({ name: 'superadmin' });
let adminRole = await Role.findOne({ name: 'admin' });
let moderRole = await Role.findOne({ name: 'moder' });

const seedData = [
  {
    username: 'bor',
    email: 'bor',
    role: superAdminRole._id,
    password: hashedPassword,
  },
  {
    username: 'admin',
    email: 'admin',
    role: adminRole._id,
    password: hashedPassword,
  },
  {
    username: 'moder',
    email: 'moder@unsu.com',
    role: moderRole._id,
    password: hashedPassword,
  }
];

// Seed fonksiyonu
const seedDB = async () => {
  await User.deleteMany({});
  await User.insertMany(seedData);
  console.log('✅ User Database seeded successfully.');
};

export default seedDB;
