import PartnerUser from "../../shared/models/partnyorUserModel.js";
import { Muessise } from "../../shared/models/muessiseModel.js";
import Duties from "../../shared/models/duties.js";
import RbacPermission from "../../shared/models/rbacPermission.model.js";
import Cards from "../../shared/models/cardModel.js";
import TempMuessiseInfo from "../../shared/model/partner/tempMuessiseInfo.js";
import Rekvizitler from "../../shared/models/rekvizitlerModel.js";

export const muessiseInfo = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Sadə populate - category YOX
    const muessise = await Muessise.findById(user.muessise_id).populate(
      "rekvizitler creator_id cards"
    );

    console.log("muesssose,  ", user)
    if (!muessise) {
      return res.status(404).send("Muessise not found");
    }

    // Bütün kartlar - category populate YOX
    const allCards = await Cards.find({ status: "active" }).sort({ name: 1 });

    const duties = await Duties.find({ muessise_id: user.muessise_id});
    const permissions = await RbacPermission.find({
      muessise_id: user.muessise_id,
    });
     const rekvizitler = await Rekvizitler.find();

    res.render("pages/muessiseInfo.ejs", {
      muessise,
      allCards, // Cards category olmadan
      csrfToken: req.csrfToken(),
      activeLang: req.getLocale(),
      duties,
      permissions,
      rekvizitler
    });
  } catch (error) {
    console.error("Muessise info error:", error);
    res.status(500).send("Internal server error");
  }
};

export const getMuessisePageInfo = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = await PartnerUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: res.__("messages.muessiseController.user_not_found"),
      });
    }

    // Sadə populate - category YOX
    const muessise = await Muessise.findById(user.muessise_id).populate(
      "rekvizitler creator_id cards"
    );

    if (!muessise) {
      return res.status(404).json({
        success: false,
        message: res.__("messages.muessiseController.muessise_not_found"),
      });
    }

    // Bütün kartlar - category populate YOX
    const allCards = await Cards.find({ status: "active" }).sort({ name: 1 });

    res.json({
      success: true,
      muessise,
      allCards, // Cards category olmadan
      csrfToken: req.csrfToken(),
      activeLang: req.getLocale(),
    });
  } catch (err) {
    console.error("Error fetching muessise info:", err);
    res.status(500).json({
      success: false,
      message: res.__("messages.muessiseController.internal_server_error"),
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getHistoryDetails = async (req, res) => {
  try {
    const { history_id } = req.body
    const userId = req.user.id

    if (!userId || !history_id) return res.status(400).json({
      success: false,
      message: "User id or Temp muessise id  not provided"
    });

    const tempMuessise = await TempMuessiseInfo.findOne({ _id: history_id })
      .populate({ path: "cards" })
      .populate({ path: "user_id", select: "name surname" });

    if (!tempMuessise) return res.status(200).json({
      message: "Temp muessise not found",
      success: false
    });

    const user = await PartnerUser.findOne({
      _id: userId
    });
    if (!user) return res.status(200).json({
      message: "User not found",
      success: false
    });

    if (user.muessise_id.toString() !== tempMuessise.muessise_id.toString()) return res.status(404).json({
      success: false,
      message: "You do not have permission to access this record."
    });

    return res.status(200).json({
      success: true,
      message: "Temp muessise data send successfully",
      data: tempMuessise
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  };


};

