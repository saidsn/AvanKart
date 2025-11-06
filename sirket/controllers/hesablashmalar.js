import moment from "moment";
import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import HesablasmaReport from "../../shared/models/hesablashmaReport.js";
import i18n from "i18n";
import Invoice from "../../shared/models/invoysSirketModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import InvoiceReport from "../../shared/models/invoiceReportModel.js";

export const sendToAvankart = async (req, res) => {
  try {

    const { invoice } = req.body;

    if (!invoice || !invoice.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID göndərilmədi",
      });
    }

    const trimmedInvoice = invoice.trim();

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser || !currentUser.sirket_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }
    const hesablasma = await Invoice.findOne({
      _id: trimmedInvoice,
    });

    if (!hesablasma) {
      // Həmçinin ObjectId kimi axtarıb bax
      let hesablasmaById = null;
      if (mongoose.Types.ObjectId.isValid(trimmedInvoice)) {
        hesablasmaById = await Invoice.findById(trimmedInvoice);
      }

      if (!hesablasmaById) {
        return res.status(404).json({
          success: false,
          message: res.__("messages.hesablasma.error_finding_invoice", {
            invoice: trimmedInvoice,
          }),
        });
      }
      // Əgər ObjectId ilə tapıldısa onu işlət
      hesablasma = hesablasmaById;
    }

    if (hesablasma.status === "active") {
      hesablasma.status = "waiting";
      await hesablasma.save();
    } else if (hesablasma.status === "waiting_tamamlandi") {
      hesablasma.status = "tamamlandi";
      await hesablasma.save();
    }

    return res.json({
      success: true,
      message: res.__("messages.hesablasma.sent_to_avankart"),
      redirect: "/hesablashmalar/datatable",
    });
  } catch (err) {
    console.error("sendToAvankart error:", err);
    return res.status(500).json({
      success: false,
      message: res.__("messages.hesablasma.error_sending_to_avankart"),
    });
  }
};

