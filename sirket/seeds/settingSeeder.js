import mongoose from 'mongoose';
import Setting from '../models/settingModel.js';

const seedData = [
  {
    title: { en: 'FlyGem', ru: '',tr: '',  az: '' },
    slogan: { en: 'Slogan phase!', ru: '', tr: '', az: '' },
    description: { en: 'Fly', ru: '', tr: '', az: '' },
    keywords: { en: 'FlyGem', ru: '', tr: '', az: '' },
    logo: 'mainLogo.png',
    logoPath: '/img/mainLogo.png',
    favicon: 'favicon.ico',
    faviconPath: '/uploads/icons/favicon.ico',
    email: 'support@FlyGem.xxx',
    headerLink: '#',
    siteName: 'FlyGem',
  },
];

const seedDB = async () => {
  await Setting.deleteMany({});
  await Setting.insertMany(seedData);
  console.log('✅ Setting Database seeded successfully.');
};

export default seedDB;
