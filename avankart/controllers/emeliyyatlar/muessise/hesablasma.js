import mongoose from "mongoose";
import TransactionsUser from "../../../../shared/models/transactionsModel.js";
import Hesablasma from "../../../../shared/model/partner/Hesablasma.js";
import Muessise from "../../../../shared/models/muessiseModel.js";
import Cards from "../../../../shared/models/cardModel.js";
import CardsCategory from "../../../../shared/models/cardsCategoryModel.js";

export const getHesablasma = async (req, res) => {
  try {
    const totalCount = await Hesablasma.countDocuments({
      deleted: { $ne: true },
    });

    const statusCounts = await Hesablasma.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
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
        case "waiting_aktiv":
        case "waiting_tamamlandi":
          stats.gozleyir += item.count;
          break;
        case "tamamlandi":
          stats.tamamlandi = item.count;
          break;
        case "reported":
        case "reported_arasdirilir":
        case "reported_arasdirilir_yeniden_gonderildi":
          stats.reportEdildi += item.count;
          break;
      }
    });

    const totalAmountResult = await Hesablasma.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$yekun_mebleg" },
        },
      },
    ]);

    stats.toplamMebleg =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Müəssisələr siyahısını al
    const muessiseler = await Muessise.find(
      { deleted: { $ne: true } },
      { muessise_name: 1, muessise_id: 1, _id: 1 }
    ).sort({ muessise_name: 1 });

    return res.render("pages/emeliyyatlar/muessise/hesablasma", {
      title: "Hesablaşma",
      currentPath: req.path,
      error: "",
      csrfToken: req.csrfToken(),
      stats: stats,
      muessiseler: muessiseler || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

export const getHesablasmaJson = async (req, res) => {
  try {
    const { draw, start, length, search, ...filters } = req.body;

    const offset = parseInt(start) || 0;
    const limit = parseInt(length) || 10;
    const searchValue = search || "";

    let matchQuery = { deleted: { $ne: true } };

    // Aggregation pipeline for search with company name
    let pipeline = [];

    // Join with Muessise collection
    pipeline.push({
      $lookup: {
        from: "muessises",
        localField: "muessise_id",
        foreignField: "_id",
        as: "muessise_info",
      },
    });

    // Unwind the joined muessise info (will be single document)
    pipeline.push({
      $unwind: {
        path: "$muessise_info",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Search logic - can search by hesablasma_id, transaction_count, or company name
    if (searchValue) {
      let searchConditions = [
        { hesablasma_id: { $regex: searchValue, $options: "i" } },
        {
          "muessise_info.muessise_name": { $regex: searchValue, $options: "i" },
        },
        { "muessise_info.muessise_id": { $regex: searchValue, $options: "i" } },
        { status: { $regex: searchValue, $options: "i" } },
      ];

      // Əgər search value rəqəmdirsə, transaction_count-da da axtarış et
      if (!isNaN(searchValue) && searchValue.trim() !== "") {
        searchConditions.push({ transaction_count: parseInt(searchValue) });
      }

      matchQuery.$or = searchConditions;
    }

    // Add initial match stage for deleted check
    pipeline.push({ $match: { deleted: { $ne: true } } });

    // Tarix filterləri
    if (filters.start_date && filters.end_date) {
      pipeline.push({
        $match: {
          from_date: {
            $gte: new Date(filters.start_date),
            $lte: new Date(filters.end_date),
          },
        },
      });
    } else if (filters.start_date) {
      pipeline.push({
        $match: { from_date: { $gte: new Date(filters.start_date) } },
      });
    } else if (filters.end_date) {
      pipeline.push({
        $match: { end_date: { $lte: new Date(filters.end_date) } },
      });
    }

    // Müəssisə filter
    if (filters.muessise && filters.muessise.length > 0) {
      pipeline.push({
        $match: {
          muessise_id: {
            $in: filters.muessise.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      });
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      const statusMap = {
        success: "aktiv",
        fail: ["waiting_aktiv", "waiting_tamamlandi"],
        completed: "tamamlandi",
      };

      let mappedStatuses = [];
      filters.status.forEach((s) => {
        if (Array.isArray(statusMap[s])) {
          mappedStatuses.push(...statusMap[s]);
        } else {
          mappedStatuses.push(statusMap[s] || s);
        }
      });

      pipeline.push({
        $match: { status: { $in: mappedStatuses } },
      });
    }

    // Məbləğ filter
    if (filters.min_amount !== undefined && filters.max_amount !== undefined) {
      pipeline.push({
        $match: {
          yekun_mebleg: {
            $gte: parseFloat(filters.min_amount),
            $lte: parseFloat(filters.max_amount),
          },
        },
      });
    }

    // Add search conditions if exist
    if (searchValue && matchQuery.$or) {
      pipeline.push({ $match: { $or: matchQuery.$or } });
    }

    // console.log("Aggregation pipeline:", JSON.stringify(pipeline, null, 2));

    // Count total results using the same pipeline
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Hesablasma.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting, skip and limit to the main pipeline
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    // Execute aggregation
    const hesablasmalar = await Hesablasma.aggregate(pipeline);

    // Formatted data - muessise_info artıq aggregation-da var
    const formattedData = hesablasmalar.map((item) => {
      const muessise = item.muessise_info || {};

      let displayStatus = "";
      switch (item.status) {
        case "aktiv":
          displayStatus = "Aktiv";
          break;
        case "waiting_aktiv":
        case "waiting_tamamlandi":
          displayStatus = "Gözləyir";
          break;
        case "tamamlandi":
          displayStatus = "Tamamlandı";
          break;
        case "reported":
        case "reported_arasdirilir":
        case "reported_arasdirilir_yeniden_gonderildi":
          displayStatus = "Report edildi";
          break;
        default:
          displayStatus = item.status;
      }

      // Doğru məbləğ hesablaması
      const totalAmount = parseFloat(item.total) || 0;
      const commission = parseFloat(item.komissiya) || 0;
      const finalAmount = parseFloat(item.yekun_mebleg) || 0;

      return {
        id: item._id, // MongoDB ObjectId istifadə et
        objectId: item._id, // Ehtiyac olsa ObjectId-ni ayrıca saxla
        hesablasmaId: item.hesablasma_id, // Invoice nömrəsi ayrıca
        logo:
          muessise?.profile_image ||
          "/public/images/Avankart/muessise/gooryLogo.svg",
        companyName: muessise?.muessise_name || "N/A",
        companyId: muessise?.muessise_id || "N/A",
        invoice: item.hesablasma_id,
        transactionNumber: item.transaction_count || 0,
        amount: `${totalAmount.toFixed(2)} AZN`,
        commission: `${commission.toFixed(2)} AZN`,
        finalAmount: `${finalAmount.toFixed(2)} AZN`,
        date: `${item.from_date?.toLocaleDateString("az-AZ") || ""} - ${item.end_date?.toLocaleDateString("az-AZ") || ""}`,
        status: displayStatus,
        originalStatus: item.status,
      };
    });

    // Status statistics
    const statusStats = await Hesablasma.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$yekun_mebleg" },
        },
      },
    ]);

    const statistics = {
      pendingCount: 0,
      completedCount: 0,
      reportedCount: 0,
      totalAmount: 0,
    };

    statusStats.forEach((item) => {
      switch (item._id) {
        case "waiting_aktiv":
        case "waiting_tamamlandi":
          statistics.pendingCount += item.count;
          break;
        case "tamamlandi":
          statistics.completedCount += item.count;
          break;
        case "reported":
        case "reported_arasdirilir":
        case "reported_arasdirilir_yeniden_gonderildi":
          statistics.reportedCount += item.count;
          break;
      }
      statistics.totalAmount += item.totalAmount || 0;
    });

    const response = {
      draw: parseInt(draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: totalCount,
      data: formattedData,
      statistics,
    };

    return res.json(response);
  } catch (error) {
    console.error("getHesablasmaJson error:", error);
    return res.status(500).json({
      error: true,
      message: "Məlumatlar yüklənərkən xəta baş verdi",
      details: error.message,
    });
  }
};

export const approveHesablasma = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id);
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ hesablasma_id: hesablasma_id });
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    if (hesablasma.status === "tamamlandi") {
      return res.status(400).json({
        success: false,
        message: "Bu hesablaşma artıq təsdiqlənib",
      });
    }

    const oldStatus = hesablasma.status;
    hesablasma.status = "tamamlandi";
    hesablasma.avankart_admin = req.user?._id || null;
    hesablasma.approved_at = new Date();
    await hesablasma.save();

    return res.json({
      success: true,
      message: "Hesablaşma uğurla təsdiqləndi",
      data: {
        hesablasma_id: hesablasma._id,
        old_status: oldStatus,
        new_status: "tamamlandi",
        approved_at: hesablasma.approved_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Xəta baş verdi",
      error: error.message,
    });
  }
};

