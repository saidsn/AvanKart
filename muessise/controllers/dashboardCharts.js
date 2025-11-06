import moment from "moment";
import mongoose from "mongoose";
import ObjectId from "mongoose";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import Cards from "../../shared/models/cardModel.js";
import Muessise from "../../shared/models/muessiseModel.js";
import QrCode from "../../shared/models/qrCodeModel.js";

const qrCodeCounts = async (req, res) => {
  try {
    const { range = "custom", start_date, end_date } = req.body;
    let startDate, endDate, intervalCount;
    const currentUser = await PartnerUser.findById(req.user.id);
    const muessise_id_obj = new mongoose.Types.ObjectId(
      currentUser.muessise_id
    );
    if (!muessise_id_obj) {
      return res.json({
        draw: req.body.draw || 1,
        recordsTotal: 0,
        recordsFiltered: 0,
        totalCount: 0,
        data: Array(intervalCount || 12).fill({ period: "#", count: 0 }),
        error: res.__("errors.dashboardChart.muessise_id_not_found"),
      });
    }
    switch (range) {
      case "15-days":
        startDate = moment.utc().subtract(15, "days").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 15;
        break;
      case "one-month":
        startDate = moment.utc().subtract(1, "months").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 3;
        break;
      case "three-months":
        startDate = moment.utc().subtract(3, "months").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 6;
        break;
      case "six-months":
        startDate = moment.utc().subtract(6, "months").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 12;
        break;
      case "year":
        startDate = moment.utc().subtract(1, "year").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 12;
        break;
      case "custom":
        if (!start_date || !end_date) {
          return res.status(400).json({
            error: res.__("errors.dashboardChart.custom_range_missing_dates"),
          });
        }

        const dateFormats = [
          "YYYY-MM-DD",
          "MM/DD/YYYY",
          "DD/MM/YYYY",
          "YYYY/MM/DD",
        ];

        startDate = moment(start_date, dateFormats, true).startOf("day");
        endDate = moment(end_date, dateFormats, true).endOf("day");
        if (!startDate.isValid() || !endDate.isValid()) {
          return res.status(400).json({
            error:
              "Invalid date format. Please use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY format.",
          });
        }

        intervalCount = 12;
        break;
      case "all":
        startDate = null;
        endDate = null;
        intervalCount = 10;
        break;
      default:
        startDate = moment.utc().subtract(30, "months").startOf("day");
        endDate = moment.utc().endOf("day");
        intervalCount = 10;
        break;
    }
    const partnerUsers = await PartnerUser.find({
      muessise_id: muessise_id_obj,
    });
    const partnerUserIds = partnerUsers.map((pu) => pu._id);
    if (partnerUserIds.length === 0) {
      return res.json({
        draw: req.body.draw || 1,
        recordsTotal: 0,
        recordsFiltered: 0,
        totalCount: 0,
        data: Array(intervalCount).fill({ period: "#", count: 0 }),
        error: res.__("errors.dashboardChart.no_partner_users"),
      });
    }
    let qrQuery = { muessise_id: currentUser.muessise_id };

    if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
      qrQuery.creating_time = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      };
    }


    const qrCodes = await QrCode.find(qrQuery);
    let totalDuration, intervalDuration;
    const counts = Array(intervalCount).fill(0);

    if (
      startDate &&
      endDate &&
      startDate.isValid() &&
      endDate.isValid() &&
      range !== "all"
    ) {
      totalDuration = endDate.diff(startDate, "days");
      intervalDuration = totalDuration > 0 ? totalDuration / intervalCount : 1;

      qrCodes.forEach((qr) => {
        const createdAt = moment(qr.creating_time);
        const index = Math.floor(
          createdAt.diff(startDate, "days") / intervalDuration
        );
        const safeIndex = Math.min(Math.max(0, index), intervalCount - 1);
        counts[safeIndex]++;
      });
    } else if (range === "all" && qrCodes.length > 0) {
      const sortedQrCodes = qrCodes.sort(
        (a, b) => new Date(a.creating_time) - new Date(b.creating_time)
      );
      const oldestDate = moment(sortedQrCodes[0].creating_time);
      const newestDate = moment(
        sortedQrCodes[sortedQrCodes.length - 1].creating_time
      );

      totalDuration = newestDate.diff(oldestDate, "days");
      intervalDuration = totalDuration > 0 ? totalDuration / intervalCount : 1;

      qrCodes.forEach((qr) => {
        const createdAt = moment(qr.creating_time);
        const index = Math.floor(
          createdAt.diff(oldestDate, "days") / intervalDuration
        );
        const safeIndex = Math.min(Math.max(0, index), intervalCount - 1);
        counts[safeIndex]++;
      });
    }
    const responseData = counts.map((count, i) => ({
      period: `#${i + 1}`,
      count,
    }));

    res.json({
      draw: req.body.draw || 1,
      recordsTotal: qrCodes.length,
      recordsFiltered: qrCodes.length,
      totalCount: qrCodes.length,
      data: responseData,
      success: true,
    });
  } catch (err) {
    console.error("qrCodeCounts error:", err);
    res
      .status(500)
      .json({ error: res.__("errors.dashboardChart.server_error_occurred") });
  }
};

