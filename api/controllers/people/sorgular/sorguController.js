import PeopleSession from "../../../../shared/model/people/peopleSessionModel.js";
import Ticket from "../../../../shared/model/partner/ticket.js";
import TicketFile from "../../../../shared/model/partner/ticketFile.js";
import PeopleUser from "../../../../shared/models/peopleUserModel.js";
import SorgularReason from "../../../../shared/model/partner/sorgularReason.js";

export const getSorgu = async (req, res) => {
  const userId = req.user;
  const page = parseInt(req.body.page, 10) || 1; // default: 1
  const limit = parseInt(req.body.limit, 10) || 10; // default: 10
  const skip = (page - 1) * limit;

  try {
    const user = await PeopleUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // total count
    const total = await Ticket.countDocuments({
      user_id: userId,
      userModel: "PeopleUser",
    });

    // pagination query
    const queries = await Ticket.find({
      user_id: userId,
      userModel: "PeopleUser",
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    if (!queries.length) {
      return res.status(400).json({
        message: "No query found",
        success: false,
      });
    }

    const formattedQueries = queries.map((query) => ({
      _id: query._id,
      ticket_id: query.ticket_id,
      title: query.title,
      content: query.content ? query.content.substring(0, 150) + "..." : "",
      date: query.createdAt ? query.createdAt.toLocaleDateString("az-AZ") : "",
      status: query.status,
    }));

    return res.status(200).json({
      message: "Query send successfully",
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: formattedQueries,
    });
  } catch (error) {
    console.log(error, error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getSorgularInside = async (req, res) => {
  const userId = req.user;

  const { ticket_id } = req.body;

  try {
    const sorguData = await Ticket.findOne({
      ticket_id: ticket_id,
      user_id: userId,
      userModel: "PeopleUser",
    });

    if (!sorguData)
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });

    const files = await TicketFile.find({
      ticket_id: sorguData._id,
    });

    if (!files)
      return res.status(400).json({
        message: "Ticket queries failed",
        success: false,
      });

    return res.status(200).json({
      success: true,
      message: "Queries finded successfully",
      files,
      sorguData,
    });
  } catch (error) {
    console.log(error, error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getReasons = async (req, res) => {
  try {
    const reasons = await SorgularReason.find({});

    if (!reasons || reasons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reasons found",
      });
    }

    const groupedReasons = {
      general: [],
      account: [],
      pay: [],
    };

    reasons.forEach((reason) => {
      const reasonData = {
        _id: reason._id,
        name: reason.name,
        text: reason.text,
      };

      if (reason.category === "general") {
        groupedReasons.general.push(reasonData);
      } else if (reason.category === "account") {
        groupedReasons.account.push(reasonData);
      } else if (reason.category === "pay") {
        groupedReasons.pay.push(reasonData);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Reasons retrieved successfully",
      data: groupedReasons,
    });
  } catch (error) {
    console.log(error, error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
