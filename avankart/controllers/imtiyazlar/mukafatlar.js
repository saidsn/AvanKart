import mongoose from "mongoose";
import CardsCategory from "../../../shared/models/cardsCategoryModel.js";
import Cards from "../../../shared/models/cardModel.js";
import Mukafat from "../../../shared/models/mukafatModal.js";

export const getMukafatKartlar = async (req, res) => {
  try {
    const categories = await CardsCategory.find().select("name _id").lean();

    // load cards and compute mukafat counts per card
    const cards = await Cards.find()
      .select("name icon background_color")
      .lean();
    const cardsWithCounts = await Promise.all(
      cards.map(async (c) => {
        const count = await Mukafat.countDocuments({ forCard: c._id });
        return { ...c, mukafat_count: count };
      })
    );

    return res.render("pages/imtiyazlar/mukafatlar/mukafatlar", {
      error: "",
      csrfToken: req.csrfToken(),
      cards: cardsWithCounts,
    });
  } catch (error) {
    console.error("Kart kategorileri alınırken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

export const getMukafatlar = async (req, res) => {
  try {
    const categories = await CardsCategory.find().select("name _id").lean();

    // Render the card-details view which contains the rewards table and JS
    const cardId = req.params.cardId || req.params.mukafatid || null;
    return res.render("pages/imtiyazlar/mukafatlar/mukafatlarDetails", {
      error: "",
      csrfToken: req.csrfToken(),
      cardId,
    });
  } catch (error) {
    console.error("Kart kategorileri alınırken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};