export const hesablasmalar = async (req, res) => {
  try {
    const { range, from, to } = req.body;
    let start_date = from;
    let end_date = to;
    const currentUser = await PartnerUser.findById(req.user.id);
    if (!currentUser) {
      return res
        .status(400)
        .json({ error: res.__("errors.dashboardChart.muessise_id_not_found") });
    }

    const filter = {};
    filter.muessise_id = new mongoose.Types.ObjectId(currentUser.muessise_id);

    const now = moment.utc().endOf("day");

    switch (range) {
      case "today":
        start_date = moment.utc().startOf("day");
        end_date = moment.utc().endOf("day");
        break;
      case "week":
        start_date = moment.utc().startOf("week");
        end_date = moment.utc().endOf("day");
        break;
      case "month":
        start_date = moment.utc().startOf("month");
        end_date = moment.utc().endOf("day");
        break;
      case "custom":
        start_date = from
          ? moment.utc(from, "YYYY-MM-DD").startOf("day")
          : moment.utc().subtract(6, "months").startOf("day");

        end_date = to
          ? moment.utc(to, "YYYY-MM-DD").isAfter(now)
            ? now
            : moment.utc(to, "YYYY-MM-DD").endOf("day")
          : now;
        break;
      default:
        start_date = from
          ? moment.utc(from, "YYYY-MM-DD").startOf("day")
          : moment.utc().subtract(6, "months").startOf("day");

        end_date = to
          ? moment.utc(to, "YYYY-MM-DD").isAfter(now)
            ? now
            : moment.utc(to, "YYYY-MM-DD").endOf("day")
          : now;
    }

    // Dövr overlap + bitmiş olma şərti
    filter.from_date = { $lte: end_date.toDate() };
    filter.end_date = { $gte: start_date.toDate(), $lte: now.toDate() };

    const totalHesablasmalar = await Hesablasma.countDocuments({});
    const muessiseHesablasmalar = await Hesablasma.countDocuments({
      muessise_id: filter.muessise_id,
    });

    const simpleData = await Hesablasma.find({
      muessise_id: filter.muessise_id,
    })
      .limit(5)
      .lean();
    const data = await Hesablasma.find(filter)
      .populate("transactionUsers")
      .lean({ virtuals: true });

    if (data.length > 0) {
      const sampleHesablasma = data[0];

      const relatedTransactions = await TransactionsUser.find({
        hesablasma_id: sampleHesablasma._id,
        status: "success",
      }).lean();

      const anyLinkedTransactions = await TransactionsUser.find({
        hesablasma_id: { $exists: true, $ne: null },
        status: "success",
      })
        .limit(5)
        .lean();
    }

    if (data.length === 0) {
      const allData = await Hesablasma.findWithDeleted(filter)
        .populate("transactionUsers")
        .lean({ virtuals: true });
    }

    let tamamlandi = 0;
    let diger = 0;

    for (const h of data) {
      const base =
        Array.isArray(h.transactionUsers) && h.transactionUsers.length
          ? h.transactionUsers.reduce((sum, tx) => {
              const amount = Number(tx.amount) || 0;
              const commission = Number(tx.comission) || 0;
              return sum + (amount - (amount * commission) / 100);
            }, 0)
          : Number(h.yekun_mebleg) || 0;

      if (h.status === "tamamlandi") tamamlandi += base;
      else diger += base;
    }
    const tamamlandiHesablasmalar = data.filter(
      (d) => d.status === "tamamlandi"
    );

    for (const hesablasma of tamamlandiHesablasmalar) {
      if (
        hesablasma.transactionUsers &&
        hesablasma.transactionUsers.length > 0
      ) {
        const transactionTotal = hesablasma.transactionUsers.reduce(
          (sum, tx) => {
            const amount = Number(tx.amount) || 0;
            const commission = Number(tx.comission) || 0;
            return sum + (amount - (amount * commission) / 100);
          },
          0
        );
        tamamlandi += transactionTotal;
      } else {
        tamamlandi += hesablasma.yekun_mebleg || 0;
      }
    }

    // if (data.length > 0 && tamamlandiHesablasmalar.length === 0) {
    //   console.log("TEST: Görək əgər birini tamamlandi etsək nə olar...");
    //   const testHesablasma = data[0];
    //   if (testHesablasma.status !== "tamamlandi") {
    //     const testAmount = testHesablasma.yekun_mebleg || 0;
    //     console.log(`TEST: ${testHesablasma.hesablasma_id} statusu "${testHesablasma.status}" idi, əgər "tamamlandi" olsa ${testAmount} AZN olar`);
    //   }
    // }

    // let diger = data
    //   .filter((d) => d.status !== "tamamlandi")
    //   .reduce((sum, d) => sum + (d.yekun_mebleg || 0), 0);

    // console.log("Final calculated amounts:", {
    //   tamamlandi,
    //   diger,
    //   total: tamamlandi + diger,
    //   statusCounts: data.reduce((acc, d) => {
    //     acc[d.status] = (acc[d.status] || 0) + 1;
    //     return acc;
    //   }, {})
    // });

    const response = {
      labels: ["Avankartın ödədiyi", "Qalıq"],
      text: { total: "Toplam" },
      datasets: [tamamlandi, diger ?? 0],
      debug: {
        totalRecords: data.length,
        dateRange: {
          start: start_date.format(),
          end: end_date.format(),
        },
        statusBreakdown: data.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {}),
      },
    };

    res.json(response);
  } catch (err) {
    console.error("hesablasmalar error:", err);
    res
      .status(500)
      .json({ error: res.__("errors.dashboardChart.server_error_occurred") });
  }
};

