import mongoose from 'mongoose';
import Social from '../models/socialModel.js';

const seedData = [
  {
    name: 'facebook',
    icon: 'ri:facebook-line',
    link: {
      'en': '#',
      'ru': '#',
      'tr': '#',
      'az': '#'
    },
    lang: {
      'en': true,
      'ru': true,
      'tr': true,
      'az': true
    }
  },
  {
    name: 'twitter',
    icon: 'ri:twitter-line',
    link: {
      'en': '#',
      'ru': '#',
      'tr': '#',
      'az': '#'
    },
    lang: {
      'en': true,
      'ru': true,
      'tr': true,
      'az': true
    }
  },
  {
    name: 'instagram',
    icon: 'ri:instagram-line',
    link: {
      'en': '#',
      'ru': '#',
      'tr': '#',
      'az': '#'
    },
    lang: {
      'en': true,
      'ru': true,
      'tr': true,
      'az': true
    }
  },
  {
    name: 'linkedIn',
    icon: 'ri:linkedin-line',
    link: {
      'en': '#',
      'ru': '#',
      'tr': '#',
      'az': '#'
    },
    lang: {
      'en': true,
      'ru': true,
      'tr': true,
      'az': true
    }
  }
];

const seedDB = async () => {
  await Social.deleteMany({});
  await Social.insertMany(seedData);
  console.log('✅ Social Database seeded successfully.');
};

export default seedDB;
