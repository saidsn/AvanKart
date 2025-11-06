// ALTERNATIV HƏLL: Controller-də real user ID istifadə edin

// controllers/fileUploadController.js - DÜZƏLDILMIŞ
import Ticket from "../../shared/model/partner/ticket.js";
import TicketFile from "../../shared/model/partner/ticketFile.js";
import fs from "fs";
import mongoose from "mongoose";
import FakturaFile from "../../shared/model/partner/fakturaFile.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import ExcelJS from "exceljs";

export const uploadTicketFiles = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { processedFiles, uploadMeta } = req;

    console.log(`💾 Saving ${processedFiles.length} files to database...`);

    // Check if ticket exists and user has access to it
    const user = req.user?.id;
    const myUser = await PeopleUser.findById(user);
    const sirket_id = myUser?.sirket_id;

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi şirkət məlumatları tapılmadı",
      });
    }

    const ticket = await Ticket.findOne({ ticket_id: ticketId, sirket_id: sirket_id });
    if (!ticket) {
      // Clean up uploaded files if ticket not found
      processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(404).json({
        success: false,
        message: "Ticket tapılmadı və ya sizə aid deyil",
      });
    }

    // Save files to database
    const savedFiles = [];

    for (const file of processedFiles) {
      // ✅ REAL USER ID ƏLDƏ ETMƏK
      let uploaderId = req.user.id || req.user._id;

      const ticketFile = new TicketFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route,
        file_path: file.path,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        uploader: uploaderId, // ✅ REAL ObjectId
        ticket_id: ticket._id,
        sirket_id: sirket_id,
        security_checked: true,
      });

      const savedFile = await ticketFile.save();
      savedFiles.push(savedFile);

      console.log(`💾 File saved to DB: ${file.originalName}`);
    }

    // Success response with consistent format
    res.json({
      success: true,
      message: `${savedFiles.length} fayl uğurla yükləndi`,
      files: savedFiles.map((file) => ({
        id: file._id,
        originalName: file.file_name,
        filename: file.file_route.split("/").pop(),
        size: file.file_size,
        mimetype: file.file_type,
        route: file.file_route,
        uploadedAt: file.createdAt,
      })),
      data: {
        uploadedFiles: savedFiles.map((file) => ({
          id: file._id,
          originalName: file.file_name,
          fileName: file.file_route.split("/").pop(),
          fileSize: file.file_size,
          fileType: file.file_type,
          downloadUrl: file.file_route,
          uploadedAt: file.createdAt,
        })),
        ticketId: ticketId,
        totalFiles: savedFiles.length,
      },
    });
  } catch (error) {
    console.error("File upload controller error:", error);

    // Clean up files on error
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Cleaned up file after error: ${file.path}`);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Server xətası",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

export const hesablashmaAddFaktura = async (req, res) => {
  try {
    const { hesablasmaId } = req.params;
    const { processedFiles, uploadMeta } = req;

    // PeopleUser-də axtarıb sirket_id götür
    const myUser = await PeopleUser.findById(req.user?.id || req.user?._id);
    if (!myUser?.sirket_id) {
      return res.status(400).json({
        success: false,
        message: res.__("messages.file_upload.sirket_id_not_found"),
      });
    }

    // Save files to database
    if (!processedFiles || processedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: res.__("messages.file_upload.file_not_found"),
      });
    }

    const savedFiles = [];

    for (const file of processedFiles) {
      const uploaderId =
        req.user._id || req.user.id || new mongoose.Types.ObjectId();

      const fakturaFile = new FakturaFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route,
        uploader: uploaderId,
        hesablasma_id: hesablasmaId,
      });

      const saved = await fakturaFile.save();
      savedFiles.push(saved);
    }

    // Success response
    res.json({
      success: true,
      message: res.__("messages.file_upload.files_uploaded", {
        count: savedFiles.length,
      }),
      data: savedFiles.map((file) => ({
        id: file._id,
        name: file.file_name,
        type: file.file_type,
        downloadUrl: file.file_route,
        uploadedAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error("uploadFakturaFiles error:", error);

    // Clean up files on error
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    res.status(500).json({
      success: false,
      message: res.__("messages.file_upload.server_error"),
    });
  }
};

export const excelUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: res.__("errors.file_upload.no_file_uploaded") });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet = workbook.worksheets[0];
    const ids = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = row.getCell(1).value;
      if (id) ids.push(id);
    });

    if (!ids.length || ids.length === 0) {
      return res
        .status(400)
        .json({ error: res.__("errors.file_upload.no_ids_in_excel") });
    }

    // PartnerUser → PeopleUser və partnyor_id saxlanılır
    const users = await PeopleUser.find({ partnyor_id: { $in: ids } });

    const myData = users.map((u) => ({
      id: u._id,
      partner_id: u.partnyor_id,
      name: `${u.name} ${u.surname}`,
      email: u.email,
      phone: `${u.phone_suffix ?? "994"}${u.phone}`,
    }));

    return res.status(200).json({ success: true, data: myData });
  } catch (error) {
    console.error("Excel upload error:", error);
    return res
      .status(500)
      .json({ error: res.__("errors.file_upload.internal_server_error") });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};