export const tranzactionsTable = async (req, res) => {
  try {
    const {
      start,
      length,
      start_date,
      end_date,
      cards,
      query,
      order,
      columns,
    } = req.body;

    const currentUser = await PartnerUser.findById(req.user.id);
    const muessise_id_obj = currentUser?.muessise_id;

    if (!muessise_id_obj) {
      return res.json({
        draw: req.body.draw || 1,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
        error: res.__("errors.dashboardChart.muessise_id_not_found"),
      });
    }

    let filter = {
      $or: [{ from: muessise_id_obj }, { to: muessise_id_obj }],
      status: "success",
    };

    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date) filter.date.$lte = new Date(end_date);
    }

    if (cards && Array.isArray(cards) && cards.length > 0) {
      const cardObjectIds = cards
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { cards: { $in: cardObjectIds } },
          { cardCategory: { $in: cardObjectIds } },
        ],
      });
    }

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { transaction_id: searchRegex },
          { note: searchRegex },
          { currency: searchRegex },
        ],
      });
    }

    let sort = {};
    if (order && order.length > 0) {
      const orderColumnIndex = order[0].column;
      const orderDir = order[0].dir === "asc" ? 1 : -1;
      const orderColumnName = columns[orderColumnIndex].data;
      sort[orderColumnName] = orderDir;
    } else {
      sort.date = -1;
    }

    const baseTotalFilter = {
      $or: [{ from: muessise_id_obj }, { to: muessise_id_obj }],
      status: "success",
    };
    if (filter.date) baseTotalFilter.date = filter.date;
    if (filter.$and) {
      const cardsOr = filter.$and.find((b) =>
        b.$or?.some?.((x) => x.cards || x.cardCategory)
      );
      if (cardsOr) {
        baseTotalFilter.$and = [cardsOr];
      }
    }

    const recordsTotal = await TransactionsUser.countDocuments(baseTotalFilter);
    const recordsFiltered = await TransactionsUser.countDocuments(filter);

    const transactions = await TransactionsUser.find(filter)
      .populate("from", "name surname email people_id")
      .populate(
        "to",
        "muessise_name email authorized_person.name authorized_person.email"
      )
      .populate("cards", "name")
      .populate("cardCategory", "name")
      .sort(sort)
      .skip(Number(start))
      .limit(Number(length))
      .lean();

    const formattedData = transactions.map((t) => {
      const isOutgoing =
        t.from && t.from._id?.toString() === muessise_id_obj.toString();
      const receiver = isOutgoing ? t.to : t.from;

      const receiverText =
        (receiver &&
          (receiver.muessise_name ||
            receiver?.authorized_person?.name ||
            (Array.isArray(receiver?.email) && receiver.email[0]) ||
            (receiver.name && receiver.surname
              ? `${receiver.name} ${receiver.surname}`
              : receiver.name) ||
            receiver.people_id ||
            receiver.email)) ||
        "N/A";

      const cardName =
        (t.cardCategory && t.cardCategory.name) ||
        (t.cards && t.cards.name) ||
        "N/A";

      const cardId =
        (t.cardCategory && t.cardCategory._id) ||
        (t.cards && t.cards._id) ||
        "N/A";

      const amountNum =
        typeof t.amount === "number" ? t.amount : Number(t.amount) || 0;

      return {
        id: t.transaction_id || String(t._id),
        receiver: receiverText,
        card: cardName,
        card_id: cardId,
        amount: amountNum.toFixed(2),
        date: t.date ? moment(t.date).format("DD.MM.YYYY HH:mm") : "N/A",
      };
    });

    const allcards = await Muessise.find({ _id: currentUser.muessise_id })
      .select("cards")
      .populate({
        path: "cards",
        select: "_id name",
        options: { strictPopulate: false },
      })
      .lean();

    const mycards =
      allcards?.flatMap((m) =>
        (m.cards || [])
          .filter(Boolean)
          .map((c) => ({ _id: c._id, name: c.name }))
      ) || [];

    return res.json({
      draw: req.body.draw || 1,
      recordsTotal,
      recordsFiltered,
      data: formattedData,
      mycards,
      success: true,
    });
  } catch (err) {
    console.error("tranzactionsTable error:", err);
    return res
      .status(500)
      .json({ error: res.__("errors.dashboardChart.server_error_occurred") });
  }
};

