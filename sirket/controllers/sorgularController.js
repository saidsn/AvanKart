import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ticket from "../../shared/model/partner/ticket.js";
import TicketFile from "../../shared/model/partner/ticketFile.js";
import TicketMessage from "../../shared/model/partner/TicketMessage.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import SorgularReason from "../../shared/model/partner/sorgularReason.js";
import i18n from "i18n";

export const getSorgularInside = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Validate user and get sirket_id for security
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id) {
      return res.status(400).render("error/404", {
        message: "İstifadəçi şirkət məlumatları tapılmadı",
        layout: false,
      });
    }

    // Sorğunu tap (sirket_id ilə filtrlə)
    const sorgu = await Ticket.findOne({ ticket_id: ticketId, sirket_id: sirket_id })
      .populate("user_id", "name email initials")
      .populate("assigned", "name email initials")
      .populate("reason", "name")
      .lean();

    if (!sorgu) {
      try {
        return res.status(404).render("error/404", {
          message: `Ticket ID: ${ticketId} tapılmadı`,
          layout: false,
        });
      } catch {
        return res.status(404).json({
          error: "Sorğu tapılmadı",
          ticketId,
          csrfToken: req.csrfToken(),
          message: "Axtardığınız sorğu mövcud deyil",
          redirect: "/sorgular",
        });
      }
    }

    // Əlaqəli fayllar
    const files = await TicketFile.find({ ticket_id: sorgu._id })
      .populate("uploader", "name email")
      .lean();

    // Mesajlar
    const messages = await TicketMessage.find({ ticket_id: sorgu._id })
      .populate("from", "name email initials")
      .populate("to", "name email initials")
      .sort({ createdAt: 1 })
      .lean();

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
        isOwn: msg.fromModel === "Sirket", // öz istifadəçi ilə müqayisə etmək üçün dəyişə bilərsən
      })),
    };

    // Problem səbəbləri
    const problemReasons = sorgu.reason ?? [];

    return res.render("pages/sorgular/inside", {
      sorgu: { ...sorgu, problemReasons, files },
      csrfToken: req.csrfToken(),
      chatData,
      currentUser: req.user || null,
      // layout: false,
    });
  } catch (error) {
    console.error("getSorgularInside error:", error);
    try {
      res.status(500).render("error/500", {
        message: "Server xətası baş verdi",
        error: process.env.NODE_ENV === "development" ? error.message : null,
        layout: false,
      });
    } catch {
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
    csrfToken: req.csrfToken(),
    subcategories
  });
};

