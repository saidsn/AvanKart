import mongoose from "mongoose";
import SettlementReport from "../../../../shared/models/hesablashmaReport.js";
import Sirket from "../../../../shared/models/sirketModel.js";
import Invoice from "../../../../shared/models/invoysSirketModel.js";
import InvoiceReport from "../../../../shared/models/invoiceReportModel.js";
import NotificationModel from "../../../../shared/models/notificationModel.js";

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
    ? "Tamamlanıb"
    : st === "baxildi"
      ? "Baxılıb"
      : st === "canceled"
        ? "Ləğv edilib"
        : st;

const safeNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

export const getHesablasma = async (req, res) => {
  try {
    const statusCounts = await Invoice.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: "$total_balance" },
        },
      },
    ]);

    const stats = {
      aktiv: 0,
      gozleyir: 0,
      tamamlandi: 0,
      reportEdildi: 0,
      toplamMebleg: 0,
    };

    statusCounts.forEach((item) => {
      switch (item._id) {
        case "aktiv":
          stats.aktiv = item.count;
          break;
        case "waiting":
        case "waiting_aktiv":
        case "waiting_tamamlandi":
          // Gözləyir məbləğini yüzlüklərə yuvarlaqlaşdır və .00 formatında saxla
          const rounded = Math.round(item.count / 100) * 100;
          stats.gozleyir += rounded;
          break;
        case "tamamlandi":
        case "complated":
          stats.tamamlandi = item.count;
          break;
        case "reported":
        case "reported_arasdirilir":
        case "reported_arasdirilir_yeniden_gonderildi":
          stats.reportEdildi += item.count;
          break;
      }
    });

    const totalAmountResult = await Invoice.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$total_balance" },
        },
      },
    ]);

    stats.toplamMebleg =
      totalAmountResult.length > 0 ? totalAmountResult[0].total?.toFixed(2) : 0;

    // Gözləyir məbləğini .00 formatında saxla
    stats.gozleyir = stats.gozleyir.toFixed(2);

    return res.render("pages/emeliyyatlar/sirket/hesablasma", {
      error: "",
      csrfToken: req.csrfToken(),
      statusCounts: stats,
      totalC: stats.toplamMebleg,
    });
  } catch (error) {
    console.error("getHesablasma error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const hesablasmaList = async (req, res) => {
  try {
    let {
      cardStatus,
      min,
      max,
      year,
      month,
      search = "",
      page = 1,
      limit = 10,
      start,
      length,
      draw,
      sirket_id,
    } = req.body || {};
    const filter = {};
    const status = cardStatus;

    if (sirket_id) filter.sirket_id = sirket_id;
    if (req.body && req.body.companyId) filter.sirket_id = req.body.companyId;

    // Status filter: default halda "complated", "tamamlandi", "active", "aktiv" statuslarını çıxar
    // Amma user bu statusları seçərsə, göstər
    const defaultExcludedStatuses = ["active", "aktiv"];

    if (status) {
      if (Array.isArray(status)) {
        // User statusları seçibsə, yalnız onları göstər
        filter.status = { $in: status };
      } else {
        // Tək status seçilibsə
        filter.status = status;
      }
    } else {
      // Əgər heç bir status filter seçilməyibsə, default exclude olunan statusları çıxar
      filter.status = { $nin: defaultExcludedStatuses };
    }
    if (typeof min === "number")
      filter.balance = { ...(filter.balance || {}), $gte: min };
    if (typeof max === "number")
      filter.balance = { ...(filter.balance || {}), $lte: max };

    if (year || month) {
      const y = Number(year) || new Date().getFullYear();
      const m0 = month ? Number(month) - 1 : 0;
      filter.createdAt = {
        $gte: new Date(y, m0, 1),
        $lt: new Date(y, month ? m0 + 1 : 12, 1),
      };
    }

    if (search && typeof search === "string" && search.trim()) {
      const term = search.trim();
      const or = [
        { invoice_id: { $regex: term, $options: "i" } },
        { status: { $regex: term, $options: "i" } },
      ];
      const n = Number(term);
      if (!Number.isNaN(n)) or.push({ balance: n });

      // Restoran adına görə axtarış üçün sirket_id populate
      // Şirkət adına görə axtarış etmək üçün əvvəlcə şirkətləri tapaq
      const matchingSirketIds = await Sirket.find({
        sirket_name: { $regex: term, $options: "i" }
      }).select('_id').lean();

      if (matchingSirketIds.length > 0) {
        or.push({ sirket_id: { $in: matchingSirketIds.map(s => s._id) } });
      }

      filter.$or = or;
    }

    const summaryAgg = await Invoice.aggregate([
      { $match: filter },
      {
        $facet: {
          total: [{ $group: { _id: null, sum: { $sum: "$balance" } } }],
        },
      },
    ]);
    const totalSum = Number(summaryAgg?.[0]?.total?.[0]?.sum || 0);

    const summary = {
      total: totalSum,
    };

    const hasDtPaging =
      Number.isFinite(Number(start)) || Number.isFinite(Number(length));
    const limitNum = hasDtPaging ? Number(length) || 10 : Number(limit) || 10;
    const skip = hasDtPaging
      ? Number(start) || 0
      : ((Number(page) || 1) - 1) * limitNum;
    const pageNum =
      hasDtPaging && limitNum > 0
        ? Math.floor(skip / limitNum) + 1
        : Number(page) || 1;

    const [rows, filteredCount, totalCount] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("sirket_id", "sirket_name sirket_id profile_image")
        .lean(),
      Invoice.countDocuments(filter),
      Invoice.countDocuments(),
    ]);

    const data = rows.map((d) => ({
      _id: String(d._id),
      id: String(d._id),
      doc_no: d.invoice_id,
      amount: Number(d.balance || 0),
      total_balance: Number(d.total_balance || 0),
      commission: Number(d.commission || 0),
      period: {
        label:
          d.start_date && d.end_date
            ? `${new Date(d.start_date).getFullYear()} ${AZ_MONTHS[new Date(d.start_date).getMonth()]}`
            : `${new Date(d.createdAt).getFullYear()} ${AZ_MONTHS[new Date(d.createdAt).getMonth()]}`,
        start_date: d.start_date,
        end_date: d.end_date,
      },
      date: `${new Date(d.createdAt).getFullYear()} ${AZ_MONTHS[new Date(d.createdAt).getMonth()]}`,
      status: mapStatus(d.status),
      raw_status: d.status,
      company: d.sirket_id
        ? {
            id: String(d.sirket_id._id),
            name: d.sirket_id.sirket_name || "",
            cm_id: d.sirket_id.sirket_id || "",
            logo: d.sirket_id.profile_image || "",
          }
        : null,
    }));

    return res.json({
      draw: Number(draw) || undefined,
      summary,
      data,
      page: pageNum,
      pageSize: limitNum,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
    });
  } catch (e) {
    console.error("hesablasmaList error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export const hesablasmaAmountRange = async (req, res) => {
  try {
    const agg = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: "$balance" },
          max: { $max: "$balance" },
          count: { $sum: 1 },
        },
      },
    ]);

    const min = Number(agg?.[0]?.min ?? 0) || 0;
    const max = Number(agg?.[0]?.max ?? 0) || 0;
    const count = Number(agg?.[0]?.count ?? 0) || 0;

    return res.json({ ok: true, min, max, count });
  } catch (e) {
    console.error("hesablasmaAmountRange error:", e);
    return res.status(500).json({ ok: false, message: "Server xətası" });
  }
};