function getRandomColor() {
  const colors = [
    "#7086FD",
    "#6FCF97",
    "#FF6B6B",
    "#00A3FF",
    "#F2AB4B",
    "#9B59B6",
    "#E67E22",
    "#2ECC71",
    "#3498DB",
    "#E74C3C",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const kartlarUzreMeblegChart = async (req, res) => {
  try {
    const { cards = [], years = [] } = req.body;
    const targetYears =
      years.length > 0 ? years.sort((a, b) => a - b) : [moment.utc().year()];

    const currentUser = await PartnerUser.findById(req.user.id);
    const muessise_id = currentUser?.muessise_id;

    if (!muessise_id) {
      return res.status(400).json({
        error: res.__("errors.dashboard.chart.muessise_id_not_found"),
      });
    }

    let targetCards = cards;
    if (cards.length === 0) {
      const allCards = await Cards.find({ status: "active" }, { _id: 1 });
      targetCards = allCards.map((card) => card._id);
    }
    const dateFilters = targetYears.map((year) => {
      const start = moment.utc().year(year).startOf("year").toDate();
      const end = moment.utc().year(year).endOf("year").toDate();
      return { date: { $gte: start, $lte: end } };
    });
    const transactions = await TransactionsUser.find({
      to: muessise_id,
      cards: { $in: targetCards },
      status: "success",
      $or: dateFilters,
    }).lean();
    const cardDetails = await Cards.find({ _id: { $in: targetCards } }).lean();
    const kartlar = await Cards.find()
      .select("name")   // yalnız kart adı gələcək
      .lean();
    transactions.forEach(tx => console.log("tx.amount:", tx.amount, "tx.commission:", tx.commission));

    const cardNames = kartlar.map(card => card.name);
    function getCardColor(index) {
      const colors = [
        "#7086FD",
        "#6FCF97",
        "#FF6B6B",
        "#00A3FF",
        "#F2AB4B",
        "#9B59B6",
        "#E67E22",
        "#2ECC71",
        "#3498DB",
        "#E74C3C",
      ];
      return colors[index % colors.length];
    }

    const cardMap = new Map();
    cardDetails.forEach((card, index) => {
      let cardColor = card.background_color;
      if (!cardColor || /^#?f{3,6}$/i.test(cardColor) || cardColor.length < 4) {
        cardColor = getCardColor(index);
      }
      cardMap.set(card._id.toString(), {
        name: card.name,
        color: cardColor,
      });
    });

    const chartData = [];
    const donutData = [];
    let totalAmount = 0;

    for (const cardId of targetCards) {
      const cardIdStr = cardId.toString();
      const cardInfo = cardMap.get(cardIdStr);
      if (!cardInfo) continue;

      const cardTransactions = transactions.filter((tx) => {
        if (!tx.cards) return false;
        if (Array.isArray(tx.cards)) {
          return tx.cards.some((c) => c.toString() === cardIdStr);
        }
        return tx.cards.toString() === cardIdStr;
      });

      let cardTotal = 0;
      const cardDataPoints = [];

      if (targetYears.length === 1) {
        const monthsMap = new Map();
        for (let i = 0; i < 12; i++) {
          const monthKey = moment
            .utc()
            .year(targetYears[0])
            .month(i)
            .format("YYYY-MM");
          monthsMap.set(monthKey, 0);
        }

        cardTransactions.forEach((tx) => {
          const monthKey = moment(tx.date).format("YYYY-MM");
          if (monthsMap.has(monthKey)) {
            const commission = (tx.amount * (tx.commission || 0)) / 100;
            const net = tx.amount - commission;
            monthsMap.set(monthKey, monthsMap.get(monthKey) + net);
            cardTotal += net;
          }
        });

        monthsMap.forEach((value) => {
          cardDataPoints.push(parseFloat(value.toFixed(2)));
        });
      } else {
        targetYears.forEach((year) => {
          const start = moment.utc().year(year).startOf("year").toDate();
          const end = moment.utc().year(year).endOf("year").toDate();
          let yearTotal = 0;

          cardTransactions.forEach((tx) => {
            const txDate = new Date(tx.date);
            if (txDate >= start && txDate <= end) {
              const commission = (tx.amount * (tx.commission || 0)) / 100;
              const net = tx.amount - commission;
              yearTotal += net;
            }
          });

          cardDataPoints.push(parseFloat(yearTotal.toFixed(2)));
          cardTotal += yearTotal;
        });
      }

      if (cardTotal > 0) {
        chartData.push({
          color: cardInfo.color,
          label: cardInfo.name,
          data: cardDataPoints,
        });

        donutData.push({
          name: cardInfo.name,
          value: parseFloat(cardTotal.toFixed(2)),
          color: cardInfo.color,
        });

        totalAmount += cardTotal;
      }
    
    }
  
    const labels =
      targetYears.length === 1
        ? [
            "Yanvar",
            "Fevral",
            "Mart",
            "Aprel",
            "May",
            "İyun",
            "İyul",
            "Avqust",
            "Sentyabr",
            "Oktyabr",
            "Noyabr",
            "Dekabr",
          ]
        : targetYears.map(String);
     return res.json({
      chartData,
      labels,
      donutData,
      cards: kartlar,
      total: parseFloat(totalAmount.toFixed(2)),
    });
  } catch (err) {
    console.error("kartlarUzreMeblegChart error:", err);
    res.status(500).json({ error: "Server error occurred" });
  }
};

export default qrCodeCounts;

export const meblegChart = async (req, res) => {
  try {
    const { date } = req.body;

    const targetYear = date ?? moment.utc().year();

    const startDate = moment.utc().year(targetYear).month(0).startOf("month");
    const endDate = moment.utc().year(targetYear).month(11).endOf("month");

    const currentUser = await PartnerUser.findById(req.user.id);
    const muessise_id = currentUser?.muessise_id;

    if (!muessise_id) {
      return res.status(400).json({
        error: res.__("errors.dashboard.chart.muessise_id_not_found"),
      });
    }

    const partnerUsers = await PartnerUser.find({ muessise_id }, { _id: 1 });
    const userIds = partnerUsers.map((u) => u._id);
    const transactions = await TransactionsUser.find({
      to: muessise_id,
      status: "success",
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    }).lean();
    const monthsMap = new Map();
    for (let i = 0; i < 12; i++) {
      const monthKey = moment.utc().year(targetYear).month(i).format("YYYY-MM");
      monthsMap.set(monthKey, 0);
    }

    let yearlyTotal = 0;

    transactions.forEach((tx) => {
      const monthKey = moment(tx.date).format("YYYY-MM");
      if (monthsMap.has(monthKey)) {
        const commissionAmount = (tx.amount * tx.comission) / 100;
        const netAmount = tx.amount - commissionAmount;

        monthsMap.set(monthKey, monthsMap.get(monthKey) + netAmount);
        yearlyTotal += netAmount;
      }
    });

    const result = Array.from(monthsMap.entries()).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    res.json({
      data: result,
      total: parseFloat(yearlyTotal.toFixed(2)),
    });
  } catch (err) {
    console.error("meblegChart error:", err);
    res
      .status(500)
      .json({ error: res.__("errors.dashboard.chart.server_error_occurred") });
  }
};

export const createTestTransaction = async (req, res) => {
  try {
    const currentUser = await PartnerUser.findById(req.user.id);

    // Test transaction'ları yaradın
    const testTransactions = [];

    // Kart 1 üçün bir neçə transaction
    for (let i = 0; i < 6; i++) {
      const transaction1 = new TransactionsUser({
        from: currentUser._id,
        to: currentUser._id,
        cards: new mongoose.Types.ObjectId("6874ceeb8c5ed0c2290e3bb9"),
        amount: Math.floor(Math.random() * 200) + 50, // 50-250 arası
        comission: 5,
        status: "success",
        date: moment.utc().subtract(i, "months").toDate(),
        transaction_id: "TEST1-" + Date.now() + "-" + i,
        currency: "AZN",
      });
      testTransactions.push(transaction1);
    }

    // Kart 2 üçün bir neçə transaction
    for (let i = 0; i < 6; i++) {
      const transaction2 = new TransactionsUser({
        from: currentUser._id,
        to: currentUser._id,
        cards: new mongoose.Types.ObjectId("6874ceeb8c5ed0c2290e3bbc"),
        amount: Math.floor(Math.random() * 150) + 30, // 30-180 arası
        comission: 3,
        status: "success",
        date: moment.utc().subtract(i, "months").toDate(),
        transaction_id: "TEST2-" + Date.now() + "-" + i,
        currency: "AZN",
      });
      testTransactions.push(transaction2);
    }

    await TransactionsUser.insertMany(testTransactions);

    res.json({
      message: res.__("messages.dashboard.chart.test_transactions_created"),
      count: testTransactions.length,
    });
  } catch (error) {
    console.error("Error creating test transactions:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createTestHesablasmalar = async (req, res) => {
  try {
    const currentUser = await PartnerUser.findById(req.user.id);
    if (!currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const testHesablasmalar = [];

    for (let i = 0; i < 6; i++) {
      const fromDate = moment
        .utc()
        .subtract(i + 1, "months")
        .startOf("month");
      const endDate = moment
        .utc()
        .subtract(i + 1, "months")
        .endOf("month");

      const hesablasma = new Hesablasma({
        hesablasma_id: `TEST-HESAB-${Date.now()}-${i}`,
        transaction_count: Math.floor(Math.random() * 50) + 10,
        total: Math.floor(Math.random() * 50000) + 10000,
        komissiya: Math.floor(Math.random() * 2000) + 500,
        yekun_mebleg: Math.floor(Math.random() * 48000) + 8000,
        from_date: fromDate.toDate(),
        end_date: endDate.toDate(),
        status:
          i % 3 === 0
            ? "tamamlandi"
            : i % 3 === 1
              ? "aktiv"
              : "waiting_tamamlandi",
        sender: currentUser._id,
        muessise_id: new mongoose.Types.ObjectId(currentUser.muessise_id),
      });

      testHesablasmalar.push(hesablasma);
    }

    const currentMonthHesablasma = new Hesablasma({
      hesablasma_id: `TEST-HESAB-CURRENT-${Date.now()}`,
      transaction_count: Math.floor(Math.random() * 30) + 5,
      total: Math.floor(Math.random() * 30000) + 5000,
      komissiya: Math.floor(Math.random() * 1500) + 250,
      yekun_mebleg: Math.floor(Math.random() * 28000) + 4000,
      from_date: moment.utc().startOf("month").toDate(),
      end_date: moment.utc().endOf("month").toDate(),
      status: "aktiv",
      sender: currentUser._id,
      muessise_id: new mongoose.Types.ObjectId(currentUser.muessise_id),
    });

    testHesablasmalar.push(currentMonthHesablasma);

    await Hesablasma.insertMany(testHesablasmalar);

    res.json({
      message: "Test hesablaşmalar uğurla yaradıldı",
      count: testHesablasmalar.length,
      data: testHesablasmalar.map((h) => ({
        hesablasma_id: h.hesablasma_id,
        status: h.status,
        yekun_mebleg: h.yekun_mebleg,
        from_date: h.from_date,
        end_date: h.end_date,
      })),
    });
  } catch (error) {
    console.error("Error creating test hesablasmalar:", error);
    res.status(500).json({ error: error.message });
  }
};