export const sorgularTable = async (req, res) => {
  try {
    const { start_date, end_date, status, subject, draw, search } = req.body;
    const query = search ?? null;
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    const filter = { sirket_id };

    // tarix filtri
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }

    // status filtri
    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    // subject filtri
    if (subject) {
      filter.subject = Array.isArray(subject) ? { $in: subject } : subject;
    }

    // search query
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    const recordsTotal = await Ticket.countDocuments({ sirket_id });
    const recordsFiltered = await Ticket.countDocuments(filter);

    const tickets = await Ticket.find(filter)
      .populate("user_id", "name surname")
      .lean();

    const formatted = tickets.map((ticket) => ({
      id: ticket.ticket_id,
      title: ticket.title,
      problem: ticket.content,
      name: ticket.assigned?.length ? "Orxan icraçı" : "Təyin edilməyib",
      status: i18n.__("sorgular.sorgular.filter_" + ticket.status.toLowerCase()) || "Baxılır",
      date: ticket.createdAt
        ? new Date(ticket.createdAt).toLocaleDateString("az-AZ")
        : "-",
      user: ticket.subject ?? "AP İstifadəçi",
      priority: ticket.priority
        ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
        : "Medium",
    }));

    return res.status(200).json({
      data: formatted,
      recordsTotal,
      recordsFiltered,
      draw,
    });
  } catch (err) {
    console.error("sorgularTable error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addSorgu = async (req, res) => {
  console.log("🚀 === addSorgu controller reached ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.keys(req.headers));

  try {
    const { category, purpose, subject, title, content } = req.body;
    const { processedFiles, uploadMeta } = req;

    console.log('addSorgu request body:', { category, purpose, subject, title, content });
    console.log('User:', req.user);
    console.log('User:', req.user);

    // Validate user and get sirket_id
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi şirkət məlumatları tapılmadı",
      });
    }

    console.log('User sirket_id:', sirket_id);

    // son ticket nömrəsini götür
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    let number = 1;
    if (lastTicket?.ticket_id) {
      const match = lastTicket.ticket_id.match(/S-(\d{9})/);
      if (match) number = parseInt(match[1]) + 1;
    }
    const ticket_id = `S-${number.toString().padStart(9, "0")}`;

    console.log('Generated ticket_id:', ticket_id);

    // Validate and convert reason (purpose) to ObjectId if provided
    let reasonId = null;
    if (purpose && purpose.trim() !== '') {
      try {
        // Check if purpose is a valid ObjectId
        if (purpose.match(/^[0-9a-fA-F]{24}$/)) {
          reasonId = purpose;
        } else {
          console.log('Purpose is not a valid ObjectId, setting to null:', purpose);
        }
      } catch (error) {
        console.log('Error validating purpose as ObjectId:', error.message);
      }
    }

    // yeni ticket yarat
    const newTicket = new Ticket({
      category: category || '',
      reason: reasonId, // Use validated ObjectId or null
      subject: subject || 'AP İstifadəçi',
      title,
      content,
      user_id: req.user.id,
      userModel: 'PeopleUser', // Set the correct user model
      sirket_id: sirket_id, // Add sirket_id to ticket
      ticket_id,
      status: 'baxilir', // Set default status
      priority: 'medium', // Set default priority
    });

    const savedTicket = await newTicket.save();
    console.log('Saved ticket:', savedTicket._id);

    // faylları əlavə et
    if (processedFiles?.length > 0) {
      console.log(`Adding ${processedFiles.length} files to ticket`);
      for (const file of processedFiles) {
        const ticketFile = new TicketFile({
          file_name: file.originalName,
          file_type: file.mimetype,
          file_route: file.route,  // Web-accessible path like /files/uploads/{sirketId}/{filename}
          file_path: file.route,   // Store route for backward compatibility (downloads need web path)
          file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          uploader: uploadMeta.userId,
          ticket_id: savedTicket._id,
          sirket_id: uploadMeta.sirketId,
        });
        await ticketFile.save();
        console.log('Saved file:', file.originalName);
      }
    }

    return res.json({
      success: true,
      message: "Sorğu uğurla yaradıldı",
      data: {
        ticket_id: savedTicket.ticket_id,
        id: savedTicket._id
      }
    });
  } catch (error) {
    console.error("addSorgu error:", error);

    // uğursuzluqda upload olunan faylları sil
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

export const uploadFilesToTicket = async (req, res) => {
  console.log("🚀 === uploadFilesToTicket controller reached ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Ticket ID from params:", req.params.ticketId);

  try {
    const { ticketId } = req.params;
    const { processedFiles, uploadMeta } = req;

    console.log('Upload request for ticket:', ticketId);
    console.log('Processed files count:', processedFiles?.length || 0);
    console.log('Upload meta:', uploadMeta);

    // Validate user and get sirket_id
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi şirkət məlumatları tapılmadı",
      });
    }

    console.log('User sirket_id:', sirket_id);

    // Find the ticket with security check
    const ticket = await Ticket.findOne({
      ticket_id: ticketId,
      sirket_id: sirket_id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Sorğu tapılmadı və ya sizə məxsus deyil",
      });
    }

    console.log('Found ticket:', ticket._id);

    // Check if files were uploaded
    if (!processedFiles || processedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Heç bir fayl yüklənməyib",
      });
    }

    // Save uploaded files
    const savedFiles = [];
    for (const file of processedFiles) {
      const ticketFile = new TicketFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route,  // Web-accessible path like /files/uploads/{sirketId}/{filename}
        file_path: file.route,   // Store route for backward compatibility (downloads need web path)
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        uploader: uploadMeta.userId,
        ticket_id: ticket._id,
        sirket_id: uploadMeta.sirketId,
      });

      const savedFile = await ticketFile.save();
      savedFiles.push({
        filename: file.originalName,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        route: file.route,
        id: savedFile._id
      });

      console.log('Saved file:', file.originalName);
    }

    return res.json({
      success: true,
      message: `${savedFiles.length} fayl uğurla yükləndi`,
      files: savedFiles,
      data: {
        ticket_id: ticket.ticket_id,
        id: ticket._id
      }
    });
  } catch (error) {
    console.error("uploadFilesToTicket error:", error);

    // Clean up uploaded files on error
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

export const downloadTicketFile = async (req, res) => {
  try {
    console.log('=== downloadTicketFile CALLED ===');
    const { fileId } = req.params;

    console.log('File ID:', fileId);

    // Find the file record
    const fileRecord = await TicketFile.findById(fileId);

    if (!fileRecord) {
      console.log('❌ File not found');
      return res.status(404).json({
        success: false,
        error: "Fayl tapılmadı"
      });
    }

    console.log('Found file:', fileRecord.file_name);

    // Validate user has access to this file
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id || fileRecord.sirket_id.toString() !== sirket_id.toString()) {
      console.log('❌ Access denied - sirket mismatch');
      return res.status(403).json({
        success: false,
        error: "Bu fayla giriş icazəniz yoxdur"
      });
    }

    // Construct the file path from the web route
    // fileRecord.file_route is like: /files/uploads/{sirketId}/{filename}
    // __dirname is: /Users/.../ava-backend/sirket/controllers
    // We go up one level (..) to reach sirket, then add public + file_route
    const filePath = path.join(__dirname, '..', 'public', fileRecord.file_route);

    console.log('File route from DB:', fileRecord.file_route);
    console.log('Constructed file path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        error: "Fayl sistemdə tapılmadı"
      });
    }

    // Use res.download for file download
    res.download(filePath, fileRecord.file_name, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            error: "Fayl yüklənməsində xəta baş verdi"
          });
        }
      } else {
        console.log('✅ File download completed:', fileRecord.file_name);
      }
    });

  } catch (error) {
    console.error('downloadTicketFile error:', error);
    return res.status(500).json({
      success: false,
      error: "Fayl yüklənməsində xəta baş verdi"
    });
  }
};