export const hesablasmalarTable = async (req, res) => {
  try {
    const { start_date, end_date, min_total, max_total, statuses, search } =
      req.body;

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser || !currentUser.sirket_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }
    const filter = { sirket_id: currentUser.sirket_id };

    if (start_date || end_date) {
      filter.end_date = {};
      if (start_date) filter.end_date.$gte = new Date(start_date);
      if (end_date) filter.end_date.$lte = new Date(end_date);
    }

    if (min_total || max_total) {
      filter.yekun_mebleg = {};
      if (min_total) filter.yekun_mebleg.$gte = parseFloat(min_total);
      if (max_total) filter.yekun_mebleg.$lte = parseFloat(max_total);
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    const rawSearch =
      (typeof search === "string" ? search : search?.value) ||
      req.body?.["search[value]"] ||
      req.body?.q ||
      "";

    if (rawSearch) {
      filter.$or = [
        { invoice_id: { $regex: new RegExp(rawSearch, "i") } },
        { status: { $regex: new RegExp(rawSearch, "i") } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$invoice_id" },
              regex: rawSearch,
              options: "i",
            },
          },
        },
      ];
    }

    const data = await Invoice.find(filter).lean();

    const statusMap = {
      qaralama: i18n.__("hesablasmalar.status_list.qaralama"),
      waiting: i18n.__("hesablasmalar.status_list.wait"),
      waiting_aktiv: i18n.__("hesablasmalar.status_list.waiting_aktiv"),
      waiting_tamamlandi: i18n.__(
        "hesablasmalar.status_list.waiting_tamamlandi"
      ),
      aktiv: i18n.__("hesablasmalar.status_list.aktiv"),
      active: i18n.__("hesablasmalar.status_list.aktiv"),
      reported: i18n.__("hesablasmalar.status_list.reported"),
      tamamlandi: i18n.__("hesablasmalar.status_list.tamamlandi"),
      complated: i18n.__("hesablasmalar.status_list.tamamlandi"),
    };

    const result = data.map((item) => ({
      invoice: item.invoice_id,
      transactions: item.transaction_count,
      amount: item.total,
      commission: item.komissiya,
      total: item.yekun_mebleg,
      date: item.end_date?.toLocaleDateString("az-AZ") || "",
      statusName: statusMap[item.status] || item.status,
      status: item.status,
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

/* ===== ONLY FILTER FIX BELOW ===== */

function expandStatuses(list) {
  const set = new Set();
  (Array.isArray(list) ? list : []).forEach((raw) => {
    const v = String(raw || "")
      .toLowerCase()
      .trim();
    switch (v) {
      case "waiting":
      case "wait":
      case "gozleyir":
        set.add("waiting");
        set.add("waiting_aktiv");
        set.add("waiting_tamamlandi");
        break;
      case "active":
      case "aktiv":
        set.add("aktiv");
        set.add("active");
        break;
      case "completed":
      case "complete":
      case "tamamlandi":
      case "complated":
        set.add("tamamlandi");
        set.add("complated");
        set.add("completed");
        break;
      case "draft":
      case "qaralama":
        set.add("qaralama");
        break;
      case "reported":
      case "report":
        set.add("reported");
        set.add("reported_arasdirilir");
        set.add("reported_arasdirilir_yeniden");
        break;
      default:
        if (v) set.add(v);
    }
  });
  return Array.from(set);
}

export const dataTablePost = async (req, res) => {
  try {

    console.log("bura geldiiiiii")
    const {
      start = 0,
      length = 10,
      draw = 1,
      start_date: from,
      end_date: to,
      statuses,
      search = {},
      min_amount,
      max_amount,
      min_total,
      max_total,
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser?.sirket_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }

    const statusMap = { qaralama: i18n.__("hesablasmalar.status_list.qaralama"), 
      waiting: i18n.__("hesablasmalar.status_list.wait"), 
      waiting_aktiv: i18n.__("hesablasmalar.status_list.waiting_aktiv"), 
      waiting_tamamlandi: i18n.__( "hesablasmalar.status_list.waiting_tamamlandi" ), 
      aktiv: i18n.__("hesablasmalar.status_list.aktiv"), 
      active: i18n.__("hesablasmalar.status_list.aktiv"), 
      reported: i18n.__("hesablasmalar.status_list.reported"), 
      tamamlandi: i18n.__("hesablasmalar.status_list.tamamlandi"), 
      complated: i18n.__("hesablasmalar.status_list.tamamlandi"), };

    const sirketId = currentUser.sirket_id;
    const now = moment().endOf("day");
    const startDate = from
      ? moment(from, "YYYY-MM-DD").startOf("day").toDate()
      : moment().subtract(2, "years").startOf("day").toDate();
    const endDate = to
      ? moment(to, "YYYY-MM-DD").isAfter(now)
        ? now.toDate()
        : moment(to, "YYYY-MM-DD").endOf("day").toDate()
      : now.toDate();

    const normalizedStatuses = expandStatuses(statuses);

    const filter = {
      sirket_id: sirketId,
      createdAt: { $gte: startDate, $lte: endDate },
      ...(normalizedStatuses.length > 0 ? { status: { $in: normalizedStatuses } } : {}),
    };

    // Amount range filter - frontend-dan min_amount/max_amount və ya min_total/max_total gələ bilər
    const minVal = min_amount || min_total;
    const maxVal = max_amount || max_total;
    
    if (minVal !== undefined || maxVal !== undefined) {
      filter.balance = {};
      if (minVal !== undefined && !isNaN(parseFloat(minVal))) {
        filter.balance.$gte = parseFloat(minVal);
      }
      if (maxVal !== undefined && !isNaN(parseFloat(maxVal))) {
        filter.balance.$lte = parseFloat(maxVal);
      }
    }

    // search
    const rawSearchDT =
      (typeof search === "string" ? search : search?.value) ||
      req.body?.["search[value]"] ||
      req.body?.q ||
      "";
    if (rawSearchDT) {
      filter.$or = [
        { invoice_id: new RegExp(rawSearchDT, "i") },
        { status: new RegExp(rawSearchDT, "i") },
      ];
    }

    const safeLength = Math.max(1, parseInt(length) || 10);
    const safeStart = Math.max(0, parseInt(start) || 0);

    const recordsTotal = await Invoice.countDocuments({ sirket_id: sirketId });
    const recordsFiltered = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(safeStart)
      .limit(safeLength)
      .lean();

    // her invoice için son InvoiceReport
    const enhanced = await Promise.all(
      invoices.map(async (inv) => {
        const report = await InvoiceReport.findOne({ invoice_id: inv._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: inv._id,
          invoice_id: inv.invoice_id,
          amount: inv.balance,
          comission: inv.commission,
          commission_percentage: inv.commission_percentage,
          final_amount: inv.total_balance,
          settlement_date: moment(inv.createdAt).format("DD.MM.YYYY"),
          status_key: inv.status, 
          status: statusMap[inv.status] ?? inv.status,
          message: report?.message ?? '', // son rapor eklendi
        };
      })
    );

    return res.json({
      success: true,
      draw: Number(draw),
      recordsTotal,
      recordsFiltered,
      data: enhanced,
    });
  } catch (err) {
    console.error("Error in dataTablePost:", err);
    return res.status(500).json({
      error: res.__("errors.hesablasma.internal_server_error"),
    });
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
      redirect: redirect ? "/hesablashma/" + hesablasma_id : "/hesablashma",
    });
  } catch (err) {
    console.error("Error in addReport:", err);
    return res.status(500).json({
      success: false,
      message: res.__("messages.report.server_error"),
    });
  }
};

export const editInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    let { amount, balance } = req.body;
    const raw = (amount ?? balance ?? "").toString().trim();

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser?.sirket_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }

    const parsedAmount = Number(raw.replace(/[^\d.,-]/g, "").replace(",", "."));
    if (!(parsedAmount >= 0)) {
      return res.status(400).json({
        success: false,
        message:
          res.__("messages.hesablasma.invalid_amount") || "Məbləğ düzgün deyil",
      });
    }

    const invoiceIdStr = (invoiceId ?? "").toString().trim();
    const invoiceIdNum = Number(invoiceIdStr);
    const invoiceIdIsNum = !Number.isNaN(invoiceIdNum);

    const inv = await Invoice.findOne({
      sirket_id: currentUser.sirket_id,
      $or: [
        { invoice_id: invoiceIdStr },
        ...(invoiceIdIsNum ? [{ invoice_id: invoiceIdNum }] : []),
      ],
    });

    if (!inv) {
      return res.status(404).json({
        success: false,
        message:
          res.__("messages.hesablasma.error_finding_invoice", {
            invoice: invoiceIdStr,
          }) || "Invoice tapılmadı",
      });
    }

    inv.total = Number(parsedAmount.toFixed(2));

    const kom = Number(inv.komissiya) || 0;
    const yekun = Math.max(0, inv.total - kom);
    inv.yekun_mebleg = Number(yekun.toFixed(2));

    await inv.save();

    return res.json({
      success: true,
      message:
        res.__("messages.hesablasma.invoice_updated") || "Invoys yeniləndi",
      data: {
        invoice_id: inv.invoice_id,
        total: inv.total,
        komissiya:
          Number.isFinite(kom) && kom.toFixed ? Number(kom.toFixed(2)) : kom,
        yekun_mebleg: inv.yekun_mebleg,
      },
    });
  } catch (err) {
    console.error("editInvoice error:", err);
    return res.status(500).json({
      success: false,
      message:
        res.__("errors.hesablasma.internal_server_error") || "Server xətası",
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser?.sirket_id) {
      return res.status(403).json({
        success: false,
        message: res.__("messages.hesablasma.access_denied"),
      });
    }

    const inv = await Invoice.findOne({
      sirket_id: currentUser.sirket_id,
      invoice_id: invoiceId,
    });

    if (!inv) {
      return res.status(404).json({
        success: false,
        message:
          res.__("messages.hesablasma.error_finding_invoice", {
            invoice: invoiceId,
          }) || "Invoice tapılmadı",
      });
    }

    await Invoice.deleteOne({ _id: inv._id });

    return res.json({
      success: true,
      message:
        res.__("messages.hesablasma.invoice_deleted") || "Invoys silindi",
    });
  } catch (err) {
    console.error("deleteInvoice error:", err);
    return res.status(500).json({
      success: false,
      message:
        res.__("errors.hesablasma.internal_server_error") || "Server xətası",
    });
  }
};