export const getHesablasmaDetailPage = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id).populate(
          "muessise_id",
          "muessise_name muessise_id profile_image address phone email"
        );
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      }).populate(
        "muessise_id",
        "muessise_name muessise_id profile_image address phone email"
      );
    }

    if (!hesablasma) {
      return res
        .status(404)
        .render("pages/emeliyyatlar/muessise/hesablasma-detail", {
          title: "Hesablaşma Tapılmadı",
          currentPath: req.path,
          error: "Hesablaşma tapılmadı",
          csrfToken: req.csrfToken(),
          hesablasma: null,
          cardExpenses: [],
          serviceCompanies: [],
          pdfLink: null,
        });
    }

    let displayStatus = "";
    switch (hesablasma.status) {
      case "aktiv":
        displayStatus = "Aktiv";
        break;
      case "waiting_aktiv":
      case "waiting_tamamlandi":
        displayStatus = "Gözləyir";
        break;
      case "tamamlandi":
        displayStatus = "Tamamlandı";
        break;
      case "reported":
      case "reported_arasdirilir":
      case "reported_arasdirilir_yeniden_gonderildi":
        displayStatus = "Report edildi";
        break;
      default:
        displayStatus = hesablasma.status;
    }

    const cardExpenses = [];
    let serviceCompanies = [];

    // Həqiqi kart xərclərini hesabla
    if (hesablasma.card_expenses && Array.isArray(hesablasma.card_expenses)) {
      hesablasma.card_expenses.forEach((expense) => {
        cardExpenses.push({
          category: expense.category || "Digər",
          amount: parseFloat(expense.amount) || 0,
          percentage: parseFloat(expense.percentage) || 0,
        });
      });
    }

    // Həqiqi service companies məlumatlarını əldə et
    try {
      const TransactionsUser = (
        await import("../../../../shared/models/transactionsModel.js")
      ).default;
      const Muessise = (
        await import("../../../../shared/models/muessiseModel.js")
      ).default;

      // Bu hesablasma üçün bütün tranzaksiyaları əldə et və şirkətlərə görə qruplaşdır
      const transactionAggregation = await TransactionsUser.aggregate([
        {
          $match: {
            hesablasma_id: hesablasma._id,
          },
        },
        {
          $group: {
            _id: "$to", // Şirkət ID-sinə görə qruplaşdır
            transactionCount: { $sum: 1 },
            totalAmount: { $sum: { $abs: "$amount" } },
          },
        },
      ]);

      // Şirkət məlumatlarını əldə et
      for (const group of transactionAggregation) {
        if (group._id && mongoose.Types.ObjectId.isValid(group._id)) {
          try {
            const company = await Muessise.findById(group._id);
            if (company) {
              serviceCompanies.push({
                id: company._id,
                name: company.muessise_name || "N/A",
                company_id: company.muessise_id || "N/A",
                logo:
                  company.profile_image ||
                  "/images/Avankart/muessise/demo-company-logo.svg",
                transactionCount: group.transactionCount || 0,
                amount: group.totalAmount || 0,
              });
            }
          } catch (error) {}
        }
      }

      // Əgər heç bir service company tapılmazsa, hesablasma model-indən istifadə et
      if (
        serviceCompanies.length === 0 &&
        hesablasma.service_companies &&
        Array.isArray(hesablasma.service_companies)
      ) {
        hesablasma.service_companies.forEach((company) => {
          serviceCompanies.push({
            id: company.company_id || company._id || "N/A",
            name: company.company_name || "N/A",
            company_id: company.company_id || "N/A",
            logo:
              company.logo || "/images/Avankart/muessise/demo-company-logo.svg",
            transactionCount: parseInt(company.transaction_count) || 0,
            amount: parseFloat(company.amount) || 0,
          });
        });
      }
    } catch (error) {
      console.error("Error fetching service companies:", error);
      // Fallback to model data if query fails
      if (
        hesablasma.service_companies &&
        Array.isArray(hesablasma.service_companies)
      ) {
        hesablasma.service_companies.forEach((company) => {
          serviceCompanies.push({
            id: company.company_id || company._id || "N/A",
            name: company.company_name || "N/A",
            company_id: company.company_id || "N/A",
            logo:
              company.logo || "/images/Avankart/muessise/demo-company-logo.svg",
            transactionCount: parseInt(company.transaction_count) || 0,
            amount: parseFloat(company.amount) || 0,
          });
        });
      }
    }

    const templateData = {
      title: "Hesablaşma Detalları",
      currentPath: req.path,
      hesablasma: {
        id: hesablasma._id,
        hesablasma_id: hesablasma.hesablasma_id,
        transaction_count: hesablasma.transaction_count || 0,
        total: parseFloat(hesablasma.total) || 0,
        komissiya: parseFloat(hesablasma.komissiya) || 0,
        yekun_mebleg: parseFloat(hesablasma.yekun_mebleg) || 0,
        from_date: hesablasma.from_date,
        end_date: hesablasma.end_date,
        status: displayStatus,
        originalStatus: hesablasma.status,

        // Müəssisə məlumatları tam şəkildə təqdim et
        company: {
          name: hesablasma.muessise_id?.muessise_name || "N/A",
          id: hesablasma.muessise_id?.muessise_id || "N/A",
          logo: hesablasma.muessise_id?.profile_image || "/default-logo.png",
          address: hesablasma.muessise_id?.address || "N/A",
          phone: Array.isArray(hesablasma.muessise_id?.phone)
            ? hesablasma.muessise_id.phone[0]?.number || "N/A"
            : hesablasma.muessise_id?.phone || "N/A",
          email: Array.isArray(hesablasma.muessise_id?.email)
            ? hesablasma.muessise_id.email[0] || "N/A"
            : hesablasma.muessise_id?.email || "N/A",
        },
      },
      cardExpenses: cardExpenses,
      serviceCompanies: serviceCompanies,

      pdfLink:
        hesablasma.pdf_file_path ||
        `/api/hesablasma/${hesablasma._id}/generate-pdf`,
      error: "",
      csrfToken: req.csrfToken(),
    };

    return res.render(
      "pages/emeliyyatlar/muessise/hesablasma-detail",
      templateData
    );
  } catch (error) {
    console.error("getHesablasmaDetailPage error:", error);
    return res
      .status(500)
      .render("pages/emeliyyatlar/muessise/hesablasma-detail", {
        title: "Xəta",
        styles: "Xəta baş verdi",
        currentPath: req.path,
        error: "Məlumatlar yüklənərkən xəta baş verdi",
        csrfToken: req.csrfToken(),
        hesablasma: null,
        cardExpenses: [],
        serviceCompanies: [],
        pdfLink: null,
      });
  }
};