export const deleteTicketFile = async (req, res) => {
  try {
    console.log('=== deleteTicketFile CALLED ===');
    const { fileId } = req.params;

    console.log('File ID:', fileId);

    // Find the file record
    const fileRecord = await TicketFile.findById(fileId);

    if (!fileRecord) {
      console.log('❌ File not found');
      return res.status(404).json({
        success: false,
        error: "Fayl tapılmadı"
      });
    }

    console.log('Found file:', fileRecord.file_name);

    // Validate user has access to this file
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id || fileRecord.sirket_id.toString() !== sirket_id.toString()) {
      console.log('❌ Access denied - sirket mismatch');
      return res.status(403).json({
        success: false,
        error: "Bu fayla giriş icazəniz yoxdur"
      });
    }

    // Construct the file path from the web route
    const filePath = path.join(__dirname, '..', 'public', fileRecord.file_route);

    console.log('File route from DB:', fileRecord.file_route);
    console.log('File path to delete:', filePath);

    // Delete file from disk if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ File deleted from disk:', filePath);
    } else {
      console.log('⚠️ File not found on disk (will delete from DB anyway):', filePath);
    }

    // Delete from database
    await TicketFile.findByIdAndDelete(fileId);
    console.log('✅ File deleted from database');

    return res.status(200).json({
      success: true,
      message: "Fayl uğurla silindi"
    });

  } catch (error) {
    console.error('deleteTicketFile error:', error);
    return res.status(500).json({
      success: false,
      error: "Fayl silinməsində xəta baş verdi"
    });
  }
};
