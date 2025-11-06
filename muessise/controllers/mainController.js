import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import FAQ from "../../shared/models/faqModel.js";
import Muessise from "../../shared/models/muessiseModel.js";
import Sirket from "../../shared/models/sirketModel.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";

export const getHome = async (req, res) => {
  try {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;
    const myUser = await PartnerUser.findById(req.user.id);
    const muessise = await Muessise.findById(myUser.muessise_id).populate(
      "cards"
    );

    // Cards array-ini hazırla frontend üçün
    const cards = muessise?.cards || [];

    return res.render("pages/index", {
      title: "Home Page",
      user: req.user,
      muessise,
      cards, // Cards array-ini template-ə göndər
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const getHesablashmalar = async (req, res) => {
  try {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;
    const myUser = req.user.id;
    const currentUser = await PartnerUser.findById(myUser);
    // Hesablaşmaların statuslarına görə sayını tap
    const qaralamaCount = await Hesablasma.countDocuments({
      status: "qaralama",
      muessise_id: currentUser.muessise_id,
    });
    const waitingActiveCount = await Hesablasma.countDocuments({
      status: "waiting_aktiv",
      muessise_id: currentUser.muessise_id,
    });
    const waitingTamamlandiCount = await Hesablasma.countDocuments({
      status: "waiting_tamamlandi",
      muessise_id: currentUser.muessise_id,
    });
    const reportedCount = await Hesablasma.countDocuments({
      status: { $regex: /^reported/ },
      muessise_id: currentUser.muessise_id,
    });
    const aktivCount = await Hesablasma.countDocuments({
      status: "aktiv",
      muessise_id: currentUser.muessise_id,
    });
    const tamamlandiCount = await Hesablasma.countDocuments({
      status: "tamamlandi",
      muessise_id: currentUser.muessise_id,
    });

    // Ümumi məbləğ - транзакцийlərin məbləğlərinin cəmi
    const totalAmountResult = await Hesablasma.aggregate([
      { $match: { muessise_id: currentUser.muessise_id } },
      {
        $lookup: {
          from: "transactionsusers",
          localField: "_id",
          foreignField: "hesablasma_id",
          as: "transactions",
        },
      },
      {
        $unwind: "$transactions",
      },
      {
        $match: {
          "transactions.status": "success",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $subtract: [
                "$transactions.amount",
                {
                  $divide: [
                    {
                      $multiply: [
                        "$transactions.amount",
                        "$transactions.comission",
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      },
    ]);

    const totalAmount = totalAmountResult[0]?.total || 0;

    return res.render("pages/hesablasmalar/hesablasmalar", {
      title: "Hesablashmalar Page",
      user: req.user,
      csrfToken: req.csrfToken(),
      counts: {
        qaralama: qaralamaCount,
        waiting_aktiv: waitingActiveCount,
        waiting_tamamlandi: waitingTamamlandiCount,
        reported: reportedCount,
        aktiv: aktivCount,
        tamamlandi: tamamlandiCount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error("getHesablashmalar error:", err);
    return res.status(500).send("Error fetching hesablasmalar data");
  }
};

export const fag = async (req, res) => {
  try {
    const { lang = "az" } = req.body;
    const faqs = await FAQ.find(
      { project: "muessise" },
      { question: 1, answer: 1, _id: 0 }
    );

    // Преобразуем многоязычные данные в плоскую структуру
    const processedFaqs = faqs.map((faq) => ({
      question: faq.question[lang] || faq.question.az || faq.question,
      answer: faq.answer[lang] || faq.answer.az || faq.answer,
    }));

    res.status(200).json({ success: true, data: processedFaqs });
  } catch (error) {
    console.error("FAQ controller error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export const getUserDuty = async (req, res) => {
  try {
    const userId = req.user.id;
    const myUser = await PartnerUser.findById(userId).populate("duty");

    if (!myUser) {
      return res.json({
        success: false,
        name: "Təyin olunmayıb",
        surname: "Təyin olunmayıb",
        dutyName: "Təyin olunmayıb",
      });
    }

    return res.json({
      success: true,
      name: myUser.name || "",
      surname: myUser.surname || "",
      dutyName: myUser.duty
        ? myUser.duty.name || "Təyin olunmayıb"
        : "Təyin olunmayıb",
    });
  } catch (error) {
    return res.json({
      success: false,
      dutyName: "Təyin olunmayıb",
    });
  }
};
