import moment from "moment";
import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import HesablasmaReport from "../../shared/models/hesablashmaReport.js";
import i18n from "i18n";

export const sendToAvankart = async (req, res) => {
  try {
    const { invoice, invoice_id } = req.body;

    const invoiceId = invoice || invoice_id;

    if (!invoiceId || typeof invoiceId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const currentUser = await PartnerUser.findById(req.user.id);
    if (!currentUser || !currentUser.muessise_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }

    const hesablasma = await Hesablasma.findOne({
      hesablasma_id: invoiceId.trim(),
    });
    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: res.__("messages.hesablasma.error_finding_invoice", {
          invoice: invoiceId,
        }),
      });
    }

    if (hesablasma.status === "qaralama") {
      hesablasma.status = "waiting_aktiv";
      await hesablasma.save();
    } else if (hesablasma.status === "waiting_aktiv") {
      hesablasma.status = "aktiv";
      await hesablasma.save();
    } else if (hesablasma.status === "aktiv") {
      hesablasma.status = "waiting_tamamlandi";
      await hesablasma.save();
    } else if (hesablasma.status === "waiting_tamamlandi") {
      hesablasma.status = "tamamlandi";
      await hesablasma.save();
    }

    return res.json({
      success: true,
      message: res.__("messages.hesablasma.sent_to_avankart"),
      redirect: "/hesablashmalar",
    });
  } catch (err) {
    console.error("sendToAvankart error:", err);
    console.error("Request body:", req.body);
    console.error("User ID:", req.user?.id);

    return res.status(500).json({
      success: false,
      message: res.__("messages.hesablasma.error_sending_to_avankart"),
    });
  }
};

