import mongoose from "mongoose";
import redisClient from "../../../api/redisClient.js";
import AddCardBalance from "../../../shared/model/people/qaime.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import EQaime from "../../../shared/model/people/qaime.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";

const SIX_HOURS = 60 * 60 * 6;
const keyCardsList = (sirketId) => `qaime:list:${sirketId}`;
const keyTotal = (sirketId) => `qaime:total:${sirketId}`;
const keyPerCard = (sirketId, cardId) => `qaime:sum:${sirketId}:${cardId}`;

export const ensureLastMonthQaime = async (req, res) => {
  // removed session/transactions: single mongod does not support transactions
  try {
    const me = await PeopleUser.findById(req.user?.id)
      .select("sirket_id")
      .lean();
    const sirket_id_raw = me?.sirket_id;
    if (!sirket_id_raw) {
      return res.status(400).send("sirket_id yoxdur");
    }
    if (!mongoose.Types.ObjectId.isValid(sirket_id_raw)) {
      return res.status(400).send("sirket_id yanlışdır");
    }
    const sirket_id = new mongoose.Types.ObjectId(sirket_id_raw);

    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();
    const targetYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const targetMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const periodStart = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const periodEnd = new Date(targetYear, targetMonth + 1, 1, 0, 0, 0, 0);

    // no .session(...)
    const exists = await EQaime.findOne({
      sirket_id,
      createdAt: { $gte: periodStart, $lt: periodEnd },
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Keçən ay üçün qaimə artıq mövcuddur",
        qaime_id: exists.qaime_id,
      });
    }

    const latestQaime = await EQaime.findOne({ sirket_id })
      .sort({ createdAt: -1 })
      .select("createdAt qaime_id");

    // no .session(...)
    const txAgg = await TransactionsUser.aggregate([
      {
        $match: {
          from_sirket: sirket_id,
          date: { $gte: periodStart, $lt: periodEnd },
          status: "success",
        },
      },
      {
        $group: {
          _id: "$cards",
          amount: { $sum: "$amount" },
        },
      },
    ]);

    if (!txAgg.length) {
      return res.json({
        success: true,
        message: "Keçən ay üçün əməliyyat yoxdur, qaimə yaradılmadı",
        latestQaimeCreatedAt: latestQaime?.createdAt || null,
      });
    }

    const cards = txAgg
      .filter((x) => !!x._id)
      .map((x) => ({
        card_id: x._id,
        amount: Number(x.amount || 0),
      }));

    const total_balance = cards.reduce((sum, c) => sum + (c.amount || 0), 0);

    // create without session; array yerine tək obyekt (funksional fərq yoxdur)
    const created = await EQaime.create({
      user_id: req.user?.id || null,
      sirket_id,
      cards,
      total_balance,
    });

    return res.json({
      success: true,
      message: "Keçən ay üçün qaimə yaradıldı",
      qaime_id: created?.qaime_id,
      total_balance: total_balance || 0,
      cards_count: cards.length,
      period: { start: periodStart, end: periodEnd },
      latestQaimeCreatedAt: latestQaime?.createdAt || null,
    });
  } catch (err) {
    console.error("ensureLastMonthQaime error:", err);
    return res.status(500).send("Server xətası");
  }
};

