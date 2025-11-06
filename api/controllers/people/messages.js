import Ticket from "../../../shared/model/partner/ticket.js";
import TicketMessage from "../../../shared/model/partner/TicketMessage.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import AdminUser from "../../../shared/models/adminUsersModel.js";
import sanitizeHtml from "sanitize-html";

export const ticketMessages = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const userId = req.user;

    const user = await PeopleUser.findById(userId).select(
      "muessise_id messages"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let messages = await TicketMessage.find({ ticket_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!messages) {
      messages = [];
    }

    const result = messages.reverse();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error in ticketMessages:", err);
    return res.status(500).json({
      success: false,
      data: [],
      error: err.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  const { message, ticket_id } = req.body;

  try {
    if (!message || !ticket_id) {
      return res.status(400).json({
        success: false,
        message: "Message content and ticket_id are required",
      });
    }

    const ticket = await Ticket.findById(ticket_id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Sanitize və escape mesajı
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
      textFilter: function (text) {
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      },
    });

    const escapedMessage = sanitizedMessage
      .replace(/'/g, "&#x27;")
      .replace(/"/g, "&quot;")
      .replace(/\//g, "&#x2F;");

    const ticketMessage = await TicketMessage.create({
      from: req.user,
      fromModel: "PeopleUser",
      to: null,
      toModel: "AdminUser",
      message: escapedMessage,
      status: "unread",
      ticket_id,
    });

    // Notification göndər
    if (ticket.assigned && ticket.assigned.length > 0) {
      await sendTicketNotif(ticket.assigned);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: ticketMessage,
    });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// sendTicketNotif funksiyası
const sendTicketNotif = async (ids) => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }

    // AdminUser modelindən assigned_to arrayındaki id'ləri tap və token dəyərlərini al
    const adminUsers = await AdminUser.find({
      _id: { $in: ids },
      // token field'i yoxdur AdminUser modelində - firebase_token və ya digər token field'ləri axtarmalı olacağıq
      // Hazırda socket üçün sadəcə id'ləri istifadə edəcəyik
    }).select("_id");

    if (adminUsers.length === 0) {
      return;
    }

    // Socket ilə getMessage eventini işə sal
    // Socket.io instance'a çatmaq üçün global io object lazımdır
    // req.app.get('io') və ya global.io istifadə edilə bilər
    if (global.io) {
      adminUsers.forEach((admin) => {
        global.io.to(`user-${admin._id}`).emit("getMessage", {
          type: "ticket_message",
          message: "Yeni ticket mesajı aldınız",
          timestamp: new Date(),
        });
      });
    }
  } catch (error) {
    console.error("Error in sendTicketNotif:", error);
  }
};