export const getHesablasmaDetailApi = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;
    console.log("hesablasma_id:", hesablasma_id);

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        console.log("ObjectId kimi axtarır...");
        hesablasma = await Hesablasma.findById(hesablasma_id).populate(
          "muessise_id",
          "muessise_name muessise_id profile_image address phone email"
        );
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      console.log("hesablasma_id field-i ilə axtarır...");
      hesablasma = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      }).populate(
        "muessise_id",
        "muessise_name muessise_id profile_image address phone email"
      );
      console.log("hesablasma_id field-i ilə tapıldı:", !!hesablasma);
    }

    if (!hesablasma) {
      console.log("Hesablasma tapılmadı, 404 return edir");
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    const cardExpenses = [];
    let serviceCompanies = [];

    if (hesablasma.card_expenses && Array.isArray(hesablasma.card_expenses)) {
      hesablasma.card_expenses.forEach((expense) => {
        cardExpenses.push({
          category: expense.category || "Digər",
          amount: parseFloat(expense.amount) || 0,
          percentage: parseFloat(expense.percentage) || 0,
        });
      });
    }

    // Həqiqi tranzaksiyaları həmin hesablasma dövrü ərzində əldə et
    try {
      const TransactionsUser = (
        await import("../../../../shared/models/transactionsModel.js")
      ).default;
      const Muessise = (
        await import("../../../../shared/models/muessiseModel.js")
      ).default;
      const Sirket = (await import("../../../../shared/models/sirketModel.js"))
        .default;
      const PeopleUser = (
        await import("../../../../shared/models/peopleUserModel.js")
      ).default;

      console.log("Hesablasma date range:", {
        from_date: hesablasma.from_date,
        end_date: hesablasma.end_date,
      });

      // Bu hesablasma dövrü ərzində müəssisə ilə bağlı bütün tranzaksiyaları əldə et
      let transactions = await TransactionsUser.find({
        to: hesablasma.muessise_id._id,
        createdAt: {
          $gte: hesablasma.from_date,
          $lte: hesablasma.end_date,
        },
        status: "success", // Yalnız uğurlu tranzaksiyalar
      })
        .populate(
          "from",
          "name surname people_id phone email profile_image sirket_id"
        )
        .populate(
          "from_sirket",
          "sirket_name sirket_id profile_image address phone"
        )
        .sort({ createdAt: -1 });

      console.log("Found transactions count:", transactions.length);

      // Əgər from_sirket null-dursa, from.sirket_id-dən sirket məlumatlarını əldə et
      for (let i = 0; i < transactions.length; i++) {
        if (
          !transactions[i].from_sirket &&
          transactions[i].from &&
          transactions[i].from.sirket_id
        ) {
          const sirket = await Sirket.findById(
            transactions[i].from.sirket_id
          ).select("sirket_name sirket_id profile_image address phone");
          if (sirket) {
            transactions[i].from_sirket = sirket;
          }
        }
      }

      // Tranzaksiyaları şirkətlərə görə qruplaşdır
      const groupedCompanies = {};

      transactions.forEach((transaction) => {
        const fromUser = transaction.from;
        const fromSirket = transaction.from_sirket;

        // Şirkət məlumatlarını əldə et
        const companyName =
          fromSirket?.sirket_name ||
          `${fromUser?.name || ""} ${fromUser?.surname || ""}`.trim() ||
          "N/A";

        const companyId =
          fromSirket?.sirket_id ||
          fromUser?.people_id ||
          fromUser?.phone ||
          "N/A";

        const logo =
          fromSirket?.profile_image ||
          fromUser?.profile_image ||
          "/images/Avankart/muessise/demo-company-logo.svg";

        // Qrup key-i olaraq company ID istifadə et
        const groupKey = companyId;

        if (!groupedCompanies[groupKey]) {
          groupedCompanies[groupKey] = {
            id: fromSirket?._id || fromUser?._id || transaction._id,
            companyName: companyName,
            companyId: companyId,
            logo: logo,
            transactionCount: 0,
            totalAmount: 0,
            transactions: [],
          };
        }

        // Tranzaksiyaları əlavə et
        groupedCompanies[groupKey].transactionCount += 1;
        groupedCompanies[groupKey].totalAmount +=
          Math.abs(transaction.amount) || 0;
        groupedCompanies[groupKey].transactions.push(transaction);
      });

      // Qruplaşdırılmış şirkətləri serviceCompanies array-inə çevir
      serviceCompanies = Object.values(groupedCompanies).map((group) => ({
        id: group.id,
        companyName: group.companyName,
        companyId: group.companyId,
        logo: group.logo,
        transactionCount: group.transactionCount,
        amount: group.totalAmount,
        // DataTable üçün əlavə field-lər
        name: group.companyName, // EJS template üçün
        transactionNumber: group.transactionCount, // DataTable column üçün
      }));

      console.log("Grouped companies for DataTable:", serviceCompanies.length);

      // Əgər heç bir service company tapılmazsa, hesablasma model-indən istifadə et
      if (
        serviceCompanies.length === 0 &&
        hesablasma.service_companies &&
        Array.isArray(hesablasma.service_companies)
      ) {
        hesablasma.service_companies.forEach((company) => {
          serviceCompanies.push({
            id: company.company_id || company._id || "N/A",
            name: company.company_name || "N/A",
            companyId: company.company_id || "N/A",
            logo:
              company.logo || "/images/Avankart/muessise/demo-company-logo.svg",
            transactionCount: parseInt(company.transaction_count) || 0,
            amount: parseFloat(company.amount) || 0,
            date: company.date || new Date().toISOString().split("T")[0],
          });
        });
      }
    } catch (error) {
      console.error("Error fetching service companies:", error);
      // Fallback to model data if query fails
      if (
        hesablasma.service_companies &&
        Array.isArray(hesablasma.service_companies)
      ) {
        hesablasma.service_companies.forEach((company) => {
          serviceCompanies.push({
            id: company.company_id || company._id || "N/A",
            companyName: company.company_name || "N/A", // DataTable üçün companyName
            companyId: company.company_id || "N/A",
            logo:
              company.logo || "/images/Avankart/muessise/demo-company-logo.svg",
            transactionNumber: parseInt(company.transaction_count) || 0, // DataTable üçün transactionNumber
            amount: parseFloat(company.amount) || 0,
            date: company.date || new Date().toISOString().split("T")[0],
          });
        });
      }
    }

    const filterByDateRange = (startDate, endDate) => {
      if (!startDate || !endDate) return serviceCompanies;
      return serviceCompanies.filter((company) => {
        const companyDate = new Date(company.date);
        return (
          companyDate >= new Date(startDate) && companyDate <= new Date(endDate)
        );
      });
    };

    const filterByAmount = (minAmount, maxAmount) => {
      return serviceCompanies.filter(
        (company) => company.amount >= minAmount && company.amount <= maxAmount
      );
    };

    const filterByTransactionCount = (minCount, maxCount) => {
      return serviceCompanies.filter(
        (company) =>
          company.transactionCount >= minCount &&
          company.transactionCount <= maxCount
      );
    };

    const detailData = {
      hesablasma: {
        id: hesablasma._id,
        hesablasma_id: hesablasma.hesablasma_id,
        transaction_count: hesablasma.transaction_count || 0,
        total: parseFloat(hesablasma.total) || 0,
        komissiya: parseFloat(hesablasma.komissiya) || 0,
        yekun_mebleg: parseFloat(hesablasma.yekun_mebleg) || 0,
        from_date: hesablasma.from_date,
        end_date: hesablasma.end_date,
        status: hesablasma.status,

        company: {
          name: hesablasma.muessise_id?.muessise_name || "N/A",
          id: hesablasma.muessise_id?.muessise_id || "N/A",
          logo: hesablasma.muessise_id?.profile_image || "/default-logo.png",
          address: hesablasma.muessise_id?.address || "N/A",
          phone: Array.isArray(hesablasma.muessise_id?.phone)
            ? hesablasma.muessise_id.phone[0]?.number || "N/A"
            : hesablasma.muessise_id?.phone || "N/A",
          email: Array.isArray(hesablasma.muessise_id?.email)
            ? hesablasma.muessise_id.email[0] || "N/A"
            : hesablasma.muessise_id?.email || "N/A",
        },

        faktura: {
          hasFile: !!(hesablasma.faktura && hesablasma.faktura.path),
          fileName: hesablasma.faktura?.fileName || null,
          uploadedAt: hesablasma.faktura?.added_at || null,
          uploadedBy: hesablasma.faktura?.added_by || null,
          userType: hesablasma.faktura?.userRef || null,
        },
      },

      cardExpenses: cardExpenses,
      serviceCompanies: serviceCompanies,
      pdfLink:
        hesablasma.pdf_file_path ||
        `/api/hesablasma/${hesablasma._id}/generate-pdf`,
    };

    console.log("Response hazırlanır...");
    console.log("serviceCompanies count:", serviceCompanies.length);
    console.log("serviceCompanies sample:", serviceCompanies[0]);

    // DataTable üçün format - sadəcə data array qaytaraq
    return res.json({
      data: serviceCompanies,
      recordsTotal: serviceCompanies.length,
      recordsFiltered: serviceCompanies.length,
      draw: req.query.draw || 1,
    });
  } catch (error) {
    console.error("getHesablasmaDetailApi error:", error);
    return res.status(500).json({
      success: false,
      message: "Məlumatlar yüklənərkən xəta baş verdi",
      details: error.message,
    });
  }
};

export const generateHesablasmaPDF = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id).populate(
          "muessise_id",
          "muessise_name muessise_id profile_image address phone email"
        );
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      }).populate(
        "muessise_id",
        "muessise_name muessise_id profile_image address phone email"
      );
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    const fs = await import("fs");
    const path = await import("path");

    const pdfDir = path.join(process.cwd(), "public", "files", "hesablasma");
    const pdfFileName = `${hesablasma._id}_report.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    if (fs.existsSync(pdfPath)) {
      return res.download(
        pdfPath,
        `hesablasma_${hesablasma.hesablasma_id}.pdf`
      );
    }

    const pdfContent = `
      Hesablaşma Hesabatı
      ==================
      
      Müəssisə: ${hesablasma.muessise_id?.muessise_name || "N/A"}
      İnvoys nömrəsi: ${hesablasma.hesablasma_id}
      Tranzaksiya sayı: ${hesablasma.transaction_count}
      Məbləğ: ${hesablasma.total} AZN
      Komissiya: ${hesablasma.komissiya} AZN
      Yekun məbləğ: ${hesablasma.yekun_mebleg} AZN
      Tarix: ${hesablasma.from_date} - ${hesablasma.end_date}
      Status: ${hesablasma.status}
      
      Bu hesabat Avankart tərəfindən yaradılmışdır.
    `;

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    fs.writeFileSync(pdfPath.replace(".pdf", ".txt"), pdfContent);

    hesablasma.pdf_file_path = `/files/hesablasma/${pdfFileName}`;
    await hesablasma.save();

    return res.json({
      success: true,
      message: "PDF uğurla yaradıldı",
      downloadUrl: `/api/hesablasma/${hesablasma._id}/download-pdf`,
      viewUrl: `/files/hesablasma/${pdfFileName}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "PDF yaradılarkən xəta baş verdi",
    });
  }
};