export const qaimePage = async (req, res) => {
  try {
    const myUser = await PeopleUser.findById(req.user?.id);

    const sirket_id_raw = myUser?.sirket_id;
    if (!sirket_id_raw) return res.status(400).send("sirket_id yoxdur");
    if (!mongoose.Types.ObjectId.isValid(sirket_id_raw))
      return res.status(400).send("sirket_id yanlışdır");

    const sirket_id = new mongoose.Types.ObjectId(sirket_id_raw);

    const [cachedList, cachedTotal, cachedCount] = await Promise.all([
      redisClient.get(keyCardsList(sirket_id_raw)),
      redisClient.get(keyTotal(sirket_id_raw)),
      redisClient.get(`qaime:count:${sirket_id_raw}`),
    ]);

    if (cachedList && cachedTotal && cachedCount) {
      const cards = JSON.parse(cachedList);
      const totalAmount = Number(cachedTotal);
      const qaimeCount = Number(cachedCount);
      return res.render("pages/qaime/qaime", {
        cards,
        totalAmount,
        qaimeCount,
        csrfToken: req.csrfToken(),
      });
    }

    // 2) DB agg
    const agg = await AddCardBalance.aggregate([
      { $match: { status: { $in: ["completed", "complated"] }, sirket_id } },
      { $unwind: "$cards" },
      {
        $lookup: {
          from: "cards",
          localField: "cards.card_id",
          foreignField: "_id",
          as: "card_info",
        },
      },
      { $unwind: { path: "$card_info", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$cards.card_id",
          amount: { $sum: "$cards.count" },
          name: { $first: "$card_info.card_name" },
          background_color: { $first: "$card_info.background_color" },
        },
      },
    ]);

    const cards = agg.map((x) => ({
      card_id: String(x._id),
      amount: Number(x.amount || 0),
      name: x.name?.trim?.() || "",
      background_color: x.background_color || "#99DEB4",
    }));
    const totalAmount = cards.reduce((s, c) => s + c.amount, 0);

    // Get count of e-qaime records
    const qaimeCount = await EQaime.countDocuments({ sirket_id });

    await Promise.all([
      redisClient.setEx(
        keyCardsList(sirket_id_raw),
        SIX_HOURS,
        JSON.stringify(cards)
      ),
      redisClient.setEx(
        keyTotal(sirket_id_raw),
        SIX_HOURS,
        String(totalAmount)
      ),
      redisClient.setEx(
        `qaime:count:${sirket_id_raw}`,
        SIX_HOURS,
        String(qaimeCount)
      ),
      ...cards.map((c) =>
        redisClient.setEx(
          keyPerCard(sirket_id_raw, c.card_id),
          SIX_HOURS,
          String(c.amount),
          c.name,
          c.backgroundColor
        )
      ),
    ]);

    console.log(
      cards,
      "cardlarrrrrrrrrrrrrrrrrrrrrr",
      totalAmount,
      "total amountssssssssssssssssssssssssssssssssssssssssssssssssssssss",
      qaimeCount,
      "qaime counttttttttttttttttttttttttttttttttttttttttttttttttttttttt"
    );
    return res.render("pages/qaime/qaime", {
      cards,
      totalAmount,
      qaimeCount,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("qaimePage error:", err);
    return res.status(500).send("Server xətası");
  }
};

export const kartlarPage = async (req, res) => {
  try {
    const userData = await PeopleUser.findById(req.user?.id);
    if (!userData) return res.status(400).send("Istifadeci tapilmadi");
    const sirket_id_raw = userData.sirket_id;
    const { qaime_id } = req.params;

    if (!sirket_id_raw) return res.status(400).send("sirket_id yoxdur");
    if (!qaime_id) return res.status(400).send("qaime_id yoxdur");
    if (!mongoose.Types.ObjectId.isValid(sirket_id_raw)) {
      return res.status(400).send("ID formatı yanlışdır");
    }

    const sirket_id = new mongoose.Types.ObjectId(sirket_id_raw);
    let qaime = {};
    const eQaime = await EQaime.findOne({
      qaime_id: qaime_id,
      sirket_id,
    }).lean();

    if (!eQaime) return res.status(404).send("Qaimə tapılmadı");

    let newCreatedAt = new Date(eQaime.createdAt);
    let newUpdatedAt = new Date(eQaime.updatedAt);
    const date = `${newCreatedAt.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })} - ${newUpdatedAt.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })}`;

    qaime.date = date;
    qaime.totalBalance = eQaime.total_balance || 0;
    qaime.qaime_id = eQaime.qaime_id;
    qaime.status = eQaime.status;
    console.log("---qaime---", qaime);

    return res.render("pages/qaime/kartlar", {
      qaime,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("kartlarPage error:", err);
    return res.status(500).send("Server xətası");
  }
};
