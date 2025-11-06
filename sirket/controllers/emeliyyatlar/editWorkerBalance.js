import mongoose from "mongoose";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";

function genOtp(len = 6) {
  const d = "0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += d[Math.floor(Math.random() * d.length)];
  return s;
}

export const editWorkerBalance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const authUserId = req.user?.id;
    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Auth required" });
    }
    const { ids, card_id: cardIds, values } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "ids boş olmamalıdır" });
    if (!Array.isArray(cardIds) || cardIds.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "card_id boş olmamalıdır" });
    if (!values || typeof values !== "object")
      return res
        .status(400)
        .json({ success: false, message: "values göndərilməlidir" });
    const actor = await PeopleUser.findById(authUserId)
      .select("_id sirket_id")
      .lean();
    if (!actor || !actor.sirket_id) {
      return res
        .status(400)
        .json({ success: false, message: "İstifadəçi və ya şirkət tapılmadı" });
    }
    const [parentDoc] = await AddCardBalance.create(
      [
        {
          user_id: actor._id,
          sirket_id: actor.sirket_id,
          cards: [],
          total_balance: 0,
          updatedBy: actor._id,
          refModel: "PeopleUser",
          status: "waiting",
          otp: { code: null, createdAt: null, accepted: false },
        },
      ],
      { session }
    );
    const parentObjId = parentDoc._id;
    const users = await PeopleUser.find(
      { _id: { $in: ids } },
      { _id: 1, totalBalance: 1 }
    )
      .lean()
      .session(session);
    const validSet = new Set(users.map((u) => String(u._id)));
    const validIds = ids.filter((id) => validSet.has(String(id)));
    if (validIds.length === 0) throw new Error("Keçərli istifadəçi yoxdur");
    const lastMap = new Map(
      users.map((u) => [String(u._id), Number(u.totalBalance || 0)])
    );
    const toInsert = [];
    let totalAmount = 0;
    const cardCount = new Map();
    for (const cId of cardIds) {
      const perUser = values[cId];
      if (!perUser || typeof perUser !== "object") continue;
      for (const uId of validIds) {
        const raw = perUser[uId];
        const amount = Number(raw);
        if (!Number.isFinite(amount) || amount <= 0) continue;
        const last_balance = lastMap.get(String(uId)) ?? 0;
        const total_balance = last_balance + amount;
        toInsert.push({
          user_id: uId,
          balance_id: parentObjId,
          sirket_id: actor.sirket_id,
          card_id: cId,
          total_balance,
          last_balance,
          added_balance: amount,
          updatedBy: actor._id,
          refModel: "PeopleUser",
          status: "waiting",
        });

        totalAmount += amount;
        cardCount.set(String(cId), (cardCount.get(String(cId)) || 0) + 1);
      }
    }

    if (toInsert.length === 0)
      throw new Error("Yadda saxlanılacaq balans tapılmadı");
    await AddedBalance.insertMany(toInsert, { session });
    const cardsArray = Array.from(cardCount.entries()).map(
      ([card_id, count]) => ({ card_id, count })
    );
    const otpCode = genOtp(6);
    await AddCardBalance.updateOne(
      { _id: parentObjId },
      {
        $set: {
          cards: cardsArray,
          total_balance: totalAmount,
          status: "waiting",
          otp: { code: otpCode, createdAt: new Date(), accepted: false },
          updatedBy: actor._id,
          refModel: "PeopleUser",
        },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return res.json({
      success: true,
      otpRequired: true,
      balance_id: parentDoc.balance_id,
      resendUrl: "/resend-otp",
      expiresIn: 300,
    });
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error("editWorkerBalance error:", err);
    return res
      .status(500)
      .json({ success: false, message: err?.message || "Server xətası" });
  }
};
