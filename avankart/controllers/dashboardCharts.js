import mongoose from "mongoose";
import AddedBalance from "../../shared/model/people/addedBalances.js";
import Invoice from "../../shared/models/invoysSirketModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import AdminUser from "../../shared/models/adminUsersModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import { aggregate } from "../seeds/pipelineAggregate.js";
import CashBack from "../../shared/models/cashBackModel.js";
import redisClient from "../../api/redisClient.js";
import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import Muessise from "../../shared/models/muessiseModel.js";
import Sirket from "../../shared/models/sirketModel.js";
import PeopleCardBalance from "../../shared/model/people/cardBalances.js";
import Cards from "../../shared/models/cardModel.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

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
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "İyun",
      "İyul",
      "Avgust",
      "Sentyabr",
      "Oktyabr",
      "Noyabr",
      "Dekabr",
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
      if (item._id && item.amount) spendArr[item._id - 1] = item.amount;
    });
    const totalArr = activeArr.map(
      (val, idx) => val + passiveArr[idx] - spendArr[idx]
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

export const balanceMovementSimple = async (req, res) => {
  try {
    const { year = null, filter = "all" } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "User id required",
        success: false,
      });
    }

    let user = null;
    if (userId) {
      user = await AdminUser.findById(userId);
    }

    if (!user && req.user?._id) {
      user = await AdminUser.findById(req.user._id);
    }

    if (!user && req.user?.userId) {
      user = await AdminUser.findById(req.user.userId);
    }

    if (!user || user.sirket_id === 0) {
      return res.status(400).json({
        message: "Admin user or company not found",
        success: false,
      });
    }

    const sirket_id = user.sirket_id;

    let active = [];
    let passive = [];
    let spend = [];
    let cashback = [];
    let reward = [];

    const startDate = year ? new Date(`${year}-01-01T00:00:00.000Z`) : null;
    const endDate = year
      ? new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`)
      : null;

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
          _id: null,
          total_balance: { $sum: "$total_balance" },
        },
      },
    ];
    const activeResult = await Invoice.aggregate(activePipeline);
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
          _id: null,
          total_balance: { $sum: "$total_balance" },
        },
      },
    ];
    const passiveResult = await AddedBalance.aggregate(passivePipeline);

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
          _id: null,
          amount: { $sum: "$amount" },
        },
      },
    ];
    const spendResult = await TransactionsUser.aggregate(spendPipeline);

    const cashbackPipeline = [
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
          _id: null,
          total_cashback: { $sum: "$cashback" },
        },
      },
    ];
    const cashbackResult = await CashBack.aggregate(cashbackPipeline);

    const totalActive =
      activeResult.length > 0 ? activeResult[0].total_balance : 0;
    const totalPassive =
      passiveResult.length > 0 ? passiveResult[0].total_balance : 0;
    const totalSpend = spendResult.length > 0 ? spendResult[0].amount : 0;
    const totalCashback =
      cashbackResult.length > 0 ? cashbackResult[0].total_cashback : 0;

    const totalBalance =
      totalActive + totalPassive + totalCashback - totalSpend;

    const categories = {
      "Aktiv balans": totalActive,
      "Passiv balans": totalPassive,
      Xərcləmə: totalSpend,
      Mükafat: 0,
      Kəşbek: totalCashback,
      Toplam: totalBalance,
    };

    return res.status(200).json({
      totalBalance,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const imtiyazQruplariUzeOdemeler = async (req, res) => {
  try {
    const peopleUser = await PeopleUser.findById(req.user.id);
    if (!peopleUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const { cachedData, formattedBalance } = await aggregate(
      "imtiyazQruplariUzeOdemeler",
      peopleUser.sirket_id
    );
    let payload;
    if (cachedData) {
      payload = JSON.parse(cachedData);
    } else {
      payload = formattedBalance || {};
    }

    return res.status(200).json({
      success: true,
      labels: payload.labels || [],
      datasets: payload.datasets || [],
      total: payload.total || 0,
    });
  } catch (error) {
    console.error("Something is wrong", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const toplamOdemeler = async (req, res) => {
  try {
    const peopleUser = await PeopleUser.findById(req.user.id);
    if (!peopleUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const { cachedData, formattedBalance } = await aggregate(
      "toplamOdemeler",
      peopleUser.sirket_id
    );
    let payload;
    if (cachedData) {
      payload = JSON.parse(cachedData);
    } else {
      payload = formattedBalance || {};
    }

    return res.status(200).json({
      success: true,
      labels: payload.labels || [],
      datasets: payload.datasets || [],
      total: payload.total || 0,
    });
  } catch (error) {
    console.error("Something is wrong", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const cashbackDonught = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const user = await PeopleUser.findById(userId).select("sirket_id").lean();
    if (!user || !user.sirket_id) {
      return res.status(400).json({
        message: "User or company not found",
        success: false,
      });
    }

    const sirket_id = user.sirket_id;
    const cacheKey = `dash:cashbackDonut:${sirket_id.toString()}:24m`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (_) {}

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 24);
    const rows = await CashBack.aggregate([
      {
        $match: {
          sirket_id,
          createdAt: { $gte: fromDate, $lte: new Date() },
        },
      },
      {
        $lookup: {
          from: "transactionsusers",
          localField: "transaction_id",
          foreignField: "_id",
          as: "tx",
        },
      },
      { $unwind: { path: "$tx", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          cardName: {
            $ifNull: [
              "$tx.card",
              {
                $ifNull: ["$tx.card_type", { $ifNull: ["$tx.type", "Digər"] }],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$cardName",
          total: { $sum: "$cashback" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const labels = rows.map((r) => r._id || "Digər");
    const data = rows.map((r) => (typeof r.total === "number" ? r.total : 0));

    const payload = {
      message: "Cashback doughnut data",
      success: true,
      labels,
      datasets: [
        {
          label: "Cashback",
          data,
        },
      ],
    };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), {
        EX: 6 * 60 * 60,
      });
    } catch (_) {}

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const meblegChart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
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
        $lt: new Date(parseInt(year) + 1, 0, 1),
      },
    };

    if (card_id && card_id !== "all") {
      matchQuery.card_id = card_id;
    }

    const data = await AddedBalance.find(matchQuery);

    data.forEach((item) => {
      const month = new Date(item.createdAt).getMonth();
      monthly_balances[month] += item.added_balance || 0;
    });

    const total = monthly_balances.reduce((sum, amount) => sum + amount, 0);

    return res.status(200).json({
      message: "Data retrieved successfully",
      success: true,
      data: monthly_balances,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAllHesablasmalar = async (req, res) => {
  try {
    let { year } = req.body;

    if (year && !Array.isArray(year)) year = [year];

    const cacheKey = `hesablasmalar:${year ? year.join(",") : "all"}`;

    // Redis-dən yoxla
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const matchQuery = {};
    if (year && year.length > 0) {
      const dateFilters = year.map((y) => ({
        end_date: {
          $gte: new Date(`${y}-01-01T00:00:00.000Z`),
          $lt: new Date(`${parseInt(y) + 1}-01-01T00:00:00.000Z`),
        },
      }));
      matchQuery.$or = dateFilters;
    }

    const hesablasmalar = await Hesablasma.find(matchQuery).lean();

    const odenilen = [];
    const odenilecek = [];
    let toplamCommission = 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      odenilen: 0,
      odenilecek: 0,
    }));

    for (const h of hesablasmalar) {
      const transactions = await TransactionsUser.find({
        hesablasma_id: h._id,
        status: "success",
      })
        .select("amount comission")
        .lean();

      let totalCommission = 0;
      transactions.forEach((t) => {
        totalCommission += t.amount * (t.comission / 100);
      });

      toplamCommission += totalCommission;

      const hesablasmaData = {
        hesablasma_id: h._id,
        transaction_count: transactions.length,
        total_commission: Number(totalCommission.toFixed(2)),
        status: h.status,
      };

      const monthIndex = new Date(h.createdAt).getMonth();
      if (h.status === "tamamlandi") {
        monthlyData[monthIndex].odenilen += totalCommission;
        odenilen.push(hesablasmaData);
      } else {
        monthlyData[monthIndex].odenilecek += totalCommission;
        odenilecek.push(hesablasmaData);
      }
    }

    const payload = {
      success: true,
      data: {
        odenilen,
        odenilecek,
        monthlyData: monthlyData.map((d) => ({
          month: d.month,
          odenilen: Number(d.odenilen.toFixed(2)),
          odenilecek: Number(d.odenilecek.toFixed(2)),
        })),
      },
      toplam_commission: Number(toplamCommission.toFixed(2)),
    };

    await redisClient.set(cacheKey, JSON.stringify(payload), "EX", 10800); //3 saat

    return res.status(200).json(payload);
  } catch (err) {
    console.error("getAllHesablasmalar error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAllHesablasmalarTotalAmount = async (req, res) => {
  try {
    let { year, muessise_id } = req.body;

    if (year && !Array.isArray(year)) year = [year];
    if (Array.isArray(year)) {
      year = year.map((y) => String(y).trim()).filter(Boolean);
    }

    const cacheKey = `hesablasmalarTotal:${muessise_id ?? "all"}:${year && year.length ? year.join(",") : "all"}`;

    // Redisdən yoxla
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Match query qur
    const matchQuery = {};
    if (muessise_id) {
      matchQuery.muessise_id = muessise_id;
    }

    if (year && year.length > 0) {
      const dateFilters = year.map((y) => ({
        end_date: {
          $gte: new Date(`${y}-01-01T00:00:00.000Z`),
          $lt: new Date(`${parseInt(y, 10) + 1}-01-01T00:00:00.000Z`),
        },
      }));
      matchQuery.$or = dateFilters;
    }

    // Əgər muessise_id seçilməyibsə bütün müəssisələrdən gəlməlidir
    const hesablasmalar = await Hesablasma.find(matchQuery).lean();

    const odenilen = [];
    const odenilecek = [];
    let toplamYekun = 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      odenilen: 0,
      odenilecek: 0,
    }));

    for (const h of hesablasmalar) {
      let yekunMebleg = 0;
      let transactionCount = 0;

      if ((h.total ?? 0) === 0 && (h.komissiya ?? 0) === 0) {
        const transactions = await TransactionsUser.find({
          hesablasma_id: h._id,
          status: "success",
        })
          .select("amount comission")
          .lean();

        let total = 0;
        let komissiya = 0;
        transactions.forEach((t) => {
          const amount = Number(t.amount ?? 0);
          const percent = Number(t.comission ?? 0);
          total += amount;
          komissiya += amount * (percent / 100);
        });
        transactionCount = transactions.length;
        yekunMebleg = total - komissiya;
      } else {
        yekunMebleg = (h.total ?? 0) - (h.komissiya ?? 0);
        transactionCount = h.transaction_count ?? 0;
      }

      toplamYekun += yekunMebleg;

      const hesablasmaData = {
        hesablasma_id: h._id,
        transaction_count: transactionCount,
        total: Number(h.total ?? 0),
        komissiya: Number(h.komissiya ?? 0),
        yekun_mebleg: Number(yekunMebleg.toFixed(2)),
        status: h.status,
      };

      // end_date yoxdursa createdAt və ya now götür
      const dateCandidate = h.end_date ?? h.createdAt ?? new Date();
      const ay = new Date(dateCandidate).getMonth() + 1;

      if (h.status === "tamamlandi") {
        odenilen.push(hesablasmaData);
        monthlyData[ay - 1].odenilen = Number(
          (monthlyData[ay - 1].odenilen + yekunMebleg).toFixed(2)
        );
      } else {
        odenilecek.push(hesablasmaData);
        monthlyData[ay - 1].odenilecek = Number(
          (monthlyData[ay - 1].odenilecek + yekunMebleg).toFixed(2)
        );
      }
    }

    const payload = {
      success: true,
      data: { odenilen, odenilecek, monthlyData },
      toplam_yekun: Number(toplamYekun.toFixed(2)),
    };

    await redisClient.set(cacheKey, JSON.stringify(payload), "EX", 10800); // 3 saat

    return res.status(200).json(payload);
  } catch (err) {
    console.error("getAllHesablasmalarTotalAmount error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllMuessiseler = async (req, res) => {
  try {
    const cacheKey = "dash:muessiseler";

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (_) {}

    const muessiseler = await Muessise.find({ deleted: false })
      .select("muessise_id profile_image_path muessise_name _id")
      .lean();

    const payload = {
      success: true,
      data: muessiseler,
    };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), {
        EX: 10800, // 3 saat = 10800 saniyə
      });
    } catch (_) {}

    return res.status(200).json(payload);
  } catch (err) {
    console.error("getAllMuessiseler error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllSirketler = async (req, res) => {
  try {
    const cacheKey = "dash:sirketler";

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (_) {}

    const sirketler = await Sirket.find({ deleted: false })
      .select("sirket_id profile_image_path sirket_name _id")
      .lean();

    const payload = {
      success: true,
      data: sirketler,
    };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), {
        EX: 10800, // 3 saat = 10800 saniyə
      });
    } catch (_) {}

    return res.status(200).json(payload);
  } catch (err) {
    console.error("getAllSirketler error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllCards = async (req, res) => {
  try {
    const cacheKey = "dash:cards";

    // --- 1. Əvvəlcə Redis cache yoxla
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (_) {
      // Redis əlçatan deyilsə, problemi gözardı et
    }

    // --- 2. DB-dən kartları çək
    const cards = await Cards.find({ deleted: { $ne: true } })
      .select("_id name")
      .lean();

    const payload = {
      success: true,
      data: cards,
    };

    try {
      await redisClient.set(cacheKey, JSON.stringify(payload), {
        EX: 10800, // 3 saat
      });
    } catch (_) {}

    return res.status(200).json(payload);
  } catch (err) {
    console.error("getAllCards error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRegistratedUserStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    let years = [];
    const { year: yearInput, sirket } = req.body || {};

    // --- 1. Yıl parametresini işle
    if (yearInput) {
      if (Array.isArray(yearInput)) {
        years = yearInput.map((y) => parseInt(y)).filter((y) => !isNaN(y));
      } else {
        const parsed = parseInt(yearInput);
        if (!isNaN(parsed)) years = [parsed];
      }
    }

    if (years.length === 0) {
      years = [now.year()];
    }

    const results = {};
    const totalGenderStats = { male: 0, female: 0, other: 0 };
    const totalAgeGroups = {
      "18-25": 0,
      "25-32": 0,
      "32-39": 0,
      "39-46": 0,
      "46-52": 0,
      "52-59": 0,
      "59+": 0,
    };

    for (const year of years) {
      const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
      const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

      const monthlyCounts = Array(12).fill(0);

      // --- 2. Filtre
      const filter = {
        deleted: false,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      };
      if (sirket) filter.sirket_id = sirket;

      // --- 3. Kullanıcıları getir
      const users = await PeopleUser.find(filter).select(
        "createdAt birth_date gender"
      );

      // --- 4. Aylık dağılım
      users.forEach((u) => {
        const month = new Date(u.createdAt).getMonth();
        monthlyCounts[month]++;
      });

      // --- 5. Gelecek ayları sıfırla
      if (year === now.year()) {
        const currentMonth = now.month();
        for (let i = currentMonth + 1; i < 12; i++) {
          monthlyCounts[i] = 0;
        }
      }

      // --- 6. Toplam cinsiyet
      users.forEach((u) => {
        if (u.gender && totalGenderStats.hasOwnProperty(u.gender)) {
          totalGenderStats[u.gender]++;
        } else {
          totalGenderStats.other++;
        }
      });

      // --- 7. Toplam yaş grubu
      const nowYear = now.year();
      users.forEach((u) => {
        if (!u.birth_date) return;
        const age = nowYear - dayjs(u.birth_date).year();

        if (age >= 18 && age < 25) totalAgeGroups["18-25"]++;
        else if (age < 32) totalAgeGroups["25-32"]++;
        else if (age < 39) totalAgeGroups["32-39"]++;
        else if (age < 46) totalAgeGroups["39-46"]++;
        else if (age < 52) totalAgeGroups["46-52"]++;
        else if (age < 59) totalAgeGroups["52-59"]++;
        else totalAgeGroups["59+"]++;
      });

      // --- 8. Yıllık sonuç (sadece aylık)
      results[year] = {
        monthly: monthlyCounts,
        totalRegistered: users.length,
      };
    }

    // --- 9. Genel sonuç
    return res.status(200).json({
      success: true,
      years,
      data: results,
      genderStats: totalGenderStats,
      ageGroups: totalAgeGroups,
    });
  } catch (err) {
    console.error("getAllRegisteredUsers error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getKartlarMedaxilStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    const { cards: selectedCards } = req.body || {};

    const year = now.year();
    const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
    const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

    // Base filter
    const filter = {
      deleted: false,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    };

    // Apply card filter if any
    if (Array.isArray(selectedCards) && selectedCards.length > 0) {
      filter.card_id = { $in: selectedCards };
    }

    // Fetch balances
    const balances = await AddedBalance.find(filter).populate(
      "card_id",
      "name"
    );

    // Fetch all cards (filtered or all)
    const cardsList =
      Array.isArray(selectedCards) && selectedCards.length > 0
        ? await Cards.find({
            _id: { $in: selectedCards },
            deleted: false,
          }).select("name")
        : await Cards.find({ deleted: false }).select("name");

    // Prepare data structures
    const monthlyData = {};
    const totalData = {};

    // Initialize all cards with zeros (unique key per id)
    cardsList.forEach((card) => {
      const key = `${card.name}_${card._id}`; // unique name
      monthlyData[key] = Array(12).fill(0);
      totalData[key] = 0;
    });

    // Fill data
    balances.forEach((b) => {
      const card = b.card_id;
      if (!card) return;
      const key = `${card.name}_${card._id}`;
      const month = new Date(b.createdAt).getMonth();
      const added = b.added_balance || 0;

      if (monthlyData[key]) {
        monthlyData[key][month] += added;
        totalData[key] += added;
      }
    });

    // Build response
    return res.status(200).json({
      success: true,
      year,
      data: { monthly: monthlyData, total: totalData },
    });
  } catch (err) {
    console.error("getKartlarMedaxilStats error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getKartlarMexaricStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    const { cards: selectedCards } = req.body || {};

    const year = now.year();
    const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
    const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

    // Base filter
    const filter = {
      deleted: false,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
      status: "success",
    };

    // Apply card filter if any
    if (Array.isArray(selectedCards) && selectedCards.length > 0) {
      filter.cards = { $in: selectedCards };
    }

    // Fetch transactions
    const transactions = await TransactionsUser.find(filter).populate(
      "cards",
      "name"
    );

    // Fetch all cards (filtered or all)
    const cardsList =
      Array.isArray(selectedCards) && selectedCards.length > 0
        ? await Cards.find({
            _id: { $in: selectedCards },
            deleted: false,
          }).select("name")
        : await Cards.find({ deleted: false }).select("name");

    // Prepare data structures
    const monthlyData = {};
    const totalData = {};

    // Initialize all cards with zeros (unique key per id)
    cardsList.forEach((card) => {
      const key = `${card.name}_${card._id}`; // unique name
      monthlyData[key] = Array(12).fill(0);
      totalData[key] = 0;
    });

    // Fill data
    transactions.forEach((trx) => {
      const card = trx.cards;
      if (!card) return;
      const key = `${card.name}_${card._id}`;
      const month = new Date(trx.createdAt).getMonth();
      const amount = trx.amount || 0;

      if (monthlyData[key]) {
        monthlyData[key][month] += amount;
        totalData[key] += amount;
      }
    });

    // Build response
    return res.status(200).json({
      success: true,
      year,
      data: { monthly: monthlyData, total: totalData },
    });
  } catch (err) {
    console.error("getKartlarMexaricStats error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getInvoiceStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    let years = [];
    const { year: yearInput, sirket } = req.body || {};

    if (yearInput) {
      if (Array.isArray(yearInput)) {
        years = yearInput.map((y) => parseInt(y)).filter((y) => !isNaN(y));
      } else {
        const parsed = parseInt(yearInput);
        if (!isNaN(parsed)) years = [parsed];
      }
    }

    if (years.length === 0) {
      years = [now.year()];
    }

    const results = {};

    for (const year of years) {
      const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
      const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

      const monthlyTotals = Array(12).fill(0);

      const filter = {
        deleted: { $ne: true },
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      };
      if (sirket) filter.sirket_id = sirket;

      const invoices = await Invoice.find(filter).select(
        "createdAt total_balance"
      );

      invoices.forEach((inv) => {
        const month = new Date(inv.createdAt).getMonth(); // 0-based
        monthlyTotals[month] += inv.total_balance || 0;
      });

      if (year === now.year()) {
        const currentMonth = now.month();
        for (let i = currentMonth + 1; i < 12; i++) {
          monthlyTotals[i] = 0;
        }
      }

      const totalForYear = monthlyTotals.reduce((a, b) => a + b, 0);

      results[year] = {
        monthly: monthlyTotals,
        total: totalForYear,
        invoiceCount: invoices.length,
      };
    }

    return res.status(200).json({
      success: true,
      years,
      data: results,
    });
  } catch (err) {
    console.error("getInvoiceStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMuessiseRegisterStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    let years = [];

    const yearInput = req.body.year;

    if (yearInput) {
      if (Array.isArray(yearInput)) {
        years = yearInput.map((y) => parseInt(y)).filter((y) => !isNaN(y)); // NaN dəyərləri at
      } else {
        const parsed = parseInt(yearInput);
        if (!isNaN(parsed)) years = [parsed];
      }
    }

    // --- 2. Əgər heç nə gəlməyibsə, cari ili götür
    if (years.length === 0) {
      years = [now.year()];
    }

    const results = {};

    // --- 3. Hər il üçün hesablamanı aparırıq
    for (const year of years) {
      const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
      const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

      // 12 aylıq boş array
      const monthlyCounts = Array(12).fill(0);

      // Bu ilin aralığında yaradılmış müəssisələri tap
      const muessiseler = await Muessise.find({
        deleted: false,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      }).select("createdAt");

      // Aylara görə say
      muessiseler.forEach((m) => {
        const month = new Date(m.createdAt).getMonth(); // 0 → yanvar, 11 → dekabr
        monthlyCounts[month]++;
      });

      // --- 4. Əgər cari ildir, gələcək ayları 0 saxla
      if (year === now.year()) {
        const currentMonth = now.month(); // 0-based
        for (let i = currentMonth + 1; i < 12; i++) {
          monthlyCounts[i] = 0;
        }
      }

      // --- 5. Nəticəni əlavə et
      results[year] = {
        monthly: monthlyCounts,
        totalRegistered: muessiseler.length,
      };
    }

    // --- 6. Cavab
    return res.status(200).json({
      success: true,
      years,
      data: results,
    });
  } catch (err) {
    console.error("getMuessiseRegisterStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTransactionsStats = async (req, res) => {
  try {
    const now = dayjs.utc();
    let years = [];

    const yearInput = req.body.year;

    if (yearInput) {
      if (Array.isArray(yearInput)) {
        years = yearInput.map((y) => parseInt(y)).filter((y) => !isNaN(y));
      } else {
        const parsed = parseInt(yearInput);
        if (!isNaN(parsed)) years = [parsed];
      }
    }

    // Eğer yıl gelmemişse, varsayılan olarak bu yıl
    if (years.length === 0) {
      years = [now.year()];
    }

    const results = {};

    for (const year of years) {
      const startOfYear = dayjs.utc(`${year}-01-01T00:00:00Z`).toDate();
      const endOfYear = dayjs.utc(`${year}-12-31T23:59:59Z`).toDate();

      const monthlyCounts = Array(12).fill(0);

      // Bu yıl içerisindeki işlemleri çek
      const transactions = await TransactionsUser.find({
        deleted: false,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      }).select("createdAt");

      transactions.forEach((t) => {
        const month = new Date(t.createdAt).getMonth();
        monthlyCounts[month]++;
      });

      // Eğer yıl güncel yıl ise gelecekteki ayları 0 yap
      if (year === now.year()) {
        const currentMonth = now.month();
        for (let i = currentMonth + 1; i < 12; i++) {
          monthlyCounts[i] = 0;
        }
      }

      results[year] = {
        monthly: monthlyCounts,
        totalTransactions: transactions.length,
      };
    }

    return res.status(200).json({
      success: true,
      years,
      data: results,
    });
  } catch (err) {
    console.error("getTransactionsStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cardBalancesSummary = async (req, res) => {
  try {
    const adminUser = await AdminUser.findById(req.user.id);
    if (!adminUser) {
      return res
        .status(404)
        .json({ success: false, message: "Admin user or company not found" });
    }

    const result = await Cards.aggregate([
      {
        $match: {
          $or: [{ deleted: false }, { deleted: { $exists: false } }],
          status: "active", // yalnız aktiv kartlar
        },
      },
      {
        $lookup: {
          from: "peoplecardbalances", // collection adı (mongoose avtomatik lowercase + plural)
          localField: "_id",
          foreignField: "card_id",
          as: "balances",
        },
      },
      {
        $addFields: {
          totalBalance: { $sum: "$balances.balance" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          background_color: 1,
          totalBalance: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in cardBalancesSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
