import Mukafat from "../../../shared/models/mukafatModal.js";
import UserMukafat from "../../../shared/models/userMukafat.js";
import Cards from "../../../shared/models/cardModel.js";

export const listMukafatlar = async (req, res) => {
  try {
    // Basic list with optional search
    const search =
      req.body && req.body.search ? req.body.search : req.query.search || "";
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    const data = await Mukafat.find(filter)
      .populate({ path: "forCard", select: "icon" })
      .lean();
    // compute winners_count per mukafat (count of UserMukafat)
    const results = await Promise.all(
      data.map(async (m) => {
        const count = await Mukafat.find({ forCard: m._id }).countDocuments();
        const iconName = m.forCard && m.forCard.icon ? m.forCard.icon : null;
        const icon_url = iconName
          ? `https://api.avankart.com/v1/icon/${iconName}`
          : m.image_path || m.image_name || null;
        return { ...m, winners_count: count, icon_url };
      })
    );
    return res.json({
      data: results,
      recordsTotal: results.length,
      recordsFiltered: results.length,
    });
  } catch (err) {
    console.error(err);
    // If it's a Mongoose validation error, return 400 with details to help the client
    if (err && err.name === "ValidationError") {
      const errors = Object.keys(err.errors || {}).reduce((acc, k) => {
        acc[k] = err.errors[k].message || err.errors[k].kind || err.errors[k];
        return acc;
      }, {});
      return res
        .status(400)
        .json({ success: false, message: err.message, errors });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMukafat = async (req, res) => {
  try {
    const id = req.params.id || req.params.mukafatid;
    const item = await Mukafat.findById(id)
      .populate({ path: "forCard", select: "icon" })
      .lean();
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });
    const iconName =
      item.forCard && item.forCard.icon ? item.forCard.icon : null;
    item.icon_url = iconName
      ? `https://api.avankart.com/v1/icon/${iconName}`
      : item.image_path || item.image_name || null;
    return res.json({ data: item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createMukafat = async (req, res) => {
  try {
    const body = req.body || {};
    // Map simple frontend fields into Mukafat schema
    const doc = new Mukafat({
      forCard: body.forCard || null,
      name: body.name || "Untitled",
      description: body.description || "",
      image_name: body.icon || body.image_name || "",
      image_path: body.icon || body.image_path || "",
      muessise_category: body.places || [],
      target: body.target_type || "count",
      conditions: { count: body.target || 0, amount: body.amount || 0 },
      gift:
        body.type === "bonus"
          ? "bonus"
          : body.type === "discount"
            ? "sale"
            : "amount",
      gift_conditions:
        body.type === "discount"
          ? { sale: Number((body.value || "").replace("%", "")) || 0 }
          : body.type === "bonus"
            ? { bonus: Number(body.value) || 0 }
            : {
                amount: Number((body.value || "").replace(/[AZN\s]/g, "")) || 0,
              },
    });
    await doc.save();
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMukafat = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const update = {
      name: body.name,
      description: body.description || "",
      image_name: body.icon || "",
      image_path: body.icon || "",
      muessise_category: body.places || [],
      target: body.target_type || "count",
      conditions: { count: body.target || 0, amount: body.amount || 0 },
      gift:
        body.type === "bonus"
          ? "bonus"
          : body.type === "discount"
            ? "sale"
            : "amount",
      gift_conditions:
        body.type === "discount"
          ? { sale: Number((body.value || "").replace("%", "")) || 0 }
          : body.type === "bonus"
            ? { bonus: Number(body.value) || 0 }
            : {
                amount: Number((body.value || "").replace(/[AZN\s]/g, "")) || 0,
              },
    };
    const updated = await Mukafat.findByIdAndUpdate(id, update, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMukafat = async (req, res) => {
  try {
    const id = req.params.id;
    // validate id presence
    if (!id || id === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    // validate ObjectId format
    if (
      !Mukafat ||
      !Mukafat.db ||
      !Mukafat.db.base ||
      !Mukafat.db.base.Types ||
      !Mukafat.db.base.Types.ObjectId
    ) {
      // fallback to mongoose.Types if model doesn't expose Types
      // but this is extremely unlikely; just proceed and let mongoose handle it
    }
    const mongoose = await import("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ObjectId format" });
    }
    await Mukafat.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listByCard = async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const card = await Cards.findById(cardId).lean();
    const cardIconName = card && card.icon ? card.icon : null;
    const card_icon_url = cardIconName
      ? `https://api.avankart.com/v1/icon/${cardIconName}`
      : card && (card.image_path || card.image_name)
        ? card.image_path || card.image_name
        : null;

    const data = await Mukafat.find({ forCard: cardId })
      .populate({ path: "forCard", select: "icon" })
      .lean();
    const results = data.map((m) => {
      const iconName = m.forCard && m.forCard.icon ? m.forCard.icon : null;
      m.icon_url = iconName
        ? `https://api.avankart.com/v1/icon/${iconName}`
        : m.image_path || m.image_name || null;
      return m;
    });
    return res.json({
      card: { ...(card || {}), icon_url: card_icon_url },
      data: results,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
