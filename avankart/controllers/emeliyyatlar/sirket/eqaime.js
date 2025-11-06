import mongoose from "mongoose";
import EQaime from "../../../../shared/models/eQaimeModel.js";
import Cards from "../../../../shared/models/cardModel.js";
import Sirket from "../../../../shared/models/sirketModel.js";

const AZ_MONTHS = [
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
];

const mapStatus = (st) =>
  st === "active"
    ? "Aktiv"
    : st === "passive"
      ? "Gözləmədə"
      : st === "tamamlandi"
        ? "Tamamlandı"
        : st;

const safeNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

const azStatus = (st) =>
  st === "active"
    ? "Tamamlanıb"
    : st === "passive"
      ? "Gözləmədə"
      : st === "canceled"
        ? "Ləğv edilib"
        : (st ?? "");

export const getEQaime = async (req, res, next) => {
  try {
    const qaimeler = await EQaime.find()
      .populate({
        path: "cards.card_id"    // nested populate direkt card_id'yi işaret ediyor
      })
      .lean();
    const cardMap = new Map();
    let totalBalance = 0;
    // Tüm qaimeler üzerinden geç
    qaimeler.forEach(qaime => {
      qaime.cards.forEach(c => {
        const card = c.card_id; // populate edilmiş Card objesi
        if (!card) return;

        const cardId = card._id.toString();
        if (!cardMap.has(cardId)) {
          cardMap.set(cardId, {
            card_id: card._id,
            name: card.name,
            color: card.background_color,
            totalBalance: 0
          });
        }

        const cardData = cardMap.get(cardId);
        cardData.totalBalance += c.balance;
        totalBalance += c.balance;
      });
    });

    // Map'i array'e çevir ve yüzdeleri ekle
    const cards = Array.from(cardMap.values()).map(c => ({
      name: c.name,
      color: c.color,
      totalBalance: c.totalBalance,
      percentage: totalBalance ? (c.totalBalance / totalBalance) * 100 : 0
    }));

    const result = {
      cards,
      totalBalance
    };
    
    const allCards = await Cards.find();

    return res.render("pages/emeliyyatlar/sirket/eqaime", {
      error: "",
      csrfToken: req.csrfToken(),
      layout: "./layouts/main.ejs",
      result,
      allCards
    });

  } catch (err) {
    return next(err);
  }
};

