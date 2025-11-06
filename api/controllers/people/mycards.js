import RequestCard from "../../../shared/model/people/requestActivateCard.js";
import CardConditions from "../../../shared/models/cardConditionsModel.js";
import mongoose from "mongoose";

export const requestChangeStatusCard = async (req, res) => {
  try {
    const userId = req.user;
    const { card_id, reason_id = [], status } = req.body; // default [] qoyuldu

    if (!card_id) {
      return res.status(400).json({ message: "card_id göndərilməlidir" });
    }

    if (reason_id.length > 0) {
      // Validate ObjectIds
      for (let id of reason_id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: `Yanlış ObjectId formatı: ${id}` });
        }
      }

      // Check if all reason IDs exist in CardConditions
      const existingReasons = await CardConditions.find({ _id: { $in: reason_id } });
      if (existingReasons.length !== reason_id.length) {
        return res.status(400).json({ message: "Bəzi reason_id-lər mövcud deyil" });
      }
    }

    const doc = await RequestCard.findOne({ user_id: userId, card_id });

    if (doc && doc.attempts >= 6) {
      return res.status(429).json({ message: "Çox sayıda sorğu göndərdiniz." });
    }

    const now = new Date();

    if (doc) {
      doc.status = status === "active" ? 'waiting' : status || "waiting";
      doc.action_time = now;
      doc.reasons = [...reason_id];

      await doc.save();

      return res.status(200).json({
        status: doc.status,
        attempts: doc.attempts,
        message: `Sorğu ${doc.status} vəziyyətinə keçirildi.`,
      });
    }

    const created = await RequestCard.create({
      user_id: userId,
      card_id,
      status: status !== "active" ?  status : "waiting",
      action_time: now,
      reasons: [...reason_id]
    });

    return res.status(201).json({
      status: created.status,
      attempts: created.attempts,
      message: `Yeni sorğu yaradıldı (${created.status}).`,
    });
  } catch (err) {
    console.error("requestChangeStatusCard error:", err);
    return res.status(500).json({ message: "Server xətası" });
  }
};