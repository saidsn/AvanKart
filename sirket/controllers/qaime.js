import PeopleUser from "../../shared/models/peopleUserModel.js";
import AddCardBalance from "../../shared/model/people/qaime.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import mongoose from "mongoose";
import redisClient from "../redisClient.js";
import EQaime from "../../shared/model/people/qaime.js";

export const qaime = async (req, res) => {
  try {
    let {
      status,
      min,
      max,
      year,
      month,
      search = null,
      page = 1,
      limit = 10,
      draw = 1,
    } = req.body;

    const skip = (page - 1) * limit;

    const user = await PeopleUser.findById(req.user.id);
    if (!user || !user.sirket_id) {
      return res.status(404).json({ message: "Şirkət tapılmadı." });
    }
    const sirketId = user.sirket_id;

    const cacheKey = `qaime:${sirketId}:${JSON.stringify({
      status,
      min,
      max,
      year,
      month,
      search,
      page,
      limit,
    })}`;
    const totalKey = `qaime:total:${sirketId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json({ draw, ...JSON.parse(cached) });

    let filter = { sirket_id: sirketId };

    if (status) {
      if (typeof status === "string" && status.trim() !== "") {
        status = [status];
      }

      const cleaned = status.filter(
        (s) => typeof s === "string" && s.trim() !== ""
      );
      if (cleaned.length) filter.status = { $in: cleaned };
    }
    if (typeof min === "number" && min !== undefined && min > 0) {
      filter.total_balance = { ...(filter.total_balance || {}), $gte: min };
      console.log("Applied min filter:", min);
    }
    if (typeof max === "number" && max !== undefined && max < 300000) {
      filter.total_balance = { ...(filter.total_balance || {}), $lte: max };
      console.log("Applied max filter:", max);
    }

    // Логируем финальный фильтр для отладки
    console.log("Final filter for total_balance:", filter.total_balance);

    if (year || month) {
      const startDate = new Date(
        year || new Date().getFullYear(),
        month ? month - 1 : 0,
        1
      );
      const endDate = new Date(
        year || new Date().getFullYear(),
        month ? month : 12,
        1
      );

      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      const or = [
        { qaime_id: { $regex: term, $options: "i" } },
        { status: { $regex: term, $options: "i" } },
      ];
      const numeric = Number(term);
      if (!isNaN(numeric) && term.match(/^\d+$/)) {
        or.push({ total_balance: numeric });
      }

      filter.$or = or;
    }

    const recordsFiltered = await EQaime.countDocuments(filter);
    console.log("Records found with filter:", recordsFiltered);

    const data = await EQaime.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    console.log("Returning", data.length, "records");
    // Логируем первые несколько записей для отладки
    if (data.length > 0) {
      console.log(
        "Sample records total_balance:",
        data
          .slice(0, 3)
          .map((r) => ({
            qaime_id: r.qaime_id,
            total_balance: r.total_balance,
          }))
      );
    }

    // Process each qaime to calculate total_balance if not set
    for (let q of data) {
      console.log(
        `Processing qaime ${q.qaime_id}: current total_balance = ${q.total_balance}`
      );

      if (!q.total_balance || q.total_balance === 0) {
        let total = 0;

        // If qaime has cards, sum them up
        if (q.cards && q.cards.length > 0) {
          total = q.cards.reduce((sum, card) => sum + (card.amount || 0), 0);
          console.log(`Qaime ${q.qaime_id}: calculated from cards = ${total}`);
        } else {
          // If no cards, look for transactions related to this qaime
          const transactions = await TransactionsUser.find({
            from_sirket: sirketId,
            qaime_id: q._id,
            status: "success",
          });

          console.log(
            `Qaime ${q.qaime_id}: found ${transactions.length} transactions`
          );

          const cardsMap = {};
          for (const t of transactions) {
            if (!t.cards) continue;
            for (const card of t.cards) {
              const cardId = card.card_id.toString();
              if (!cardsMap[cardId]) cardsMap[cardId] = 0;
              cardsMap[cardId] += card.amount || 0;
              total += card.amount || 0;
            }
          }

          // Update qaime with calculated cards and total
          if (Object.keys(cardsMap).length > 0) {
            q.cards = Object.entries(cardsMap).map(([card_id, amount]) => ({
              card_id: new mongoose.Types.ObjectId(card_id),
              amount,
            }));
          }

          console.log(
            `Qaime ${q.qaime_id}: calculated from transactions = ${total}`
          );
        }

        q.total_balance = total;
        console.log(
          `Qaime ${q.qaime_id}: final total_balance = ${q.total_balance}`
        );
      }
    }

    const recordsTotal = await EQaime.countDocuments({ sirket_id: sirketId });

    const response = { data, recordsFiltered, recordsTotal };

    await redisClient.setEx(cacheKey, 600, JSON.stringify(response));
    return res.json({ draw, ...response });
  } catch (error) {
    console.error("qaime controller error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const kartlarTable = async (req, res) => {
  try {
    const {
      qaime_id,
      min = null,
      max = null,
      search = null,
      page = 1,
      limit = 10,
    } = req.body;

    if (!qaime_id) {
      return res.status(400).json({ message: "qaime_id tələb olunur." });
    }

    const skip = (page - 1) * limit;

    const peopleUser = await PeopleUser.findById(req.user.id);
    if (!peopleUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const sirket_id = peopleUser.sirket_id;

    const qaime = await EQaime.findOne({
      qaime_id: qaime_id,
      sirket_id,
    }).populate("cards.card_id");
    if (!qaime) return res.status(404).json({ message: "Qaime not found." });

    let cards = qaime.cards;

    if (min != null) cards = cards.filter((c) => c.amount >= min);
    if (max != null) cards = cards.filter((c) => c.amount <= max);
    if (search)
      cards = cards.filter((c) =>
        c.card_id?.card_name.toLowerCase().includes(search.toLowerCase())
      );

    const recordsTotal = cards.length;

    const paginatedCards = cards.slice(skip, skip + limit);

    const data = paginatedCards.map((c) => ({
      _id: c.card_id._id,
      card_name: c.card_id.card_name,
      amount: c.amount,
    }));

    res
      .status(200)
      .json({ cards: data, recordsTotal, recordsFiltered: recordsTotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