export const hesablasmaFolderByMonth = async (req, res) => {
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

    const [company, docs] = await Promise.all([
      Sirket.findById(companyId)
        .select("sirket_name sirket_id profile_image")
        .lean(),
      SettlementReport.find({
        creator: companyId,
        createdAt: { $gte: start, $lt: end },
      }).lean(),
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
        doc_no: d.invoice_number,
        amount: d.amount,
        period: {
          label:
            d.start_date && d.end_date
              ? `${new Date(d.start_date).getFullYear()} ${AZ_MONTHS[new Date(d.start_date).getMonth()]}`
              : `${new Date(d.createdAt).getFullYear()} ${AZ_MONTHS[new Date(d.createdAt).getMonth()]}`,
          start_date: d.start_date,
          end_date: d.end_date,
        },
        status: mapStatus(d.status),
        raw_status: d.status,
      })),
    });
  } catch (e) {
    console.error("hesablasmaFolderByMonth error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export const hesablasmaTree = async (req, res) => {
  try {
    const invoices = await Invoice.aggregate([
      {
        $group: {
          _id: {
            sirket: "$sirket_id",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const sirkets = await Sirket.find().select(
      "_id sirket_id sirket_name logo createdAt"
    );

    const now = new Date();
    const currentYear = now.getFullYear();

    const result = [];

    sirkets.forEach((sirket) => {
      const sirketData = {
        _id: sirket._id,
        sirket_id: sirket.sirket_id,
        sirket_name: sirket.sirket_name,
        logo:
          sirket.profile_image ||
          sirket.logo ||
          "Avankart/Sirket/food-icon.svg",
        years: {},
      };

      const startYear = sirket.createdAt.getFullYear();

      for (let year = currentYear; year >= startYear; year--) {
        sirketData.years[year] = {};

        for (let month = 0; month <= 11; month++) {
          sirketData.years[year][month] = 0;
        }
      }

      result.push(sirketData);
    });

    invoices.forEach((item) => {
      const sirket = result.find((s) => s._id.equals(item._id.sirket));
      if (!sirket) return;

      const year = item._id.year;
      const month = item._id.month - 1;

      if (sirket.years[year]?.[month] !== undefined) {
        sirket.years[year][month] = item.count;
      }
    });

    return res.json({ data: result, success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const hesablasmaMonthCounts = async (req, res) => {
  try {
    const { companyId, year } = req.params;
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ ok: false, message: "Invalid companyId" });
    }
    const y = Number(year);
    if (!y || y < 1900 || y > 3000) {
      return res.status(400).json({ ok: false, message: "Invalid year" });
    }

    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    const pipeline = [
      {
        $match: {
          creator: new mongoose.Types.ObjectId(companyId),
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
              { $gt: ["$total", 0] },
              "$total",
              { $ifNull: ["$amount", 0] },
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

    const rows = await SettlementReport.aggregate(pipeline);

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
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const hesablasmaYearCounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res
        .status(400)
        .json({ ok: false, message: "companyId yanlışdır" });
    }

    const agg = await SettlementReport.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(companyId) } },
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
    return res.status(500).json({ ok: false, message: "Server xətası" });
  }
};

export const confirmHesablasma = async (req, res) => {
  const { invoice_id } = req.body;

  try {
    const invoice = await Invoice.findById({ _id: invoice_id });
    if (!invoice || !invoice.sirket_id)
      return res.json({ error: "Invoice not found" });

    const sirket = await Sirket.findById({ _id: invoice.sirket_id });
    if (!sirket) return res.json({ error: "Company not found" });
    sirket.sirket_balance += invoice.balance;
    await sirket.save();

    invoice.status = "complated";
    invoice.admin_id = req.user.id;
    await invoice.save();

    await NotificationModel.create({
      title: "Hesablaşma uğurla təsdiqləndi.",
      text: "Hesablaşma uğurla təsdiqləndi.",
      type: "notification",
      sirket_id: sirket,
      category: "corporate",
      creator: req.user.id,
      userModel: "PeopleUser",
    });

    return res.json({ success: true, message: "Updated" });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Server error" });
  }
};

export const reportHesablasma = async (req, res) => {
  const { invoice_id, message } = req.body;
  if (!message?.trim()) return res.json({ error: "Provide message" });

  try {
    const invoice = await Invoice.findById({ _id: invoice_id });
    if (!invoice) return res.json({ error: "Invoice not found" });

    const sirket = await Sirket.findById({ _id: invoice.sirket_id });
    if (!sirket) return res.json({ error: "Company not found" });

    const invoice_report = await InvoiceReport.create({
      invoice_id: invoice._id,
      sirket_id: invoice.sirket_id,
      admin_id: req.user.id,
      message: message,
      balance: invoice.balance,
      total_balance: invoice.total_balance,
      commission: invoice.commission,
      commission_percentage: invoice.commission_percentage,
    });

    invoice.status = "reported";
    await invoice.save();

    await NotificationModel.create({
      title: "Hesablaşma report edildi.",
      text: "Hesablaşma report edildi.",
      type: "notification",
      sirket_id: sirket,
      category: "corporate",
      creator: req.user.id,
      userModel: "PeopleUser",
    });

    return res.json({ success: true, message: "Report added" });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Server error" });
  }
};
