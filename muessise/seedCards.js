import mongoose from "mongoose";
import Card from "./models/cardModel.js";
import connectDB from "../shared/utils/db.js";

const testCards = [
  {
    name: "Yanacaq kartı",
    description: "Yanacaq doldurma üçün istifadə olunan kart",
    color: "#4FC3F7",
    backgroundColor: "#E3F2FD",
    icon: "iconex-fuel-1",
    category: "yanacaq",
  },
  {
    name: "Hədiyyə kartı",
    description: "Hədiyyə və alış-veriş üçün universal kart",
    color: "#66BB6A",
    backgroundColor: "#E8F5E8",
    icon: "iconex-gift-1",
    category: "hediyye",
  },
  {
    name: "Biznes kartı",
    description: "Biznes əməliyyatları və korporativ xərclər üçün kart",
    color: "#7450864D",
    backgroundColor: "#F3E5F5",
    icon: "iconex-briefcase-1",
    category: "biznes",
  },
  {
    name: "Ödəniş kartı",
    description: "Kommunal ödənişlər və digər xidmətlər üçün kart",
    color: "#FF7043",
    backgroundColor: "#FFF3E0",
    icon: "iconex-credit-card-1",
    category: "odenish",
  },
  {
    name: "Car wash kartı",
    description: "Avtomobil yuma xidmətləri üçün kart",
    color: "#29B6F6",
    backgroundColor: "#E1F5FE",
    icon: "iconex-car-wash-1",
    category: "other",
  },
  {
    name: "Restoran kartı",
    description: "Restoranlar və kafe xidmətləri üçün kart",
    color: "#AB47BC",
    backgroundColor: "#F3E5F5",
    icon: "iconex-restaurant-1",
    category: "other",
  },
  {
    name: "Market kartı",
    description: "Ərzaq və məişət malları alışı üçün kart",
    color: "#FF5722",
    backgroundColor: "#FFEBE3",
    icon: "iconex-shopping-cart-1",
    category: "other",
  },
  {
    name: "Taksi kartı",
    description: "Taksi və nəqliyyat xidmətləri üçün kart",
    color: "#FFC107",
    backgroundColor: "#FFF8E1",
    icon: "iconex-taxi-1",
    category: "other",
  },
];

const seedCards = async () => {
  try {
    await connectDB();

    // Clear existing cards
    await Card.deleteMany({});
    console.log("🗑️ Existing cards cleared");

    // Insert test cards
    const insertedCards = await Card.insertMany(testCards);
    console.log(`✅ ${insertedCards.length} test cards inserted successfully`);

    console.log(
      "📋 Inserted cards:",
      insertedCards.map((card) => ({
        name: card.name,
        category: card.category,
        color: card.color,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding cards:", error);
    process.exit(1);
  }
};

seedCards();
