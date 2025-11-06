import SorgularReason from "../../shared/model/partner/sorgularReason.js";
import Ticket from "../../shared/model/partner/ticket.js";
import TicketFile from "../../shared/model/partner/ticketFile.js";
import TicketMessage from "../../shared/model/partner/TicketMessage.js";
import AdminUser from "../../shared/models/adminUsersModel.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import i18n from "i18n";

export const getSorgularInside = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // ticket_id field-i ilə axtarış (S-123456789 format)
    const sorgu = await Ticket.findOne({ ticket_id: ticketId })
      .populate("user_id", "name email initials")
      .populate("assigned", "name email initials")
      .lean();

    if (!sorgu) {
      console.log("Sorgu tapılmadı:", ticketId);

      // Error template mövcudluğunu yoxla və ya sadə response göndər
      try {
        return res.status(404).render("error/404", {
          message: `Ticket ID: ${ticketId} tapılmadı`,
          layout: false, // EJS layout-dan istifadə etmə
        });
      } catch (templateError) {
        // Əgər template yoxdursa, JSON response göndər
        return res.status(404).json({
          error: "Sorğu tapılmadı",
          ticketId: ticketId,
          csrfToken: req.csrfToken(),
          message: "Axtardığınız sorğu mövcud deyil",
          redirect: "/sorgular",
        });
      }
    }

    // Əlaqəli faylları əldə et
    const files = await TicketFile.find({ ticket_id: sorgu._id })
      .populate("uploader", "name email")
      .lean();

    // Chat məlumatlarını əldə et
    const messages = await TicketMessage.find({ ticket_id: sorgu._id })
      .populate("from", "name email initials")
      .populate("to", "name email initials")
      .sort({ createdAt: 1 })
      .lean();
    console.log(messages);
    // Chat data formatını hazırla
    const chatData = {
      messages: messages.map((msg, index) => ({
        id: index + 1,
        sender: msg.from?.name || "Naməlum",
        message: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString("az-AZ", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        isOwn: msg.fromModel === "Muessise" ?? false, // Default olaraq false, real user ID ilə müqayisə edin
      })),
    };

    // Problemin səbəbləri array olaraq hazırla
    const problemReasons = sorgu.reason
      ? sorgu.reason.split("\n").filter((r) => r.trim())
      : [];

    // EJS template-ə data göndər
    res.render("pages/sorgular/inside", {
      sorgu: {
        ...sorgu,
        problemReasons,
        files,
      },
      csrfToken: req.csrfToken(),
      chatData,
      currentUser: req.user || null,
      layout: false, // Əgər layout problemləri varsa
    });
  } catch (error) {
    console.error("getSorgularInside xətası:", error);

    // Error template yoxlaması
    try {
      res.status(500).render("error/500", {
        message: "Server xətası baş verdi",
        error: process.env.NODE_ENV === "development" ? error.message : null,
        layout: false,
      });
    } catch (templateError) {
      // Template yoxdursa JSON response
      res.status(500).json({
        error: "Server xətası",
        message: "Gözlənilməz xəta baş verdi",
        details: process.env.NODE_ENV === "development" ? error.message : null,
      });
    }
  }
};

export const showSorgularPage = async (req, res) => {
  const subcategories = await SorgularReason.find(); 
  return res.render("pages/sorgular/sorgular", {
    title: "Sorgular",
    subcategories,
    csrfToken: req.csrfToken(),
  });
};

export const sorgularTable = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      // min, max,
      status,
      subject,
      search,
    } = req.body;
    const query = search[0] ?? '';
    const user = req.user?.id;
    const myUser = await PartnerUser.findById(user);
    const muessise_id_obj = myUser?.muessise_id;

    const filter = { muessise_id: muessise_id_obj };
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }

    // Handle status filter - can be string or array
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        // Single status value as string
        filter.status = status;
      }
    }

    // Handle subject filter - can be string or array
    if (subject) {
      if (Array.isArray(subject)) {
        filter.subject = { $in: subject };
      } else {
        // Single subject value as string
        filter.subject = subject;
      }
    }

    if (query && query !== '') {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    const recordsTotal = await Ticket.countDocuments({
      muessise_id: muessise_id_obj,
    });

    // Filtrelenmiş kayıt sayısı
    const recordsFiltered = await Ticket.countDocuments(filter);

    const tickets = await Ticket.find(filter)
      .populate("user_id", "name surname")
      .lean();

    const formatted = tickets.map((ticket) => {
      return {
        id: ticket.ticket_id,
        title: ticket.title,
        problem: ticket.content,
        name: ticket.assigned?.length ? "Orxan icraçı" : "Təyin edilməyib",
        status: i18n.__("sorgular.sorgular.filter_"+ticket.status.toLowerCase()) || "Baxılır",
        date: ticket.createdAt
          ? new Date(ticket.createdAt).toLocaleDateString("az-AZ")
          : "-",
        user: ticket.subject ?? "AP İstifadəçi",
        priority: ticket.priority
          ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
          : "Medium",
      };
    });

    return res
      .status(200)
      .json({
        data: formatted,
        recordsTotal,
        recordsFiltered,
        draw: req.body.draw,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addSorgu = async (req, res) => {
  try {
    const { category, purpose, subject, title, content } = req.body;
    const { processedFiles, uploadMeta } = req;

    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    let number = 1;
    if (lastTicket?.ticket_id) {
      const match = lastTicket.ticket_id.match(/S-(\d{9})/);
      if (match) number = parseInt(match[1]) + 1;
    }
    const ticket_id = `S-${number.toString().padStart(9, "0")}`;

    const newTicket = new Ticket({
      category,
      reason: purpose,
      subject,
      title,
      content,
      user_id: req.user.id,
      ticket_id,
    });

    const savedTicket = await newTicket.save();

    if (processedFiles && processedFiles.length > 0) {
      for (const file of processedFiles) {
        const ticketFile = new TicketFile({
          file_name: file.originalName,
          file_type: file.mimetype,
          file_route: file.route,
          file_path: file.path,
          file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          uploader: uploadMeta.userId,
          ticket_id: savedTicket._id,
          muessise_id: uploadMeta.muessiseId,
        });

        await ticketFile.save();
      }
    }

    return res.json({
      success: true,
      message: "Sorğu uğurla yaradıldı",
    });
  } catch (error) {
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (require("fs").existsSync(file.path)) {
          require("fs").unlinkSync(file.path);
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server xətası",
    });
  }
};