export const hesablasmalarTable = async (req, res) => {
  try {
    const { from, to, min_total, max_total, statuses, search } = req.body;

    const currentUser = await PartnerUser.findById(req.user.id);
    if (!currentUser || !currentUser.muessise_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }
    const filter = { muessise_id: currentUser.muessise_id };

    if (from || to) {
      filter.end_date = {};
      if (from) filter.end_date.$gte = new Date(from);
      if (to) filter.end_date.$lte = new Date(to);
    }

    if (min_total || max_total) {
      filter.yekun_mebleg = {};
      if (min_total) filter.yekun_mebleg.$gte = parseFloat(min_total);
      if (max_total) filter.yekun_mebleg.$lte = parseFloat(max_total);
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    const searchTerm =
      typeof search === "string"
        ? search
        : search && search.value
          ? search.value
          : null;
    if (searchTerm && searchTerm.trim()) {
      filter.hesablasma_id = { $regex: new RegExp(searchTerm.trim(), "i") };
    }

    const data = await Hesablasma.find(filter).lean();

    const statusMap = {
      qaralama: i18n.__("hesablasmalar.status_list.qaralama"),
      waiting: i18n.__("hesablasmalar.status_list.wait"),
      waiting_aktiv: i18n.__("hesablasmalar.status_list.waiting_aktiv"),
      waiting_tamamlandi: i18n.__(
        "hesablasmalar.status_list.waiting_tamamlandi"
      ),
      aktiv: i18n.__("hesablasmalar.status_list.aktiv"),
      reported: i18n.__("hesablasmalar.status_list.reported"),
      tamamlandi: i18n.__("hesablasmalar.status_list.tamamlandi"),
    };

    const result = data.map((item) => ({
      invoice: item.hesablasma_id,
      transactions: item.transaction_count,
      amount: item.total,
      commission: item.komissiya,
      total: item.yekun_mebleg,
      date: item.end_date?.toLocaleDateString("az-AZ") || "",
      status: statusMap[item.status] || item.status,
    }));

    return res.json({
      data: result,
      draw: req.body?.draw ?? 1,
      start: 1,
      length: 10,
    });
  } catch (err) {
    console.error("Error in hesablasmalarTable:", err);
    return res
      .status(500)
      .json({ error: res.__("errors.hesablasma.internal_server_error") });
  }
};

export const dataTablePost = async (req, res) => {
  try {
    const {
      start = 0,
      length = 10,
      draw = 1,
      from,
      to,
      cards,
      min_total,
      max_total,
      statuses,
      search = {},
      order = [],
      columns = [],
    } = req.body;

    const currentUser = await PartnerUser.findById(req.user.id);
    if (!currentUser?.muessise_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }

    console.log("Req body:", req.body);
    console.log("Raw date inputs - from:", from, "to:", to);

    const muessiseId = currentUser.muessise_id;

    const now = moment().endOf("day");
    const startDate = from
      ? moment(from, "YYYY-MM-DD").startOf("day").toDate()
      : moment().subtract(2, "years").startOf("day").toDate();
    const endDate = to
      ? moment(to, "YYYY-MM-DD").isAfter(now)
        ? now.toDate()
        : moment(to, "YYYY-MM-DD").endOf("day").toDate()
      : now.toDate();

    console.log("Parsed dates - startDate:", startDate, "endDate:", endDate);
    console.log("Date filter will match records where:");
    console.log("  from_date >= ", startDate);
    console.log("  end_date <= ", endDate);
    console.log(
      "Price filter values - min_total:",
      min_total,
      "max_total:",
      max_total
    );
    console.log(
      "Price filter types - min_total type:",
      typeof min_total,
      "max_total type:",
      typeof max_total
    );
    console.log(
      "Price filter will match records where totalBalance is between:",
      min_total,
      "and",
      max_total
    );

    const minTotalNum =
      min_total !== undefined && min_total !== null
        ? parseFloat(min_total)
        : null;
    const maxTotalNum =
      max_total !== undefined && max_total !== null
        ? parseFloat(max_total)
        : null;
    console.log(
      "Parsed price values - minTotalNum:",
      minTotalNum,
      "maxTotalNum:",
      maxTotalNum
    );

    const beforeDateFilter = await Hesablasma.countDocuments({
      muessise_id: muessiseId,
    });

    const withDateFilter = await Hesablasma.countDocuments({
      muessise_id: muessiseId,
      // FIXED: Use containment logic instead of overlap
      end_date: { $gte: startDate, $lte: endDate },
    });

    const safeLength = Math.max(1, parseInt(length) || 10);
    const safeStart = Math.max(0, parseInt(start) || 0);

    let searchValue = null;
    if (typeof search === "string" && search.trim()) {
      searchValue = search.trim();
    } else if (search && search.value && search.value.trim()) {
      searchValue = search.value.trim();
    }
    const searchRegex = searchValue ? new RegExp(searchValue, "i") : null;

    let sort = { end_date: -1 };
    if (order.length > 0) {
      const orderCol = order[0];
      const colIndex = orderCol.column;
      const dir = orderCol.dir === "asc" ? 1 : -1;
      const colName = columns[colIndex]?.data;

      if (colName) {
        if (
          [
            "invoice",
            "transactions",
            "amount",
            "commission",
            "total",
            "date",
            "status",
          ].includes(colName)
        ) {
          if (colName === "amount") sort = { grossAmount: dir };
          else if (colName === "commission") sort = { totalCommission: dir };
          else if (colName === "date") sort = { end_date: dir };
          else if (colName === "invoice") sort = { hesablasma_id: dir };
          else if (colName === "transactions") sort = { transactionCount: dir };
          else if (colName === "status") sort = { status: dir };
        }
      }
    }

    const hesablasmaOfThisMuessise = await Hesablasma.findOne({
      muessise_id: muessiseId,
    });

    const transcationsOfHesablasma = await TransactionsUser.find({
      hesablasma_id: hesablasmaOfThisMuessise._id,
    }).sort({ createdAt: -1 });

    const filteredCards = [];
    const cardIds = new Set();

    transcationsOfHesablasma.forEach((transaction) => {
      if (transaction.cards && !cardIds.has(transaction.cards._id.toString())) {
        filteredCards.push(transaction.cards);
        cardIds.add(transaction.cards._id.toString());
      }
    });

    const aggregatePipeline = [
      {
        $match: {
          muessise_id: muessiseId,
          // FIXED: Use containment logic instead of overlap
          // Record's end_date should be within the filter range
          end_date: { $gte: startDate, $lte: endDate },
          ...(Array.isArray(statuses) && statuses.length > 0
            ? { status: { $in: statuses } }
            : {}),
        },
      },

      {
        $lookup: {
          from: "transactionsusers",
          localField: "_id",
          foreignField: "hesablasma_id",
          as: "transactions",
        },
      },

      {
        $lookup: {
          from: "cards",
          localField: "transactions.cards",
          foreignField: "_id",
          as: "transactionCards",
        },
      },

      {
        $addFields: {
          transactionsSuccess: {
            $filter: {
              input: "$transactions",
              as: "t",
              cond: {
                $and: [
                  { $eq: ["$$t.status", "success"] },
                  ...(Array.isArray(cards) && cards.length > 0
                    ? [
                        {
                          $in: [
                            "$$t.cards",
                            cards.map((id) => new mongoose.Types.ObjectId(id)),
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
        },
      },

      ...(Array.isArray(cards) && cards.length > 0
        ? [
            {
              $match: {
                "transactionsSuccess.0": { $exists: true },
              },
            },
          ]
        : []),

      {
        $addFields: {
          grossAmount: {
            $sum: "$transactionsSuccess.amount",
          },
          totalCommission: {
            $sum: {
              $map: {
                input: "$transactionsSuccess",
                as: "trx",
                in: {
                  $divide: [
                    { $multiply: ["$$trx.amount", "$$trx.comission"] },
                    100,
                  ],
                },
              },
            },
          },
          transactionCount: { $size: "$transactionsSuccess" },
        },
      },

      {
        $addFields: {
          totalBalance: {
            $subtract: ["$grossAmount", "$totalCommission"],
          },
          debug_grossAmount: "$grossAmount",
          debug_totalCommission: "$totalCommission",
          debug_yekun_mebleg: "$yekun_mebleg",
        },
      },

      ...(minTotalNum !== null || maxTotalNum !== null
        ? [
            {
              $match: (() => {
                const priceMatch = {};
                if (minTotalNum !== null) {
                  priceMatch.yekun_mebleg = {
                    ...priceMatch.yekun_mebleg,
                    $gte: minTotalNum,
                  };
                }
                if (maxTotalNum !== null) {
                  priceMatch.yekun_mebleg = {
                    ...priceMatch.yekun_mebleg,
                    $lte: maxTotalNum,
                  };
                }
                console.log(
                  "Applying price match filter:",
                  JSON.stringify(priceMatch)
                );
                return priceMatch;
              })(),
            },
          ]
        : []),

      ...(searchRegex
        ? [
            {
              $match: {
                $or: [
                  { hesablasma_id: { $regex: searchRegex } },
                  { status: { $regex: searchRegex } },
                ],
              },
            },
          ]
        : []),

      // Sort
      {
        $sort: sort,
      },

      {
        $facet: {
          paginatedResults: [
            { $skip: safeStart },
            { $limit: safeLength },
            {
              $project: {
                invoice: "$hesablasma_id",
                transactions: "$transactionCount",
                amount: { $round: ["$grossAmount", 2] },
                commission: { $round: ["$totalCommission", 2] },
                total: { $round: ["$yekun_mebleg", 2] },
                date: {
                  $dateToString: {
                    format: "%d.%m.%Y",
                    date: "$end_date",
                    timezone: "Asia/Baku",
                  },
                },
                status: "$status",
                transactionCards: "$transactionCards",
                transactionsSuccess: "$transactionsSuccess",
                yekun_mebleg_original: "$yekun_mebleg",
                totalBalance_calculated: "$totalBalance",
                debug_grossAmount: "$debug_grossAmount",
                debug_totalCommission: "$debug_totalCommission",
                debug_yekun_mebleg: "$debug_yekun_mebleg",
                debug_priceFilterApplied: "$debug_priceFilterApplied",
                debug_yekun_mebleg_type: "$debug_yekun_mebleg_type",
                debug_yekun_mebleg_value: "$debug_yekun_mebleg_value",
              },
            },
          ],
          totalCounts: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Hesablasma.aggregate(aggregatePipeline);
    const data = result?.paginatedResults || [];
    const recordsFiltered = result?.totalCounts?.[0]?.count || 0;

    console.log("=== PRICE FILTER DEBUG ===");
    console.log(
      "Filter range: minTotalNum =",
      minTotalNum,
      "maxTotalNum =",
      maxTotalNum
    );
    console.log("Records found:", recordsFiltered);
    console.log("Sample data (first 3 records):");
    data.slice(0, 3).forEach((item, index) => {
      console.log(`Record ${index + 1}:`, {
        invoice: item.invoice,
        total: item.total,
        yekun_mebleg_original: item.yekun_mebleg_original,
        debug_yekun_mebleg: item.debug_yekun_mebleg,
        withinRange:
          item.yekun_mebleg_original >= minTotalNum &&
          item.yekun_mebleg_original <= maxTotalNum,
      });
    });
    console.log("=== END PRICE FILTER DEBUG ===");

    const enhancedData = data.map((item) => {
      const relatedCards = [];
      const cardIds = new Set();

      if (item.transactionsSuccess) {
        item.transactionsSuccess.forEach((transaction) => {
          if (transaction.cards && !cardIds.has(transaction.cards.toString())) {
            const cardInfo = filteredCards.find(
              (card) => card._id.toString() === transaction.cards.toString()
            );
            if (cardInfo) {
              relatedCards.push(cardInfo);
              cardIds.add(transaction.cards.toString());
            }
          }
        });
      }

      const { transactionsSuccess, transactionCards, ...cleanItem } = item;

      return {
        ...cleanItem,
        status: i18n.__(`hesablasmalar.status_list.${item.status}`),
        status_key: item.status,
        cards: relatedCards,
      };
    });

    const sliderAggregate = await Hesablasma.aggregate([
      {
        $match: {
          muessise_id: muessiseId,
          from_date: { $lte: endDate },
          end_date: { $gte: startDate },
          ...(Array.isArray(statuses) && statuses.length > 0
            ? { status: { $in: statuses } }
            : {}),
        },
      },
      {
        $lookup: {
          from: "transactionsusers",
          localField: "_id",
          foreignField: "hesablasma_id",
          as: "transactions",
        },
      },
      {
        $addFields: {
          transactionsSuccess: {
            $filter: {
              input: "$transactions",
              as: "t",
              cond: {
                $and: [
                  { $eq: ["$$t.status", "success"] },
                  ...(Array.isArray(cards) && cards.length > 0
                    ? [
                        {
                          $in: [
                            "$$t.cards",
                            cards.map((id) => new mongoose.Types.ObjectId(id)),
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          },
        },
      },
      ...(Array.isArray(cards) && cards.length > 0
        ? [
            {
              $match: {
                "transactionsSuccess.0": { $exists: true },
              },
            },
          ]
        : []),
      {
        $addFields: {
          grossAmount: {
            $sum: "$transactionsSuccess.amount",
          },
          totalCommission: {
            $sum: {
              $map: {
                input: "$transactionsSuccess",
                as: "trx",
                in: {
                  $divide: [
                    { $multiply: ["$$trx.amount", "$$trx.comission"] },
                    100,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          minAmount: { $min: "$yekun_mebleg" },
          maxAmount: { $max: "$yekun_mebleg" },
        },
      },
    ]);

    const recordsTotal = await Hesablasma.countDocuments({
      muessise_id: muessiseId,
    });

    const minAmount = sliderAggregate?.[0]?.minAmount || 0;
    const maxAmount = sliderAggregate?.[0]?.maxAmount || 30000;

    return res.json({
      success: true,
      draw: Number(draw),
      recordsTotal,
      recordsFiltered,
      data: enhancedData,
      minAmount: Math.floor(minAmount),
      maxAmount: Math.ceil(maxAmount),
    });
  } catch (err) {
    console.error("Error in dataTablePost:", err);
    return res
      .status(500)
      .json({ error: res.__("errors.hesablasma.internal_server_error") });
  }
};

export const addReport = async (req, res) => {
  try {
    const { report, hesablasma_id, redirect } = req.body;
    const userId = req.user.id;

    const user = await PartnerUser.findById({ _id: userId });

    if (!report || !hesablasma_id) {
      return res.status(400).json({
        success: false,
        message: res.__("messages.report.missing_fields"),
      });
    }

    const hesablasma = await Hesablasma.findOne({
      hesablasma_id: hesablasma_id,
      muessise_id: user.muessise_id,
    });

    if (!hesablasma) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.report.access_denied"),
      });
    }

    const cleanReport = sanitizeHtml(report);

    const newReport = new HesablasmaReport({
      message: cleanReport,
      invoice_number: hesablasma.hesablasma_id,
      creator: user.id,
      start_date: hesablasma.from_date,
      end_date: hesablasma.end_date,
      transaction_count: hesablasma.transaction_count,
      amount: hesablasma.total,
      status: "active",
    });
    hesablasma.status = "reported";
    await hesablasma.save();
    await newReport.save();

    return res.json({
      success: true,
      message: res.__("messages.report.successfully_created"),
      redirect: redirect
        ? "/hesablashmalar/" + hesablasma_id
        : "/hesablashmalar",
    });
  } catch (err) {
    console.error("Error in addReport:", err);
    return res.status(500).json({
      success: false,
      message: res.__("messages.report.server_error"),
    });
  }
};
