import mongoose from "mongoose";
import TransactionsUser from "../../../../shared/models/transactionsModel.js";
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
  st === "success"
    ? "Tamamlanıb"
    : st === "pending"
      ? "Gözləyir"
      : st === "failed"
        ? "Ləğv edilib"
        : st;

const safeNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

export const getIscilerinBalansi = async (req, res) => {
  try {
    return res.render("pages/emeliyyatlar/sirket/iscilerin-balansi", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("getIscilerinBalansi error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const iscilerinBalansiList = async (req, res) => {
  try {
    let {
      status,
      draw,
      min,
      max,
      year,
      month,
      search = "",
      page = 1,
      limit = 10,
      sirket_id,
    } = req.body || {};
    const filter = {
      status: "success", // Only return successful transactions by default
    };

    if (sirket_id) filter.from_sirket = sirket_id;

    if (status)
      filter.status = Array.isArray(status) ? { $in: status } : status;
    if (typeof min === "number")
      filter.amount = { ...(filter.amount || {}), $gte: min };
    if (typeof max === "number")
      filter.amount = { ...(filter.amount || {}), $lte: max };

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
        { transaction_id: { $regex: term, $options: "i" } },
        { status: { $regex: term, $options: "i" } },
      ];
      const n = Number(term);
      if (!Number.isNaN(n)) or.push({ amount: n });
      filter.$or = or;
    }

    const summaryAgg = await TransactionsUser.aggregate([
      { $match: filter },
      {
        $facet: {
          total: [{ $group: { _id: null, sum: { $sum: "$amount" } } }],
        },
      },
    ]);
    const totalSum = Number(summaryAgg?.[0]?.total?.[0]?.sum || 0);

    const summary = {
      total: totalSum,
    };

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [rows, totalCount, filteredCount] = await Promise.all([
      TransactionsUser.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("from_sirket", "sirket_name sirket_id profile_image")
        .populate("from", "name surname")
        .lean(),
      TransactionsUser.countDocuments(),
      TransactionsUser.countDocuments(filter),
    ]);

    const data = rows.map((d) => ({
      id: String(d._id),
      operation_no: d.transaction_id,
      amount: Number(d.amount || 0),
      period: {
        label: `${new Date(d.createdAt).getFullYear()} ${AZ_MONTHS[new Date(d.createdAt).getMonth()]}`,
        start_date: d.date,
        end_date: d.date,
      },
      status: mapStatus(d.status),
      raw_status: d.status,
      employee: d.from
        ? {
            id: String(d.from._id),
            name: `${d.from.name || ""} ${d.from.surname || ""}`.trim(),
          }
        : null,
      company: d.from_sirket
        ? {
            id: String(d.from_sirket._id),
            name: d.from_sirket.sirket_name || "",
            cm_id: d.from_sirket.sirket_id || "",
            logo: d.from_sirket.profile_image || "",
          }
        : null,
    }));

    return res.json({
      summary,
      draw,
      data,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      page: pageNum,
      pageSize: limitNum,
    });
  } catch (e) {
    console.error("iscilerinBalansiList error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export const iscilerinBalansiFolderByMonth = async (req, res) => {
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
      TransactionsUser.find({
        from_sirket: companyId,
        createdAt: { $gte: start, $lt: end },
        status: "success", // Only return successful transactions
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
        operation_no: d.transaction_id,
        amount: d.amount,
        period: {
          label: `${new Date(d.createdAt).getFullYear()} ${AZ_MONTHS[new Date(d.createdAt).getMonth()]}`,
          start_date: d.date,
          end_date: d.date,
        },
        status: mapStatus(d.status),
        raw_status: d.status,
      })),
    });
  } catch (e) {
    console.error("iscilerinBalansiFolderByMonth error:", e);
    return res.status(500).json({ message: "Server xətası" });
  }
};
