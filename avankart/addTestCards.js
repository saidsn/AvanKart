import mongoose from "mongoose";
import Cards from "../shared/models/cardModel.js";
import CardsCategory from "../shared/models/cardsCatogoryModel.js";

// Connect to database
const dbname = process.env.DB_NAME || "avankart";
const mongoURI = `mongodb://127.0.0.1:27017/${dbname}`;

async function addTestCards() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");

    // Create a default category ID
    const defaultCategoryId = new mongoose.Types.ObjectId();

    // Test cards data
    const testCardsData = [
      {
        name: "Yemək",
        description: "Yemək xərcləri üçün kart",
        background_color: "#FF5733",
        icon: "restaurant",
        status: "active",
      },
      {
        name: "Yanacaq",
        description: "Yanacaq xərcləri üçün kart",
        background_color: "#33FF57",
        icon: "gas-station",
        status: "active",
      },
      {
        name: "Hədiyyə",
        description: "Hədiyyə kartı",
        background_color: "#3357FF",
        icon: "gift",
        status: "active",
      },
      {
        name: "Nəqliyyat",
        description: "Nəqliyyat xərcləri üçün kart",
        background_color: "#FF33F5",
        icon: "car",
        status: "active",
      },
      {
        name: "Alış-veriş",
        description: "Alış-veriş üçün kart",
        background_color: "#FFA533",
        icon: "shopping",
        status: "active",
      },
      {
        name: "Sağlamlıq",
        description: "Tibbi xərcələr üçün kart",
        background_color: "#FF6B6B",
        icon: "health",
        status: "active",
      },
      {
        name: "Təhsil",
        description: "Təhsil xərcləri üçün kart",
        background_color: "#4ECDC4",
        icon: "education",
        status: "active",
      },
      {
        name: "Əyləncə",
        description: "Əyləncə xərcləri üçün kart",
        background_color: "#45B7D1",
        icon: "entertainment",
        status: "active",
      },
    ];

    // Add cards if they don't exist
    for (const cardData of testCardsData) {
      const existingCard = await Cards.findOne({ name: cardData.name });

      if (!existingCard) {
        const newCard = new Cards({
          ...cardData,
          category: defaultCategoryId,
          creator: new mongoose.Types.ObjectId(),
        });

        await newCard.save();
        console.log(`✅ Created card: ${cardData.name}`);
      } else {
        console.log(`⚠️ Card already exists: ${cardData.name}`);
      }
    }

    // Show all active cards
    const allCards = await Cards.find({ status: "active" }).select("name _id");
    console.log("\n📋 All active cards:");
    allCards.forEach((card) => {
      console.log(`  - ${card.name} (ID: ${card._id})`);
    });

    console.log(`\n🎉 Total active cards: ${allCards.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  }
}

addTestCards();
