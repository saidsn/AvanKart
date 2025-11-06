import fs from "fs";
import mongoose from "mongoose";
import Ticket from "../../../../shared/model/partner/ticket.js";
import TicketFile from "../../../../shared/model/partner/ticketFile.js";

let TicketMessage = null;
try {
  const mod = await import("../../../../shared/model/people/ticketMessage.js");
  TicketMessage = mod.default || mod.TicketMessage || null;
} catch { }

export default async function addFiles(req, res) {
  try {
    const { processedFiles } = req;
    const ticketIdRaw =
      req.params.ticketId || req.params.ticket_id || req.body.ticket_id;

    console.log(`Received ticketIdRaw: '${ticketIdRaw}'`);

    if (!ticketIdRaw) {
      for (const f of processedFiles || [])
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      return res
        .status(400)
        .json({ success: false, message: "ticket_id is required" });
    }
    const ticket = await Ticket.findOne({ ticket_id: ticketIdRaw });
    if (!ticket) {
      for (const f of processedFiles || [])
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    if (!processedFiles?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No files processed" });
    }
    const uploaderId =
      (req.user && (req.user._id || req.user.id)) ||
      new mongoose.Types.ObjectId();
    const savedFiles = [];
    for (const file of processedFiles) {
      const doc = new TicketFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route,
        file_path: file.path,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        uploader: uploaderId,
        ticket_id: ticket._id,
      });
      const saved = await doc.save();
      savedFiles.push(saved);
    }
    if (TicketMessage) {
      const text =
        savedFiles.length === 1
          ? `Fayl əlavə edildi: ${savedFiles[0].file_name}`
          : `Fayllar əlavə edildi: ${savedFiles
            .map((f) => f.file_name)
            .join(", ")}`;
      try {
        await TicketMessage.create({
          ticket_id: ticket._id,
          type: "system",
          text,
          files: savedFiles.map((f) => f._id),
          created_by: uploaderId,
          created_by_model: "PeopleUser",
        });
      } catch { }
    }
    return res.json({
      success: true,
      message: "Files uploaded",
      data: {
        uploadedFiles: savedFiles.map((f) => ({
          id: f._id,
          originalName: f.file_name,
          fileName: f.file_route?.split("/")?.pop() || f.file_name,
          fileSize: f.file_size,
          fileType: f.file_type,
          downloadUrl: f.file_route,
          uploadedAt: f.createdAt,
        })),
        ticketId: ticketIdRaw,
        totalFiles: savedFiles.length,
      },
    });
  } catch (error) {
    if (req.processedFiles) {
      for (const f of req.processedFiles) {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      }
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function deleteTicketFile(req, res) {
  try {
    const ticketIdRaw =
      req.params.ticketId || req.params.ticket_id || req.body.ticket_id;
    const fileIdRaw =
      req.params.fileId || req.params.file_id || req.body.file_id;
    if (!ticketIdRaw || !fileIdRaw) {
      return res.status(400).json({
        success: false,
        message: "ticket_id və file_id tələb olunur",
      });
    }
    const ticket = await Ticket.findOne({ ticket_id: ticketIdRaw });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket tapılmadı" });
    }
    const fileDoc = await TicketFile.findOne({
      _id: new mongoose.Types.ObjectId(fileIdRaw),
      ticket_id: ticket._id,
    });
    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        message: "Fayl tapılmadı (ticket_id və file_id uyğun gəlmir)",
      });
    }
    let deleted = false;
    try {
      if (typeof fileDoc.softDelete === "function") {
        await fileDoc.softDelete();
        deleted = true;
      }
    } catch { }
    if (!deleted) {
      const updateRes = await TicketFile.updateOne(
        { _id: fileDoc._id },
        {
          $set: {
            deletedAt: new Date(),
            deleted: true,
          },
        }
      );
      if (!updateRes.modifiedCount) {
        await TicketFile.deleteOne({ _id: fileDoc._id });
      }
    }
    if (TicketMessage) {
      try {
        await TicketMessage.create({
          ticket_id: ticket._id,
          type: "system",
          text: `Fayl silindi: ${fileDoc.file_name || fileIdRaw}`,
          files: [fileDoc._id],
          created_by: (req.user && (req.user._id || req.user.id)) || undefined,
          created_by_model: "PeopleUser",
        });
      } catch { }
    }
    return res.json({
      success: true,
      message: "Fayl uğurla silindi (serverdə fayl saxlanıldı)",
      data: { file_id: String(fileDoc._id), ticket_id: ticketIdRaw },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