export const eqaimeList = async (req, res) => {
  try {
    const {
      status,
      cards,
      min,
      max,
      year = [],
      month = [],
      draw,
      search = "",
      page = 1,
      limit = 10,
      sirket_id,
    } = req.body || {};

    const andConds = [];

    // Şirket filtresi
    if (sirket_id) {
      andConds.push(
        mongoose.Types.ObjectId.isValid(sirket_id)
          ? { sirket_id: new mongoose.Types.ObjectId(sirket_id) }
          : { sirket_id: String(sirket_id) }
      );
    }

    // Kart filtresi
    if (Array.isArray(cards) && cards.length > 0) {
      andConds.push({ "cards.card_id": { $in: cards } });
    }

    // Status filtresi
    if (Array.isArray(status) && status.length > 0) {
      andConds.push({ status: { $in: status } });
    } else if (typeof status === "string" && status.trim()) {
      andConds.push({ status: status.trim() });
    }

    // Minimum / Maximum filtre
    if (typeof min === "number" || typeof max === "number") {
      const range = {};
      if (typeof min === "number") range.$gte = min;
      if (typeof max === "number") range.$lte = max;
      andConds.push({ $or: [{ qaime_total: range }, { total_balance: range }] });
    }

    // Year / Month filtre (overlap kontrolü)
    if (year.length || month.length) {
      const ranges = [];

      if (year.length && month.length) {
        year.forEach((y) =>
          month.forEach((m) => {
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = new Date(Date.UTC(y, m, 1));
            ranges.push({ start, end });
          })
        );
      } else if (year.length) {
        year.forEach((y) => {
          const start = new Date(Date.UTC(y, 0, 1));
          const end = new Date(Date.UTC(y + 1, 0, 1));
          ranges.push({ start, end });
        });
      } else if (month.length) {
        // current year assumed
        const nowYear = new Date().getUTCFullYear();
        month.forEach((m) => {
          const start = new Date(Date.UTC(nowYear, m - 1, 1));
          const end = new Date(Date.UTC(nowYear, m, 1));
          ranges.push({ start, end });
        });
      }

      if (ranges.length) {
        andConds.push({
          $or: ranges.map(({ start, end }) => ({
            $or: [
              { $and: [{ start_date: { $lt: end } }, { end_date: { $gte: start } }] },
              { $and: [{ start_date: { $lt: end } }, { start_date: { $gte: start } }] },
              { $and: [{ end_date: { $lt: end } }, { end_date: { $gte: start } }] },
            ],
          })),
        });
      }
    }

    // Search filtresi
    if (search && search.trim()) {
      const term = search.trim();
      const or = [
        { qaime_id: { $regex: term, $options: "i" } },
        { "sirket_id.sirket_name": { $regex: term, $options: "i" } },
        { "sirket_id.sirket_id": { $regex: term, $options: "i" } },
      ];
      const n = Number(term);
      if (!Number.isNaN(n)) or.push({ qaime_total: n }, { total_balance: n });
      andConds.push({ $or: or });
    }

    const filter = andConds.length ? { $and: andConds } : {};

    // Total hesaplaması (tüm veri)
    const allRows = await EQaime.find().populate({ path: "sirket_id", select: "sirket_name sirket_id" }).lean();
    let totalSum = 0;
    const cardSums = {};
    allRows.forEach((doc) => {
      if (doc.total_balance > 0) totalSum += Number(doc.total_balance);
      else if (doc.qaime_total > 0) totalSum += Number(doc.qaime_total);
      else if (Array.isArray(doc.cards)) {
        doc.cards.forEach((c) => {
          totalSum += Number(c.balance || 0);
          if (c.card_id) cardSums[String(c.card_id)] = (cardSums[String(c.card_id)] || 0) + Number(c.balance || 0);
        });
      }
    });

    const cardIds = Object.keys(cardSums);
    const cardsMap = cardIds.length
      ? Object.fromEntries(
          (await Cards.find({ _id: { $in: cardIds } }).select("name background_color icon").lean()).map((c) => [String(c._id), c])
        )
      : {};

    const summary = {
      total: totalSum,
      cards: cardIds.map((id) => ({
        card_id: id,
        name: cardsMap[id]?.name || "",
        amount: Number(cardSums[id] || 0),
        background_color: cardsMap[id]?.background_color || "",
        icon: cardsMap[id]?.icon || "",
      })),
    };

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [rows, totalCount] = await Promise.all([
      EQaime.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("sirket_id", "sirket_name sirket_id profile_image profile_image_path")
        .lean(),
      EQaime.countDocuments(filter),
    ]);

    const AZ_MONTHS = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
      "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
    ];

    const data = rows.map((d) => {
      let amount = d.total_balance > 0 ? Number(d.total_balance)
        : d.qaime_total > 0 ? Number(d.qaime_total)
        : Array.isArray(d.cards) ? d.cards.reduce((a, c) => a + Number(c.balance || 0), 0)
        : 0;

      const dt = d.start_date || d.createdAt;
      const periodLabel = dt ? `${new Date(dt).getFullYear()}, ${AZ_MONTHS[new Date(dt).getMonth()]}` : "Bilinmir";

      return {
        id: String(d._id),
        qaime_id: d.qaime_id,
        amount,
        period: { label: periodLabel, start_date: d.start_date || d.createdAt, end_date: d.end_date || d.createdAt },
        status: mapStatus(d.status),
        raw_status: d.status,
        company: d.sirket_id ? {
          id: String(d.sirket_id._id),
          name: d.sirket_id.sirket_name || "",
          cm_id: d.sirket_id.sirket_id || "",
          logo: d.sirket_id.profile_image || "",
          logo_path: d.sirket_id.profile_image_path || "",
        } : null,
        cards_count: Array.isArray(d.cards) ? d.cards.length : 0,
      };
    });

    return res.json({
      summary,
      data,
      page: pageNum,
      pageSize: limitNum,
      total: totalCount,
      recordsTotal: totalCount,
      recordsFiltered: data.length,
      draw,
    });
  } catch (e) {
    console.error("eqaimeList error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};


export const eqaimeDetailsView = async (req, res) => {
  try {
    const { qaime_id } = req.params;

    const doc = await EQaime.findOne({ qaime_id })
      .populate({
        path: "sirket_id",
        select: "sirket_name sirket_id profile_image",
      })
      .populate({ path: "cards.card_id", select: "name background_color icon" })
      .lean();

    if (!doc) {
      return (
        res.status(404).render?.("pages/404") ??
        res.status(404).send("Not found")
      );
    }

    console.log("[EQaime] sirket_id:", doc.sirket_id);
    console.log("[EQaime] cards:", doc.cards);

    const viewModel = {
      company: doc.sirket_id
        ? {
            id: String(doc.sirket_id._id),
            sirket_id: String(doc.sirket_id.sirket_id),
            name: doc.sirket_id.sirket_name ?? "",
            cm_id: doc.sirket_id.sirket_id ?? "",
            logo: doc.sirket_id.profile_image ?? "",
            logo_path: doc.sirket_id.profile_image_path ?? "",
          }
        : null,
      invoice_no: doc.qaime_id,
      total_amount: safeNum(doc.total_balance || doc.qaime_total || 0),
      period: {
        label:
          (doc.createdAt
            ? `${new Date(doc.createdAt).getFullYear()}, ${AZ_MONTHS[new Date(doc.createdAt).getMonth()]}`
            : `${new Date(doc.start_date).getFullYear()}, ${AZ_MONTHS[new Date(doc.start_date).getMonth()]}`),
        start_date: doc.start_date || doc.createdAt,
        end_date: doc.end_date || doc.createdAt,
      },
      status_label: mapStatus(doc.status),
      raw_status: doc.status,
      cards: (doc.cards ?? []).map((c) => ({
        card_id: c?.card_id?._id ? String(c.card_id._id) : "",
        name: c?.card_id?.name ?? "",
        amount: safeNum(c?.balance),
        background_color: c?.card_id?.background_color ?? "",
        icon: c?.card_id?.icon ?? "",
      })),
    };

    return res.render("pages/emeliyyatlar/sirket/eqaime-details", {
      qaime: viewModel,
      qaime_id,
      csrfToken: req.csrfToken(),
    });
  } catch (e) {
    console.error("eqaimeDetailsView error:", e);
    return (
      res.status(500).render?.("pages/500") ??
      res.status(500).send("Server error")
    );
  }
};

export const eqaimeDetailsJson = async (req, res) => {
  try {
    const { qaime_id } = req.params;
    const {
      draw = 1,
      start = 0,
      length = 10,
      search = ""
    } = req.body || {};

    const doc = await EQaime.findOne({ qaime_id })
      .populate("sirket_id", "sirket_name sirket_id profile_image")
      .populate("cards.card_id", "name background_color icon")
      .lean();

    if (!doc) return res.status(404).json({ ok: false, message: "Tapılmadı" });

    const total = safeNum(doc.total_balance || doc.qaime_total || 0);

    // Search ve pagination işlemi
    let cards = (doc.cards || []).map(c => ({
      name: c.card_id?.name || "-",
      icon: c.card_id?.icon || "",
      background_color: c.card_id?.background_color || "",
      amount: safeNum(c.balance),
      percent: total > 0 ? +((safeNum(c.balance) * 100) / total).toFixed(2) : 0,
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      cards = cards.filter(c => c.name.toLowerCase().includes(searchLower));
    }

    const recordsTotal = doc.cards.length;
    const recordsFiltered = cards.length;

    const paginatedData = cards.slice(start, start + length);

    return res.json({
      draw: +draw,
      recordsTotal,
      recordsFiltered,
      data: paginatedData
    });
  } catch (e) {
    console.error("eqaimeDetailsJson error:", e);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const eqaimeDetails = async (req, res) => {
  try {
    const { qaime_id } = req.params;
    const doc = await EQaime.findOne({ qaime_id })
      .populate("sirket_id", "sirket_name sirket_id profile_image")
      .populate("cards.card_id", "name background_color icon")
      .lean();
    if (!doc) return res.status(404).json({ message: "Qaimə tapılmadı" });

    return res.json({
      company: doc.sirket_id
        ? {
            id: String(doc.sirket_id._id),
            name: doc.sirket_id.sirket_name || "",
            cm_id: doc.sirket_id.sirket_id || "",
            logo: doc.sirket_id.profile_image || "",
          }
        : null,
      invoice_no: doc.qaime_id,
      total_amount: Number(doc.total_balance || doc.qaime_total || 0),
      period: {
        label:
          doc.month ||
          (doc.createdAt
            ? `${new Date(doc.createdAt).getFullYear()} ${AZ_MONTHS[new Date(doc.createdAt).getMonth()]}`
            : "Bilinmir"),
        start_date: doc.start_date || doc.createdAt,
        end_date: doc.end_date || doc.createdAt,
      },
      status: mapStatus(doc.status),
      raw_status: doc.status,
      cards: (doc.cards || []).map((c) => ({
        card_id: c.card_id ? String(c.card_id._id) : "",
        name: c.card_id?.name || "",
        amount: Number(c.balance || 0),
        background_color: c.card_id?.background_color || "",
        icon: c.card_id?.icon || "",
      })),
    });
  } catch (e) {
    console.error("eqaimeDetails error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export const eqaimeApprove = async (req, res) => {
  try {
    const { qaime_id } = req.params;

    const doc = await EQaime.findOne({ qaime_id }).lean();
    if (!doc) {
      return res.status(404).json({ ok: false, message: "Qaimə tapılmadı" });
    }

    if (doc.status === "canceled") {
      return res
        .status(400)
        .json({ ok: false, message: "Ləğv edilmiş qaimə təsdiqlənə bilməz" });
    }

    if (doc.status === "tamamlandi") {
      return res.status(200).json({
        ok: true,
        alreadyApproved: true,
        invoice_no: doc.qaime_id,
        status: doc.status,
        status_label: mapStatus(doc.status),
        message: "Təsdiqlənib"
      });
    }

    const allowedFrom = ["passive", "waiting", "pending", "active"];

    const updated = await EQaime.findOneAndUpdate(
      { qaime_id, status: { $in: allowedFrom } },
      {
        $set: {
          status: "tamamlandi",
          admin_id: req.user?.id || doc.admin_id || null,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    const result = updated || (await EQaime.findOne({ qaime_id }).lean());
    if (!updated && result?.status !== "active") {
      return res.status(400).json({
        ok: false,
        message: "Qaiməni təsdiqləmək mümkün deyil",
      });
    }

    return res.status(200).json({
      ok: true,
      invoice_no: result.qaime_id,
      status: result.status,
      status_label: mapStatus(result.status),
      message: "Təsdiqləndi"
    });
  } catch (e) {
    console.error("eqaimeApprove error:", e);
    return res.status(500).json({ ok: false, message: "Server xətası" });
  }
};

export const eqaimeFolderByMonth = async (req, res) => {
  try {
    const { companyId, year, month } = req.params;
    const y = Number(year),
      m = Number(month);
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId))
      return res.status(400).json({ message: "companyId yanlışdır" });
    if (!y || !m || m < 1 || m > 12)
      return res.status(400).json({ message: "İl/ay düzgün deyil" });

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const filter = {
      sirket_id: companyId,
      start_date: { $lt: end },
      end_date: { $gte: start },
    };

    // Log the applied filter for debugging
    console.log("[EQAIME FOLDER] filter:", JSON.stringify(filter));

    const [company, docs] = await Promise.all([
      Sirket.findById(companyId)
        .select("sirket_name sirket_id profile_image")
        .lean(),
      EQaime.find(filter).lean(),
    ]);

    return res.json({
      company: company
        ? {
            id: String(company._id),
            name: company.sirket_name,
            cm_id: company.sirket_id,
            logo: company.profile_image,
          }
        : { id: companyId },
      period: { year: y, month: m },
      total: docs.length,
      data: docs.map((d) => ({
        id: String(d._id),
        invoice_no: d.qaime_id,
        amount: d.qaime_total,
        period: {
          label: d.month,
          start_date: d.start_date,
          end_date: d.end_date,
        },
        status: mapStatus(d.status),
        raw_status: d.status,
      })),
    });
  } catch (e) {
    console.error("eqaimeFolderByMonth error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};

// === NEW: month counts for E-qaimə ===
export const eqaimeMonthCounts = async (req, res) => {
  try {
    const { companyId, year } = req.params;

    if (!companyId) {
      return res.status(400).json({ ok: false, message: "Missing companyId" });
    }
    const y = Number(year);
    if (!y || y < 1900 || y > 3000) {
      return res.status(400).json({ ok: false, message: "Invalid year" });
    }

    // Year window [y-01-01, (y+1)-01-01)
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    // Prepare company filter that supports ObjectId OR string storage
    let companyMatch;
    try {
      const oid = new mongoose.Types.ObjectId(companyId);
      companyMatch = { $in: [oid, String(companyId)] };
    } catch {
      companyMatch = { $in: [String(companyId)] };
    }

    // Prefer start_date for grouping; fallback createdAt
    // Also compute a robust total_eff (prefer total_balance > 0, else qaime_total > 0, else sum cards? We just need count here, but returning total is useful)
    const pipeline = [
      {
        $match: {
          sirket_id: companyMatch,
          $or: [
            { start_date: { $gte: start, $lt: end } },
            { createdAt: { $gte: start, $lt: end } },
          ],
        },
      },
      {
        $addFields: {
          primaryDate: { $ifNull: ["$start_date", "$createdAt"] },
          total_eff: {
            $cond: [
              { $gt: ["$total_balance", 0] },
              "$total_balance",
              {
                $cond: [{ $gt: ["$qaime_total", 0] }, "$qaime_total", 0],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$primaryDate" } },
          count: { $sum: 1 },
          total: { $sum: "$total_eff" },
        },
      },
      { $project: { _id: 0, month: "$_id.month", count: 1, total: 1 } },
    ];

    const rows = await EQaime.aggregate(pipeline);

    // Normalize to 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const row = rows.find((r) => r.month === m);
      return {
        month: m,
        count: row?.count || 0,
        total: Number(row?.total || 0),
      };
    });

    return res.json({ ok: true, year: y, companyId, months });
  } catch (err) {
    console.error("eqaimeMonthCounts error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const eqaimeYearCounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res
        .status(400)
        .json({ ok: false, message: "companyId yanlışdır" });
    }

    // Group by year (prefer start_date; fallback to createdAt if missing)
    const agg = await EQaime.aggregate([
      { $match: { sirket_id: new mongoose.Types.ObjectId(companyId) } },
      {
        $addFields: {
          yearEff: {
            $cond: [
              { $ifNull: ["$start_date", false] },
              { $year: "$start_date" },
              { $year: "$createdAt" },
            ],
          },
        },
      },
      { $group: { _id: "$yearEff", count: { $sum: 1 } } },
      { $project: { _id: 0, year: "$_id", count: 1 } },
      { $sort: { year: -1 } },
    ]);

    return res.json({ ok: true, items: agg });
  } catch (e) {
    console.error("eqaimeYearCounts error:", e);
    return res.status(500).json({ ok: false, message: "Server xətası" });
  }
};
