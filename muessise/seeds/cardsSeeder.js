import Cards from '../../shared/models/cardModel.js';
import CardsCategory from '../../shared/models/cardsCatogoryModel.js';
import Muessise from '../../shared/models/muessiseModel.js';
import mongoose from 'mongoose';

const seedCards = async () => {
  try {
    console.log('🎯 Cards seed başladı...');

    // İlk öncə mövcud kateqoriyaları yoxlayaq
    let category = await CardsCategory.findOne({});

    // Əgər kateqoriya yoxdursa, yaradaq
    if (!category) {
      category = new CardsCategory({
        name: 'Əsas Kateqoriya',
        status: 'active',
        creator: new mongoose.Types.ObjectId()
      });
      await category.save();
      console.log('✅ Yeni kateqoriya yaradıldı');
    }

    // Test kartları yaradaq
    const testCards = [
      { name: 'Yemək', description: 'Yemək xərcləri üçün kart', background_color: '#FF5733', icon: 'restaurant' },
      { name: 'Yanacaq', description: 'Yanacaq xərcləri üçün kart', background_color: '#33FF57', icon: 'gas-station' },
      { name: 'Hədiyyə', description: 'Hədiyyə kartı', background_color: '#3357FF', icon: 'gift' },
      { name: 'Nəqliyyat', description: 'Nəqliyyat xərcləri üçün kart', background_color: '#FF33F5', icon: 'car' },
      { name: 'Alış-veriş', description: 'Alış-veriş üçün kart', background_color: '#FFA533', icon: 'shopping' }
    ];

    const createdCards = [];

    for (const cardData of testCards) {
      let existingCard = await Cards.findOne({ name: cardData.name });

      if (!existingCard) {
        const card = new Cards({
          ...cardData,
          category: category._id,
          status: 'active',
          creator: new mongoose.Types.ObjectId()
        });
        await card.save();
        console.log(`✅ Kart yaradıldı: ${cardData.name}`);
        createdCards.push(card);
      } else {
        console.log(`⚠️ Kart artıq mövcuddur: ${cardData.name}`);
        createdCards.push(existingCard);
      }
    }

    // Mövcud müəssisələri tap və kartları əlavə et
    const muessiseler = await Muessise.find({});
    console.log(`📊 Mövcud müəssisələr: ${muessiseler.length}`);

    if (muessiseler.length > 0) {
      const allCards = await Cards.find({ status: 'active' });
      console.log(`📊 Aktiv kartlar: ${allCards.length}`);

      for (const muessise of muessiseler) {
        if (!muessise.cards || muessise.cards.length === 0) {
          muessise.cards = allCards.map(card => card._id);
          await muessise.save();
          console.log(`✅ Müəssisəyə ${allCards.length} kart əlavə edildi: ${muessise.business_name || muessise.name || 'Ad yoxdur'}`);
        } else {
          console.log(`⚠️ Müəssisədə artıq kartlar var: ${muessise.business_name || muessise.name || 'Ad yoxdur'} (${muessise.cards.length} kart)`);
        }
      }
    } else {
      console.log('⚠️ Heç bir müəssisə tapılmadı');
    }

    console.log('🎉 Cards seed tamamlandı');

  } catch (error) {
    console.error('❌ Cards seed xətası:', error);
    throw error;
  }
};

export default seedCards;
