import Cards from "../../../shared/models/cardModel.js";

// Test kartları əlavə etmək üçün seeder function
export const seedTestCards = async () => {
  try {
    console.log("🃏 Adding test cards to database...");

    const testCards = [
      {
        name: "Visa",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "MasterCard",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "American Express",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Kapital Bank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "AccessBank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bank of Baku",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Rabitəbank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Unibank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Xalq Bank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "AFB Bank",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Nağd",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PayPal",
        status: "active",
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Əvvəl mövcud kartları yoxla
    const existingCards = await Cards.find({});
    console.log(`📋 Found ${existingCards.length} existing cards in database`);

    // Yalnız mövcud olmayan kartları əlavə et
    const cardsToInsert = [];
    for (const testCard of testCards) {
      const exists = existingCards.find((card) => card.name === testCard.name);
      if (!exists) {
        cardsToInsert.push(testCard);
      } else {
        console.log(`⚠️ Card "${testCard.name}" already exists, skipping...`);
      }
    }

    if (cardsToInsert.length > 0) {
      const insertedCards = await Cards.insertMany(cardsToInsert);
      console.log(`✅ Successfully added ${insertedCards.length} new cards:`);
      insertedCards.forEach((card) => {
        console.log(`   - ${card.name} (ID: ${card._id})`);
      });
    } else {
      console.log("ℹ️ All test cards already exist in database");
    }

    // Bütün aktiv kartları göstər
    const allActiveCards = await Cards.find({
      status: "active",
      deleted: { $ne: true },
    }).select("_id name");

    console.log(
      `\n📋 Total active cards in database: ${allActiveCards.length}`
    );
    allActiveCards.forEach((card) => {
      console.log(`   - ${card.name} (ID: ${card._id})`);
    });

    return {
      success: true,
      totalCards: allActiveCards.length,
      newCardsAdded: cardsToInsert.length,
    };
  } catch (error) {
    console.error("❌ Error seeding test cards:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Standalone çalışdırmaq üçün
export const runCardSeeder = async () => {
  console.log("🚀 Starting card seeder...");
  const result = await seedTestCards();

  if (result.success) {
    console.log("🎉 Card seeding completed successfully!");
    console.log(
      `📊 Summary: ${result.newCardsAdded} new cards added, ${result.totalCards} total active cards`
    );
  } else {
    console.error("💥 Card seeding failed:", result.error);
  }

  return result;
};