export const downloadHesablasmaPDF = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id);
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ hesablasma_id: hesablasma_id });
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    const path = await import("path");
    const fs = await import("fs");

    const pdfDir = path.join(process.cwd(), "public", "files", "hesablasma");
    const pdfFileName = `${hesablasma._id}_report.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    const txtPath = pdfPath.replace(".pdf", ".txt");

    if (fs.existsSync(txtPath)) {
      return res.download(
        txtPath,
        `hesablasma_${hesablasma.hesablasma_id}.txt`
      );
    } else if (fs.existsSync(pdfPath)) {
      return res.download(
        pdfPath,
        `hesablasma_${hesablasma.hesablasma_id}.pdf`
      );
    } else {
      return res.status(404).json({
        success: false,
        message: "PDF faylı tapılmadı",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "PDF yüklənərkən xəta baş verdi",
    });
  }
};

export const uploadFaktura = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;
    const { originalname, filename, path: filePath } = req.file;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id);
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ hesablasma_id: hesablasma_id });
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    hesablasma.faktura = {
      added_by: req.user._id,
      userRef: "AdminUser",
      path: filePath,
      fileName: originalname,
      added_at: new Date(),
    };

    await hesablasma.save();

    return res.json({
      success: true,
      message: "Faktura uğurla yükləndi",
      data: {
        fileName: originalname,
        uploadedAt: hesablasma.faktura.added_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Faktura yüklənərkən xəta baş verdi",
    });
  }
};

export const downloadFaktura = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id);
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ hesablasma_id: hesablasma_id });
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    if (!hesablasma.faktura || !hesablasma.faktura.path) {
      return res.status(404).json({
        success: false,
        message: "Faktura faylı tapılmadı",
      });
    }

    const path = await import("path");
    const fs = await import("fs");

    const fakturaPath = path.join(process.cwd(), hesablasma.faktura.path);

    if (!fs.existsSync(fakturaPath)) {
      return res.status(404).json({
        success: false,
        message: "Faktura faylı mövcud deyil",
      });
    }

    return res.download(fakturaPath, hesablasma.faktura.fileName);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Faktura yüklənərkən xəta baş verdi",
    });
  }
};

export const deleteFaktura = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    // İlk öncə ObjectId kimi axtarış et
    let hesablasma = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasma = await Hesablasma.findById(hesablasma_id);
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id field-i ilə axtar
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ hesablasma_id: hesablasma_id });
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    if (!hesablasma.faktura || !hesablasma.faktura.path) {
      return res.status(404).json({
        success: false,
        message: "Faktura faylı tapılmadı",
      });
    }

    const path = await import("path");
    const fs = await import("fs");

    const fakturaPath = path.join(process.cwd(), hesablasma.faktura.path);

    if (fs.existsSync(fakturaPath)) {
      fs.unlinkSync(fakturaPath);
    }

    hesablasma.faktura = {
      added_by: null,
      userRef: null,
      path: null,
      fileName: null,
      added_at: null,
    };

    await hesablasma.save();

    return res.json({
      success: true,
      message: "Faktura uğurla silindi",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Faktura silinərkən xəta baş verdi",
    });
  }
};

// Helper function for status display
function getStatusDisplay(status) {
  switch (status) {
    case "aktiv":
      return "Aktiv";
    case "waiting_aktiv":
    case "waiting_tamamlandi":
      return "Gözləyir";
    case "tamamlandi":
      return "Tamamlandı";
    case "reported":
    case "reported_arasdirilir":
    case "reported_arasdirilir_yeniden_gonderildi":
      return "Report edildi";
    default:
      return status;
  }
}

export const getHesablasmaTransactionsPage = async (req, res) => {
  try {
    const { hesablasma_id, company_id } = req.params;

    // DEBUG: print params for page
    console.log("[TRX.PAGE] params:", {
      raw_hesablasma_id: hesablasma_id,
      raw_company_id: company_id,
    });

    console.log(
      `Getting transactions for hesablasma: ${hesablasma_id}, company: ${company_id}`
    );

    // Validate company_id - must be a valid ObjectId
    if (company_id && !mongoose.Types.ObjectId.isValid(company_id)) {
      console.error(`Invalid company_id format: ${company_id}`);
      return res
        .status(400)
        .render("pages/emeliyyatlar/muessise/hesablasma-transactions", {
          title: "Səhv parametr",
          currentPath: req.path,
          company: null,
          hesablasma: null,
          cardExpenses: [],
          transactions: { data: [] },
          pdfLink: null,
          csrfToken: req.csrfToken(),
          error: "Şirkət ID-si düzgün formatda deyil",
        });
    }

    // Real hesablasma məlumatlarını əldə et
    let hesablasmaData = null;
    if (hesablasma_id && mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      try {
        hesablasmaData = await Hesablasma.findById(hesablasma_id).populate(
          "muessise_id",
          "muessise_name muessise_id profile_image"
        );
      } catch (error) {
        console.log(
          "Could not find hesablasma by ObjectId, trying by hesablasma_id"
        );
      }
    }

    // Əgər ObjectId ilə tapılmadısa, hesablasma_id ilə axtar
    if (!hesablasmaData) {
      hesablasmaData = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      }).populate("muessise_id", "muessise_name muessise_id profile_image");
    }

    if (!hesablasmaData) {
      return res
        .status(404)
        .render("pages/emeliyyatlar/muessise/hesablasma-transactions", {
          title: "Hesablaşma tapılmadı",
          currentPath: req.path,
          company: null,
          hesablasma: null,
          cardExpenses: [],
          transactions: { data: [] },
          pdfLink: null,
          csrfToken: req.csrfToken(),
          error: "Hesablaşma tapılmadı",
        });
    }

    // Həqiqi tranzaksiya məlumatlarını əldə et
    const TransactionsUser = (
      await import("../../../../shared/models/transactionsModel.js")
    ).default;

    // Tranzaksiyaları əldə et - həm hesablasma_id həm də from_sirket əsasında
    const transactions = await TransactionsUser.find({
      to: hesablasmaData.muessise_id._id,
      createdAt: {
        $gte: hesablasmaData.from_date,
        $lte: hesablasmaData.end_date,
      },
      status: "success",
      ...(company_id &&
        mongoose.Types.ObjectId.isValid(company_id) && {
          from_sirket: company_id,
        }),
    })
      .populate("from", "name surname people_id phone email profile_image") // İstifadəçi məlumatları
      .populate("from_sirket", "sirket_name sirket_id profile_image") // Şirkət məlumatları
      .populate("to", "muessise_name muessise_id") // Müəssisə məlumatları
      .populate("cardCategory", "category_name") // Kateqoriya məlumatları
      .sort({ createdAt: -1 });

    // Tranzaksiyaları frontend formatına çevir
    const formattedTransactions = transactions.map((transaction, index) => {
      const fromUser = transaction.from;
      const fromSirket = transaction.from_sirket;

      return {
        id: transaction._id,
        istifadeci: fromUser
          ? `${fromUser.name || ""} ${fromUser.surname || ""}`.trim()
          : "N/A",
        people_id: fromUser ? fromUser.people_id || fromUser.phone : "N/A",
        tranzaksiya_id:
          transaction.transaction_id ||
          `TRX-${transaction._id.toString().slice(-8)}`,
        kart_kateqoriyasi: getCardCategoryFromAmount(transaction.amount), // Məbləğə görə kateqoriya təyin et
        mebleg: Math.abs(transaction.amount) || 0,
        mekan: transaction.to ? transaction.to.muessise_name : "Veyseloğlu MMC",
        tarix: transaction.createdAt
          ? new Date(transaction.createdAt).toLocaleDateString("az-AZ") +
            " - " +
            new Date(transaction.createdAt).toLocaleTimeString("az-AZ", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "N/A",
      };
    });

    // Kart kateqoriyası təyin etmək üçün helper function
    function getCardCategoryFromAmount(amount) {
      const absAmount = Math.abs(amount || 0);
      if (absAmount >= 500) return "Yemək";
      if (absAmount >= 300) return "Hadiyyə";
      if (absAmount >= 200) return "Yanacaq";
      if (absAmount >= 100) return "Memket";
      if (absAmount >= 75) return "Niyaş";
      if (absAmount >= 50) return "Premium";
      return "Avto Yuma";
    }

    // Şirkət məlumatını əldə et
    const Sirket = (await import("../../../../shared/models/sirketModel.js"))
      .default;
    let companyInfo = null;

    if (company_id && mongoose.Types.ObjectId.isValid(company_id)) {
      try {
        const company = await Sirket.findById(company_id);
        if (company) {
          const totalAmount = formattedTransactions.reduce(
            (sum, transaction) => sum + Math.abs(transaction.mebleg || 0),
            0
          );

          companyInfo = {
            id: company._id,
            name: company.sirket_name || "Şirkət adı",
            company_id: company.sirket_id || "N/A",
            logo:
              company.profile_image ||
              "/images/Avankart/muessise/demo-company-logo.svg",
            totalTransactions: formattedTransactions.length,
            totalAmount: totalAmount,
          };
        }
      } catch (error) {
        console.log("Company not found:", error);
      }
    }

    // Həmişə default company info təmin et
    if (!companyInfo) {
      const totalAmount = formattedTransactions.reduce(
        (sum, transaction) => sum + Math.abs(transaction.mebleg || 0),
        0
      );

      companyInfo = {
        id: company_id || "unknown",
        name: "Bilinməyən Şirkət",
        company_id: "N/A",
        logo: "/images/Avankart/muessise/demo-company-logo.svg",
        totalTransactions: formattedTransactions.length,
        totalAmount: totalAmount,
      };
    }

    // Hesablasma məlumatları
    const hesablasmaInfo = {
      hesablasma_id: hesablasmaData.hesablasma_id,
      transaction_count: hesablasmaData.transaction_count || 0,
      total: hesablasmaData.total || 0,
      komissiya: hesablasmaData.komissiya || 0,
      yekun_mebleg: hesablasmaData.yekun_mebleg || 0,
      from_date: hesablasmaData.from_date,
      end_date: hesablasmaData.end_date,
      status: getStatusDisplay(hesablasmaData.status),
      company: companyInfo,
    };

    // Kateqoriya əsaslı xərcləri hesabla (screenshot-dakı kimi)
    const predefinedCategories = [
      {
        name: "Yemək kartı",
        amount: 115000.0,
        percentage: 70,
        color: "#FFA726",
      },
      {
        name: "Hadiyyə kartı",
        amount: 2000.0,
        percentage: 5,
        color: "#42A5F5",
      },
      {
        name: "Yanacaq kartı",
        amount: 2000.0,
        percentage: 5,
        color: "#AB47BC",
      },
      { name: "Memket kartı", amount: 2000.0, percentage: 5, color: "#EF5350" },
      { name: "Niyaş kartı", amount: 2000.0, percentage: 5, color: "#42A5F5" },
      {
        name: "Premium kartı",
        amount: 2000.0,
        percentage: 5,
        color: "#66BB6A",
      },
      {
        name: "Avto Yuma kartı",
        amount: 2000.0,
        percentage: 5,
        color: "#FFA726",
      },
    ];

    // Ümumi məbləği hesabla
    const totalCardAmount = predefinedCategories.reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    const cardExpenses = predefinedCategories.map((category) => ({
      category: category.name,
      amount: category.amount,
      percentage: category.percentage,
      color: category.color,
    }));

    const transactionData = {
      data: formattedTransactions,
      recordsTotal: formattedTransactions.length,
      recordsFiltered: formattedTransactions.length,
    };

    // Check if PDF exists for this hesablasma
    const pdfLink =
      hesablasmaData.pdf_file_path ||
      (hesablasmaData.faktura && hesablasmaData.faktura.path
        ? hesablasmaData.faktura.path
        : null);

    console.log("PDF Link Debug:", {
      pdf_file_path: hesablasmaData.pdf_file_path,
      faktura_path: hesablasmaData.faktura?.path,
      final_pdfLink: pdfLink,
    });

    return res.render("pages/emeliyyatlar/muessise/hesablasma-transactions", {
      title: "Tranzaksiya Detalları",
      currentPath: req.path,
      company: companyInfo,
      hesablasma: hesablasmaInfo,
      cardExpenses: cardExpenses,
      transactions: transactionData,
      pdfLink: pdfLink,
      csrfToken: req.csrfToken(),
      error: "",
    });
  } catch (error) {
    console.error("getHesablasmaTransactionsPage error:", error);
    return res
      .status(500)
      .render("pages/emeliyyatlar/muessise/hesablasma-transactions", {
        title: "Xəta",
        currentPath: req.path,
        company: null,
        hesablasma: null,
        cardExpenses: [],
        transactions: { data: [] },
        pdfLink: null,
        csrfToken: req.csrfToken(),
      });
  }
};

export const getHesablasmaTransactionsApi = async (req, res) => {
  try {
    const { hesablasma_id, company_id } = req.params;
    const {
      draw = 1,
      start = 0,
      length = 10,
      search = {},
      order = [],
      filters = {},
    } = req.body || {};
    const drawNum = Number(draw) || 1;
    const searchValue = (search?.value ?? "").trim();

    // Debug log: Request body filters

    const TransactionsUser = (
      await import("../../../../shared/models/transactionsModel.js")
    ).default;

    // 1) Найти Hesablasma по _id или по строковому hesablasma_id
    let hDoc = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hDoc = await Hesablasma.findById(hesablasma_id).populate(
        "muessise_id",
        "muessise_name"
      );
    }
    if (!hDoc) {
      hDoc = await Hesablasma.findOne({ hesablasma_id }).populate(
        "muessise_id",
        "muessise_name"
      );
    }
    if (!hDoc) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0,
        draw: drawNum,
      });
    }

    // 2) company_id используем только если это валидный ObjectId
    const hasValidCompany = mongoose.Types.ObjectId.isValid(company_id);

    // 3) Базовый матч
    const match = {
      to: hDoc.muessise_id?._id,
      createdAt: { $gte: hDoc.from_date, $lte: hDoc.end_date },
      status: "success",
      ...(hasValidCompany
        ? { from_sirket: new mongoose.Types.ObjectId(company_id) }
        : {}),
    };

    // Поиск
    if (searchValue) {
      const rx = new RegExp(
        searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      match.$or = [
        { transaction_id: rx },
        { subject: rx },
        // при желании добавь поля
      ];
    }

    // Доп. фильтры из UI
    if (filters) {
      const { trx_id, date_from, date_to, category, amount_min, amount_max } =
        filters;

      if (trx_id && trx_id.trim()) {
        const r = new RegExp(
          trx_id.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
        match.transaction_id = r;
      }

      if (date_from || date_to) {
        match.createdAt = match.createdAt || {};
        if (date_from)
          match.createdAt.$gte = new Date(date_from + "T00:00:00Z");
        if (date_to) match.createdAt.$lte = new Date(date_to + "T23:59:59Z");
      }
    }

    // --- Normalize numeric filters safely ---
    let amtMin = null;
    let amtMax = null;

    if (filters) {
      const rawMin = filters.amount_min;
      const rawMax = filters.amount_max;

      const toNum = (v) => {
        if (v === null || v === undefined || v === "") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      amtMin = toNum(rawMin);
      amtMax = toNum(rawMax);

      // Swap if reversed (e.g., user typed bigger min than max)
      if (amtMin !== null && amtMax !== null && amtMin > amtMax) {
        const tmp = amtMin;
        amtMin = amtMax;
        amtMax = tmp;
      }

      // Ignore max if it's not positive to avoid zero-clamp on first load
      if (amtMax !== null && !(amtMax > 0)) {
        amtMax = null;
      }
    }

    // Build extra $expr conditions for absolute amount filter
    const exprAnd = [];
    if (amtMin !== null) {
      exprAnd.push({ $gte: [{ $abs: "$amount" }, amtMin] });
    }
    if (amtMax !== null) {
      exprAnd.push({ $lte: [{ $abs: "$amount" }, amtMax] });
    }

    // Сортировка колонок
    const sortMap = {
      0: "createdAt", // İstifadəçi (fallback)
      1: "transaction_id", // Tranzaksiya ID
      2: "cardCategory", // Kart kateqoriyası
      3: "amount", // Məbləğ
      4: "to", // Məkan
      5: "createdAt", // Tarix
    };
    let sortStage = { createdAt: -1 };
    if (order?.[0]) {
      const col = Number(order[0].column);
      const dir = order[0].dir === "asc" ? 1 : -1;
      const key = sortMap[col];
      if (key) sortStage = { [key]: dir };
    }

    // Основной pipeline
    const pipeline = [
      { $match: match },
      ...(exprAnd.length ? [{ $match: { $expr: { $and: exprAnd } } }] : []),
      {
        $lookup: {
          from: "peopleusers",
          localField: "from",
          foreignField: "_id",
          as: "fromUser",
        },
      },
      {
        $lookup: {
          from: "muessises",
          localField: "to",
          foreignField: "_id",
          as: "toMuessise",
        },
      },
      {
        $lookup: {
          from: "sirkets",
          localField: "from_sirket",
          foreignField: "_id",
          as: "fromSirket",
        },
      },
      {
        $lookup: {
          from: "cardscategories",
          localField: "cardCategory",
          foreignField: "_id",
          as: "cardCategoryData",
        },
      },
      // Фильтр по категории (если указан)
      ...(filters?.category
        ? [
            {
              $match: {
                "cardCategoryData.category_name": filters.category,
              },
            },
          ]
        : []),
      { $sort: sortStage },
      { $skip: Number(start) || 0 },
      { $limit: Number(length) || 10 },
      {
        $addFields: {
          absAmount: { $abs: "$amount" },
        },
      },
      {
        $addFields: {
          computedCategory: {
            $switch: {
              branches: [
                { case: { $gte: ["$absAmount", 500] }, then: "Yemək" },
                { case: { $gte: ["$absAmount", 300] }, then: "Hadiyyə" },
                { case: { $gte: ["$absAmount", 200] }, then: "Yanacaq" },
                { case: { $gte: ["$absAmount", 100] }, then: "Memket" },
                { case: { $gte: ["$absAmount", 75] }, then: "Niyaş" },
                { case: { $gte: ["$absAmount", 50] }, then: "Premium" },
              ],
              default: "Avto Yuma",
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          istifadeci: { $ifNull: ["$subject", "—"] },
          people_id: {
            $ifNull: [
              { $arrayElemAt: ["$fromUser.people_id", 0] },
              { $arrayElemAt: ["$fromUser.phone", 0] },
            ],
          },
          tranzaksiya_id: {
            $ifNull: [
              "$transaction_id",
              {
                $concat: ["TRX-", { $substr: [{ $toString: "$_id" }, 16, 8] }],
              },
            ],
          },
          // если нет cardCategory в базе, берём вычисленную категорию по сумме
          kart_kateqoriyasi: {
            $ifNull: [
              { $arrayElemAt: ["$cardCategoryData.category_name", 0] },
              "$computedCategory",
            ],
          },
          mebleg: { $toDouble: { $abs: "$amount" } },
          mekan: {
            $ifNull: [
              { $arrayElemAt: ["$toMuessise.muessise_name", 0] },
              { $arrayElemAt: ["$fromSirket.sirket_name", 0] },
            ],
          },
          tarix: {
            $dateToString: {
              format: "%d.%m.%Y - %H:%M:%S",
              date: "$createdAt",
            },
          },
          createdAt: 1,
        },
      },
    ];

    // Debug log: Print aggregation pipeline
    console.log("=== AGGREGATION PIPELINE ===");
    console.log(JSON.stringify(pipeline, null, 2));

    // Корректные счётчики:
    // общий total без поиска/доп.фильтров
    const recordsTotalPromise = TransactionsUser.countDocuments({
      to: match.to,
      createdAt: match.createdAt,
      status: match.status,
      ...(match.from_sirket ? { from_sirket: match.from_sirket } : {}),
    });

    // filtered — с теми же условиями, что и pipeline (поиск + category + amount filter)
    const filteredPipeline = [
      { $match: match },
      ...(exprAnd.length ? [{ $match: { $expr: { $and: exprAnd } } }] : []),
      ...(filters?.category
        ? [
            {
              $lookup: {
                from: "cardscategories",
                localField: "cardCategory",
                foreignField: "_id",
                as: "cardCategoryData",
              },
            },
            { $match: { "cardCategoryData.category_name": filters.category } },
          ]
        : []),
      { $count: "cnt" },
    ];

    const [data, total, filteredArr] = await Promise.all([
      TransactionsUser.aggregate(pipeline),
      recordsTotalPromise,
      TransactionsUser.aggregate(filteredPipeline),
    ]);

    const recordsFiltered = filteredArr?.[0]?.cnt ?? 0;

    // Debug log: Print first 3 results
    console.log("=== FIRST 3 RESULTS ===");
    const firstThree = data.slice(0, 3);
    firstThree.forEach((item, index) => {
      console.log(`Result ${index + 1}:`, {
        id: item.id,
        mebleg: item.mebleg,
        tranzaksiya_id: item.tranzaksiya_id,
        mebleg_type: typeof item.mebleg,
      });
    });
    console.log("Total results:", data.length);

    return res.json({
      success: true,
      data,
      recordsTotal: total,
      recordsFiltered,
      draw: drawNum,
    });
  } catch (err) {
    console.error("getHesablasmaTransactionsApi error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
      recordsTotal: 0,
      recordsFiltered: 0,
      draw: Number(req.body?.draw) || 1,
    });
  }
};

export const getHesablasmaTransactionsCardsApi = async (req, res) => {
  try {
    const { hesablasma_id, company_id } = req.params;

    // 1) Find Hesablasma by _id or by string hesablasma_id
    let hDoc = null;
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hDoc = await Hesablasma.findById(hesablasma_id).populate(
        "muessise_id",
        "muessise_name"
      );
    }
    if (!hDoc) {
      hDoc = await Hesablasma.findOne({ hesablasma_id }).populate(
        "muessise_id",
        "muessise_name"
      );
    }
    if (!hDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Hesablaşma tapılmadı" });
    }

    const hasValidCompany = mongoose.Types.ObjectId.isValid(company_id);

    const match = {
      to: hDoc.muessise_id?._id,
      createdAt: { $gte: hDoc.from_date, $lte: hDoc.end_date },
      status: "success",
      ...(hasValidCompany
        ? { from_sirket: new mongoose.Types.ObjectId(company_id) }
        : {}),
    };

    const TransactionsUser = (
      await import("../../../../shared/models/transactionsModel.js")
    ).default;

    // 2) Aggregate absolute amounts by known card categories or compute fallback bucket
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "cardscategories",
          localField: "cardCategory",
          foreignField: "_id",
          as: "cardCategoryData",
        },
      },
      {
        $addFields: {
          absAmount: { $abs: "$amount" },
          catName: {
            $ifNull: [
              { $arrayElemAt: ["$cardCategoryData.category_name", 0] },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          finalCategory: {
            $ifNull: [
              "$catName",
              {
                $switch: {
                  branches: [
                    {
                      case: { $gte: ["$absAmount", 500] },
                      then: "Yemək kartı",
                    },
                    {
                      case: { $gte: ["$absAmount", 300] },
                      then: "Hadiyyə kartı",
                    },
                    {
                      case: { $gte: ["$absAmount", 200] },
                      then: "Yanacaq kartı",
                    },
                    {
                      case: { $gte: ["$absAmount", 100] },
                      then: "Memket kartı",
                    },
                    { case: { $gte: ["$absAmount", 75] }, then: "Niyaş kartı" },
                    {
                      case: { $gte: ["$absAmount", 50] },
                      then: "Premium kartı",
                    },
                  ],
                  default: "Avto Yuma kartı",
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$finalCategory",
          amount: { $sum: "$absAmount" },
        },
      },
      { $project: { _id: 0, category: "$_id", amount: 1 } },
    ];

    const rows = await TransactionsUser.aggregate(pipeline);

    // Preserve desired render order
    const order = [
      "Yemək kartı",
      "Hadiyyə kartı",
      "Yanacaq kartı",
      "Memket kartı",
      "Niyaş kartı",
      "Premium kartı",
      "Avto Yuma kartı",
    ];

    const amountsByCat = Object.fromEntries(
      rows.map((r) => [r.category, r.amount])
    );
    const totalAmount = Object.values(amountsByCat).reduce((a, b) => a + b, 0);

    const cardExpenses = order.map((name) => {
      const amount = amountsByCat[name] || 0;
      const percentage =
        totalAmount > 0 ? Math.round((amount * 100) / totalAmount) : 0;
      return { category: name, amount, percentage };
    });

    return res.json({ success: true, totalAmount, cardExpenses });
  } catch (err) {
    console.error("getHesablasmaTransactionsCardsApi error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const exportHesablasmaTransactionsPDF = async (req, res) => {
  try {
    return res.status(501).send("PDF export not implemented");
  } catch {
    return res.status(500).send("Server error");
  }
};

// Analiz modal üçün hesablaşma məlumatlarını gətir
export const getHesablasmaAnaliz = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    console.log("=== getHesablasmaAnaliz başladı ===", hesablasma_id);

    // Hesablaşmanı tap - həm ObjectId həm də invoice nömrəsi ilə
    let hesablasma = null;

    // Əvvəlcə ObjectId olaraq tap
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hesablasma = await Hesablasma.findById(hesablasma_id)
        .populate("muessise_id", "muessise_name muessise_id logo_url")
        .lean();
    }

    // Əgər tapılmadısa, invoice nömrəsi olaraq tap
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ invoice_nomresi: hesablasma_id })
        .populate("muessise_id", "muessise_name muessise_id logo_url")
        .lean();
    }

    if (!hesablasma) {
      console.log("Hesablaşma tapılmadı:", hesablasma_id);
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    console.log(
      "Hesablaşma tapıldı:",
      hesablasma._id,
      hesablasma.invoice_nomresi
    );

    // Problem təsvirini həzırla
    let problemTasviri = "Ətraflı problem təsviri tapılmadı";
    if (hesablasma.problem_report) {
      problemTasviri = hesablasma.problem_report;
    } else if (hesablasma.status && hesablasma.status.includes("reported")) {
      problemTasviri =
        "Bu hesablaşmada problem bildirilmiş, ancaq ətraflı təsvir əlavə edilməmişdir.";
    }

    // Response hazırla
    const response = {
      success: true,
      data: {
        hesablasma_id: hesablasma._id,
        muessise: {
          id: hesablasma.muessise_id?.muessise_id || "N/A",
          name: hesablasma.muessise_id?.muessise_name || "Naməlum müəssisə",
          logo:
            hesablasma.muessise_id?.logo_url ||
            "/public/images/default-logo.svg",
        },
        invoice_nomresi: hesablasma.hesablasma_id || "N/A",
        tranzaksiya_sayi: hesablasma.transaction_count || 0,
        yekun_mebleg: hesablasma.yekun_mebleg || 0,
        hesablasma_tarixi_baslangic: hesablasma.from_date
          ? new Date(hesablasma.from_date).toLocaleDateString("az-AZ")
          : "N/A",
        hesablasma_tarixi_son: hesablasma.end_date
          ? new Date(hesablasma.end_date).toLocaleDateString("az-AZ")
          : "N/A",
        status: hesablasma.status,
        problem_tasviri: problemTasviri,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("getHesablasmaAnaliz error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

// Analiz modal üçün transaction-ları gətir
export const getHesablasmaAnalizTransactions = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;
    const { draw, start, length, search } = req.body;

    console.log("=== getHesablasmaAnalizTransactions başladı ===", {
      hesablasma_id,
      draw,
      start,
      length,
      search,
    });

    const offset = parseInt(start) || 0;
    const limit = parseInt(length) || 10;
    const searchValue = search || "";

    // Hesablaşmanı tap - həm ObjectId həm də invoice nömrəsi ilə
    let hesablasma = null;
    let actualHesablasmaId = null;

    // Əvvəlcə ObjectId olaraq tap
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hesablasma = await Hesablasma.findById(hesablasma_id).lean();
      actualHesablasmaId = hesablasma_id;
    }

    // Əgər tapılmadısa, invoice nömrəsi olaraq tap
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({
        invoice_nomresi: hesablasma_id,
      }).lean();
      if (hesablasma) {
        actualHesablasmaId = hesablasma._id;
      }
    }

    if (!hesablasma) {
      console.log("Hesablaşma tapılmadı (transactions):", hesablasma_id);
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    console.log(
      "Hesablaşma tapıldı (transactions):",
      actualHesablasmaId,
      hesablasma.invoice_nomresi
    );

    // Transaction axtarış filtri
    const matchConditions = {
      hesablasma_id: new mongoose.Types.ObjectId(actualHesablasmaId),
      deleted: { $ne: true },
    };

    console.log(
      "=== MATCH CONDITIONS:",
      JSON.stringify(matchConditions, null, 2)
    );

    // Axtarış əlavə et
    if (searchValue && searchValue.trim()) {
      matchConditions.$or = [
        { transaction_id: { $regex: searchValue, $options: "i" } },
        { card_name: { $regex: searchValue, $options: "i" } },
        { finalCategory: { $regex: searchValue, $options: "i" } },
      ];
    }

    // Ümumi sayı al
    const totalCount = await TransactionsUser.countDocuments(matchConditions);

    // Transaction-ları gətir və populate et (error handling ilə)
    let transactions = [];
    try {
      transactions = await TransactionsUser.find(matchConditions)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      // Populate etməzdən əvvəl valid ObjectId-ləri yoxla
      if (transactions.length > 0) {
        for (let transaction of transactions) {
          // Cards populate et
          if (
            transaction.cards &&
            mongoose.Types.ObjectId.isValid(transaction.cards)
          ) {
            try {
              const card = await Cards.findById(transaction.cards)
                .populate("category", "name")
                .lean();
              transaction.cards = card;
            } catch (cardError) {
              console.warn(
                `Card populate error for ${transaction.cards}:`,
                cardError.message
              );
              transaction.cards = null;
            }
          }

          // CardCategory populate et
          if (
            transaction.cardCategory &&
            mongoose.Types.ObjectId.isValid(transaction.cardCategory)
          ) {
            try {
              const category = await CardsCategory.findById(
                transaction.cardCategory
              )
                .select("name")
                .lean();
              transaction.cardCategory = category;
            } catch (categoryError) {
              console.warn(
                `CardCategory populate error for ${transaction.cardCategory}:`,
                categoryError.message
              );
              transaction.cardCategory = null;
            }
          }
        }
      }
    } catch (queryError) {
      console.error("Transaction query error:", queryError);
      // Əgər populate xətası varsa, sadə query-ni istifadə et
      transactions = await TransactionsUser.find(matchConditions)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    }

    // Transaction-ları format et
    console.log("=== HESABLASMA ID:", actualHesablasmaId);
    console.log("=== TOTAL TRANSACTIONS FOUND:", transactions.length);
    console.log(
      "Raw transactions data:",
      transactions.map((t) => ({
        _id: t._id,
        amount: t.amount,
        absAmount: t.absAmount,
        transaction_date: t.transaction_date,
        card_name: t.card_name,
        finalCategory: t.finalCategory,
        hesablasma_id: t.hesablasma_id,
      }))
    );

    // Spesifik transaction axtarışı
    const target24Transaction = transactions.find((t) => t.amount === 24);
    if (target24Transaction) {
      console.log(
        "=== 24 AZN TRANSACTION FOUND:",
        JSON.stringify(target24Transaction, null, 2)
      );
    } else {
      console.log("=== 24 AZN TRANSACTION NOT FOUND IN CURRENT RESULTS");
      console.log(
        "=== Available amounts:",
        transactions.map((t) => t.amount)
      );
    }

    const formattedTransactions = transactions.map((transaction) => {
      // Kart adını əldə et
      let cardName = "N/A";
      if (transaction.cards && transaction.cards.name) {
        cardName = transaction.cards.name;
      } else if (transaction.cardCategory && transaction.cardCategory.name) {
        cardName = transaction.cardCategory.name;
      } else if (transaction.card_name) {
        cardName = transaction.card_name;
      } else if (transaction.finalCategory) {
        cardName = transaction.finalCategory;
      }

      // Tarixi düzgün format et
      let formattedDate = "N/A";
      if (
        transaction.transaction_date ||
        transaction.date ||
        transaction.createdAt
      ) {
        const dateToFormat =
          transaction.transaction_date ||
          transaction.date ||
          transaction.createdAt;
        try {
          const date = new Date(dateToFormat);
          formattedDate =
            date.toLocaleDateString("az-AZ", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }) +
            " " +
            date.toLocaleTimeString("az-AZ", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
        } catch (error) {
          console.error("Date formatting error:", error);
          formattedDate = "N/A";
        }
      }

      return {
        id: transaction.transaction_id || transaction._id,
        transaction_id: transaction.transaction_id || "N/A",
        date: formattedDate,
        card_name: cardName,
        amount: Math.abs(
          transaction.amount || transaction.absAmount || 0
        ).toFixed(2),
        amount_with_currency:
          Math.abs(transaction.amount || transaction.absAmount || 0).toFixed(
            2
          ) + " AZN",
        original_amount: transaction.amount || transaction.absAmount || 0,
        _id: transaction._id,
      };
    });

    const response = {
      draw: parseInt(draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: totalCount,
      data: formattedTransactions,
      success: true,
    };

    return res.json(response);
  } catch (error) {
    console.error("getHesablasmaAnalizTransactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

export const sendOtpForHesablasma = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    const { generateOtp, sendMail } = await import(
      "../../../../shared/utils/otpHandler.js"
    );

    const otp = generateOtp(6);
    const adminEmail = process.env.SMTP_MAIL || "said.nuraliyev@code.edu.az";

    if (!global.otpStorage) global.otpStorage = {};
    global.otpStorage[hesablasma_id] = {
      otp: otp,
      createdAt: new Date(),
      email: adminEmail,
    };
    const emailSent = await sendMail(
      adminEmail,
      otp,
      false,
      "Hesablaşma Təsdiqi OTP Kodu"
    );

    if (!emailSent) {
      console.error("Email göndərilmədi");
      return res.status(500).json({
        success: false,
        message: "Email göndərilə bilmədi",
      });
    }

    return res.json({
      success: true,
      message: "OTP kodu email ünvanına göndərildi",
      email: adminEmail,
    });
  } catch (error) {
    console.error("sendOtpForHesablasma error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP göndərilmədi",
    });
  }
};

export const approveAndResendHesablasma = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;
    const { otp_code } = req.body;

    if (!otp_code || otp_code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "6 rəqəmli OTP kodunu daxil edin",
      });
    }

    // Hesablaşmanı tap - həm ObjectId həm də invoice nömrəsi ilə
    let hesablasma = null;

    // Əvvəlcə ObjectId olaraq tap
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hesablasma = await Hesablasma.findById(hesablasma_id);
    }

    // Əgər tapılmadısa, invoice nömrəsi olaraq tap
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({ invoice_nomresi: hesablasma_id });
    }

    if (!hesablasma) {
      console.log("Hesablaşma tapılmadı (approve):", hesablasma_id);
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    // Status yoxla - yalnız reported olanları təsdiqlə bilərsiniz
    if (!hesablasma.status.includes("reported")) {
      return res.status(400).json({
        success: false,
        message: "Bu hesablaşma report edilməyib",
      });
    }

    const storedOtpData = global.otpStorage && global.otpStorage[hesablasma_id];

    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu tapılmadı. Yenidən OTP göndərin.",
      });
    }

    const now = new Date();
    const otpAge = (now - storedOtpData.createdAt) / 1000 / 60; // dəqiqə
    if (otpAge > 5) {
      delete global.otpStorage[hesablasma_id];
      return res.status(400).json({
        success: false,
        message: "OTP kodunun vaxtı keçib. Yenidən OTP göndərin.",
      });
    }

    if (storedOtpData.otp !== otp_code) {
      return res.status(400).json({
        success: false,
        message: "Yanlış OTP kodu",
      });
    }

    delete global.otpStorage[hesablasma_id];

    // Hesablaşmanın statusunu yenilə
    hesablasma.status = "aktiv";
    hesablasma.problem_report = null; // Problem həll olundu
    hesablasma.resolved_at = new Date();
    hesablasma.resolved_by = req.user?.id || "system";

    await hesablasma.save();

    return res.json({
      success: true,
      message: "Hesablaşma uğurla təsdiqləndi və yenidən göndərildi",
    });
  } catch (error) {
    console.error("approveAndResendHesablasma error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

// Analiz modalı üçün məlumatları gətir
export const getHesablasmaAnalizData = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;

    console.log("=== getHesablasmaAnalizData başladı ===", { hesablasma_id });

    // Hesablaşmanı tap
    let hesablasma = null;
    let actualHesablasmaId = null;

    // Əvvəlcə ObjectId olaraq tap
    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hesablasma = await Hesablasma.findById(hesablasma_id)
        .populate({
          path: "muessise_id",
          select: "name company_id logo",
        })
        .lean();
      actualHesablasmaId = hesablasma_id;
    }

    // Əgər tapılmadısa, invoice nömrəsi olaraq tap
    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      })
        .populate({
          path: "muessise_id",
          select: "name company_id logo",
        })
        .lean();
      if (hesablasma) {
        actualHesablasmaId = hesablasma._id;
      }
    }

    if (!hesablasma) {
      console.log("Hesablaşma tapılmadı (analiz):", hesablasma_id);
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    console.log(
      "Hesablaşma tapıldı (analiz):",
      actualHesablasmaId,
      hesablasma.hesablasma_id
    );

    // Transaction sayını və məbləği hesabla
    const transactionStats = await TransactionsUser.aggregate([
      {
        $match: {
          hesablasma_id: new mongoose.Types.ObjectId(actualHesablasmaId),
          deleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: { $abs: "$amount" } },
        },
      },
    ]);

    const stats = transactionStats[0] || { count: 0, totalAmount: 0 };

    // Sample transactions for the modal table (first 50 for display)
    let sampleTransactions = [];
    try {
      sampleTransactions = await TransactionsUser.find({
        hesablasma_id: new mongoose.Types.ObjectId(actualHesablasmaId),
        deleted: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Populate etməzdən əvvəl valid ObjectId-ləri yoxla
      if (sampleTransactions.length > 0) {
        for (let transaction of sampleTransactions) {
          // Cards populate et
          if (
            transaction.cards &&
            mongoose.Types.ObjectId.isValid(transaction.cards)
          ) {
            try {
              const card = await Cards.findById(transaction.cards)
                .populate("category", "name")
                .lean();
              transaction.cards = card;
            } catch (cardError) {
              console.warn(
                `Card populate error for ${transaction.cards}:`,
                cardError.message
              );
              transaction.cards = null;
            }
          }

          // CardCategory populate et
          if (
            transaction.cardCategory &&
            mongoose.Types.ObjectId.isValid(transaction.cardCategory)
          ) {
            try {
              const category = await CardsCategory.findById(
                transaction.cardCategory
              )
                .select("name")
                .lean();
              transaction.cardCategory = category;
            } catch (categoryError) {
              console.warn(
                `CardCategory populate error for ${transaction.cardCategory}:`,
                categoryError.message
              );
              transaction.cardCategory = null;
            }
          }
        }
      }
    } catch (queryError) {
      console.error("Sample transactions query error:", queryError);
      // Əgər populate xətası varsa, sadə query-ni istifadə et
      sampleTransactions = await TransactionsUser.find({
        hesablasma_id: new mongoose.Types.ObjectId(actualHesablasmaId),
        deleted: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    // Format transactions for frontend
    const formattedTransactions = sampleTransactions.map((transaction) => {
      // Kart adını əldə et
      let cardName = "N/A";
      if (transaction.cards && transaction.cards.name) {
        cardName = transaction.cards.name;
      } else if (transaction.cardCategory && transaction.cardCategory.name) {
        cardName = transaction.cardCategory.name;
      } else if (transaction.card_name) {
        cardName = transaction.card_name;
      } else if (transaction.finalCategory) {
        cardName = transaction.finalCategory;
      }

      // Tarixi düzgün format et
      let formattedDate = "N/A";
      if (
        transaction.transaction_date ||
        transaction.date ||
        transaction.createdAt
      ) {
        const dateToFormat =
          transaction.transaction_date ||
          transaction.date ||
          transaction.createdAt;
        try {
          const date = new Date(dateToFormat);
          formattedDate =
            date.toLocaleDateString("az-AZ", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }) +
            " " +
            date.toLocaleTimeString("az-AZ", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
        } catch (error) {
          console.error("Date formatting error:", error);
          formattedDate = "N/A";
        }
      }

      return {
        id: transaction.transaction_id || transaction._id,
        date: formattedDate,
        cardName: cardName,
        amount: Math.abs(transaction.amount || transaction.absAmount || 0),
      };
    });

    // Hesablaşma tarixini format et
    let formattedHesablasmaDate = "N/A";
    if (hesablasma.createdAt) {
      try {
        const date = new Date(hesablasma.createdAt);
        formattedHesablasmaDate = date.toLocaleDateString("az-AZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch (error) {
        console.error("Hesablasma date formatting error:", error);
      }
    }

    const response = {
      success: true,
      data: {
        company: {
          name: hesablasma.muessise_id?.name || "N/A",
          id: hesablasma.muessise_id?.company_id || "N/A",
          logo: hesablasma.muessise_id?.logo || "/images/default-company.png",
        },
        problem: {
          description:
            "Sistem tərəfindən problem aşkar edilmişdir və təfsilatlı araşdırma aparılır.",
        },
        invoice: hesablasma.hesablasma_id || "N/A",
        transactionCount: stats.count,
        amount: stats.totalAmount.toFixed(2),
        date: formattedHesablasmaDate,
        transactions: formattedTransactions,
      },
    };

    console.log("Analiz məlumatları hazırlandı:", {
      company: response.data.company.name,
      transactionCount: response.data.transactionCount,
      amount: response.data.amount,
    });

    return res.json(response);
  } catch (error) {
    console.error("getHesablasmaAnalizData error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

// Analiz dəyişikliklərini saxla
export const saveHesablasmaAnalizChanges = async (req, res) => {
  try {
    const { hesablasma_id } = req.params;
    const { changes } = req.body;

    console.log("=== saveHesablasmaAnalizChanges başladı ===", {
      hesablasma_id,
      changes: Object.keys(changes || {}).length,
    });

    if (!changes || Object.keys(changes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dəyişiklik tapılmadı",
      });
    }

    // Hesablaşmanı tap
    let hesablasma = null;
    let actualHesablasmaId = null;

    if (mongoose.Types.ObjectId.isValid(hesablasma_id)) {
      hesablasma = await Hesablasma.findById(hesablasma_id).lean();
      actualHesablasmaId = hesablasma_id;
    }

    if (!hesablasma) {
      hesablasma = await Hesablasma.findOne({
        hesablasma_id: hesablasma_id,
      }).lean();
      if (hesablasma) {
        actualHesablasmaId = hesablasma._id;
      }
    }

    if (!hesablasma) {
      return res.status(404).json({
        success: false,
        message: "Hesablaşma tapılmadı",
      });
    }

    // Dəyişiklikləri tətbiq et
    const updatePromises = [];

    for (const [index, fieldChanges] of Object.entries(changes)) {
      if (fieldChanges.cardName || fieldChanges.amount) {
        const updateData = {};

        if (fieldChanges.cardName) {
          updateData.card_name = fieldChanges.cardName;
        }

        if (fieldChanges.amount) {
          updateData.amount = parseFloat(fieldChanges.amount);
          updateData.absAmount = Math.abs(parseFloat(fieldChanges.amount));
        }

        // Transaction-u tap və yenilə
        const transactionUpdatePromise = TransactionsUser.findOneAndUpdate(
          {
            hesablasma_id: new mongoose.Types.ObjectId(actualHesablasmaId),
            deleted: { $ne: true },
          },
          { $set: updateData },
          { new: true }
        );

        updatePromises.push(transactionUpdatePromise);
      }
    }

    await Promise.all(updatePromises);

    console.log(`${updatePromises.length} transaction yeniləndi`);

    return res.json({
      success: true,
      message: "Dəyişikliklər uğurla saxlanıldı",
      updated: updatePromises.length,
    });
  } catch (error) {
    console.error("saveHesablasmaAnalizChanges error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};
