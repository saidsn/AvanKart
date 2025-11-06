
import AddedBalance from "../../shared/model/people/addedBalances.js";
import Invoice from "../../shared/models/invoysSirketModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import { aggregate } from "../seeds/pipelineAggregate.js";
import CashBack from "../../shared/models/cashBackModel.js";
import redisClient from "../../api/redisClient.js";

export const imtiyazQruplariUzeOdemeler = async (req, res) => {
  try {
    const peopleUser = await PeopleUser.findById(req.user.id);
    if (!peopleUser) return res.status(400).json({ message: "User not found", success: false });

    const { imtiyazId } = req.body;
    const options = { imtiyazId };
    const cacheKey = imtiyazId
      ? `imtiyazQruplariUzeOdemeler:${peopleUser.sirket_id}:${imtiyazId}`
      : `imtiyazQruplariUzeOdemeler:${peopleUser.sirket_id}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    } catch (err) {
      console.error("Redis read error:", err.message);
    }

    const { formattedBalance } = await aggregate("imtiyazQruplariUzeOdemeler", peopleUser.sirket_id, options);
    const payload = { message: "Data chart updated successfully", success: true, formattedBalance };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 6 * 60 * 60 });
    } catch (err) {
      console.error("Redis write error:", err.message);
    }

    return res.status(200).json(payload);

  } catch (error) {
    console.error("General error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const toplamOdemeler = async (req, res) => {
  try {
    const peopleUser = await PeopleUser.findById(req.user.id);
    if (!peopleUser) return res.status(400).json({ message: "User not found", success: false });

    let { range, from, to } = req.body;
    range = range ? String(range).trim().toLowerCase() : "all";

    let options = {};
    let cacheKey = `toplamOdemeler:${peopleUser.sirket_id}:${range}`;

    const endDate = new Date();
    let startDate = new Date();

    if (range === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      options = { range: "custom", from, to };
      cacheKey += `:${startDate.toISOString().slice(0,10)}:${endDate.toISOString().slice(0,10)}`;
    } else if (range === "all") {
      startDate = new Date(0);
      options = { range: "all" };
    } else {
      let monthsToSubtract;
      switch (range) {
        case "year": case "12": monthsToSubtract = 12; break;
        case "6": monthsToSubtract = 6; break;
        case "3": monthsToSubtract = 3; break;
        case "1": monthsToSubtract = 1; break;
        default:
          monthsToSubtract = parseInt(range);
          if (isNaN(monthsToSubtract) || monthsToSubtract < 0)
            return res.status(400).json({ message: `Invalid range value: ${range}`, success: false });
      }
      startDate.setMonth(startDate.getMonth() - monthsToSubtract);
      options = { range: "custom", from: startDate.toISOString(), to: endDate.toISOString() };
      cacheKey += `:${startDate.toISOString().slice(0,10)}:${endDate.toISOString().slice(0,10)}`;
    }

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    } catch (err) {
      console.error("Redis read error:", err.message);
    }

    const { formattedBalance } = await aggregate("toplamOdemeler", peopleUser.sirket_id, options);
    const payload = { message: "Data chart updated successfully", success: true, formattedBalance };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 6 * 60 * 60 });
    } catch (err) {
      console.error("Redis write error:", err.message);
    }

    return res.status(200).json(payload);

  } catch (error) {
    console.error("General error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const balanceMovement = async (req, res) => {
  try {
    const { year = null, filter = "all" } = req.body;

    const userId = req.user.id;
    if (!userId)
      return res.status(400).json({
        message: "User id require",
        success: false,
      });

    const user = await PeopleUser.findById(userId);

    if (!user || user.sirket_id === 0)
      return res.status(400).json({
        message: "User or company not found",
        success: false,
      });

    const sirket_id = user.sirket_id;

    let active = [];
    let passive = [];
    let spend = [];
    const startDate = year ? new Date(`${year}-01-01T00:00:00.000Z`) : null;
    const endDate = year
      ? new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`)
      : null;

    switch (filter) {
      case "active":
        const activePipeline = [
          {
            $match: {
              sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total_balance: { $sum: "$total_balance" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];
        active = await Invoice.aggregate(activePipeline);

        break;
      case "passive":
        const passivePipeline = [
          {
            $match: {
              sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total_balance: { $sum: "$total_balance" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];
        passive = await AddedBalance.aggregate(passivePipeline);

        break;
      case "spend":
        const spendPipeline = [
          {
            $match: {
              from_sirket: sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              amount: { $sum: "$amount" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];
        spend = await TransactionsUser.aggregate(spendPipeline);
        break;

      case "all":
        const activeAllPipeline = [
          {
            $match: {
              sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total_balance: { $sum: "$total_balance" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];
        const passiveAllPipeline = [
          {
            $match: {
              sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total_balance: { $sum: "$total_balance" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];

        active = await Invoice.aggregate(activeAllPipeline);
        passive = await AddedBalance.aggregate(passiveAllPipeline);

        const spendAllPipeline = [
          {
            $match: {
              from_sirket: sirket_id,
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              amount: { $sum: "$amount" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];
        spend = await TransactionsUser.aggregate(spendAllPipeline);
    }
    const totalActive =
      active.length > 0
        ? active.reduce((sum, item) => (sum += item.total_balance), 0)
        : 0;
    const totalPassive =
      passive.length > 0
        ? passive.reduce((sum, item) => (sum += item.total_balance), 0)
        : 0;
    const totalSpend =
      spend.length > 0
        ? spend.reduce((sum, item) => (sum += item.amount), 0)
        : 0;

    const months = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
      "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    const activeArr = new Array(12).fill(0);
    const passiveArr = new Array(12).fill(0);
    const spendArr = new Array(12).fill(0);
    active.forEach((item) => {
      if (item._id && item.total_balance)
        activeArr[item._id - 1] = item.total_balance;
    });
    passive.forEach((item) => {
      if (item._id && item.total_balance)
        passiveArr[item._id - 1] = item.total_balance;
    });
    spend.forEach((item) => {
      if (item._id && item.amount)
        spendArr[item._id - 1] = item.amount;
    });
    const totalArr = activeArr.map((val, idx) =>
      val + passiveArr[idx] - spendArr[idx]
    );
    const data = [
      { label: "Aktiv balans:", data: activeArr },
      { label: "Xərcləmə:", data: spendArr },
      { label: "Passiv balans:", data: passiveArr },
      { label: "Toplam:", data: totalArr },
    ];
    return res.status(200).json({
      message: "Total data send successfully",
      success: true,
      labels: months,
      data,
    });
  } catch (error) {
    console.log("Error", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const cashbackDonught = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized", success: false });

    const user = await PeopleUser.findById(userId).select("sirket_id").lean();
    if (!user?.sirket_id) return res.status(400).json({ message: "User or company not found", success: false });

    const sirket_id = user.sirket_id;
    const cacheKey = `cashbackDonught:${sirket_id}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return res.status(200).json(JSON.parse(cachedData));
    } catch (err) {
      console.error("Redis read error:", err.message);
    }

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 24);

    const rows = await CashBack.aggregate([
      { $match: { sirket_id, createdAt: { $gte: fromDate, $lte: new Date() } } },
      { $lookup: { from: "transactionsusers", localField: "transaction_id", foreignField: "_id", as: "tx" } },
      { $unwind: { path: "$tx", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "cards", localField: "tx.cards", foreignField: "_id", as: "cardInfo" } },
      { $unwind: { path: "$cardInfo", preserveNullAndEmptyArrays: true } },
      { $addFields: { cardName: { $ifNull: ["$cardInfo.name", "Digər"] } } },
      { $group: { _id: "$cardName", total: { $sum: "$cashback" } } },
      { $sort: { total: -1 } },
    ]);

    const labels = rows.map(r => r._id || "Digər");
    const data = rows.map(r => (typeof r.total === "number" ? r.total : 0));

    const payload = { message: "Cashback doughnut data", success: true, labels, datasets: [{ label: "Cashback", data }] };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), { EX: 6 * 60 * 60 });
    } catch (err) {
      console.error("Redis write error:", err.message);
    }

    return res.status(200).json(payload);

  } catch (error) {
    console.error("General error:", error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const meblegChart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    const user = await PeopleUser.findById(userId).select("sirket_id").lean();
    if (!user || !user.sirket_id) {
      return res.status(400).json({
        message: "User or company not found",
        success: false,
      });
    }

    const { year = new Date().getFullYear(), card_id = "all" } = req.body;
    const monthly_balances = new Array(12).fill(0);

    let matchQuery = {
      sirket_id: user.sirket_id,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1)
      }
    };

    if (card_id && card_id !== "all") {
      matchQuery.card_id = card_id;
    }

    const data = await AddedBalance.find(matchQuery);

    data.forEach(item => {
      const month = new Date(item.createdAt).getMonth();
      monthly_balances[month] += item.added_balance || 0;
    });

    const total = monthly_balances.reduce((sum, amount) => sum + amount, 0);

    return res.status(200).json({
      message: "Data retrieved successfully",
      success: true,
      data: monthly_balances,
      total: total
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};
