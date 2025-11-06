import Ticket from "../shared/model/partner/ticket.js";
import TicketFile from "../shared/model/partner/ticketFile.js";
import path from "path";

export const ticketFileUpload = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { processedFiles, uploadMeta } = req;

    console.log(`📁 ${processedFiles.length} fayl veritabanına saxlanılır...`);

    // Ticket-in mövcudluğunu yoxla
    const ticket = await Ticket.findOne({ ticket_id: ticketId });
    if (!ticket) {
      // Clean up uploaded files if ticket not found
      processedFiles.forEach((file) => {
        if (require("fs").existsSync(file.path)) {
          require("fs").unlinkSync(file.path);
        }
      });

      return res.status(404).json({
        success: false,
        message: "Ticket tapılmadı",
      });
    }

    // Save files to database
    const savedFiles = [];

    for (const file of processedFiles) {
      const ticketFile = new TicketFile({
        file_name: file.originalName,
        file_type: file.mimetype,
        file_route: file.route, // Web-də görünəcək yol
        file_path: file.path, // Server-də fiziki yol
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        uploader: uploadMeta.userId,
        ticket_id: ticket._id,
        sirket_id: uploadMeta.sirketId,
      });

      const savedFile = await ticketFile.save();
      savedFiles.push(savedFile);

      console.log(
        `💾 Fayl saxlanıldı: ${file.originalName} -> ${file.filename}`
      );
    }

    // Success response
    res.json({
      success: true,
      message: `${savedFiles.length} fayl uğurla yükləndi`,
      data: {
        uploadedFiles: savedFiles.map((file) => ({
          id: file._id,
          originalName: file.file_name,
          fileName: path.basename(file.file_route),
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
    console.error("File upload controller xətası:", error);

    // Clean up files on error
    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (require("fs").existsSync(file.path)) {
          require("fs").unlinkSync(file.path);
          console.log(`🗑️ Xətadan sonra fayl silindi: ${file.path}`);
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

// Delete file controller (soft delete)
export const deleteTicketFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.user_id;

    const ticketFile = await TicketFile.findById(fileId);

    if (!ticketFile) {
      return res.status(404).json({
        success: false,
        message: "Fayl tapılmadı",
      });
    }

    // Check permissions (only uploader or admin can delete)
    if (ticketFile.uploader !== userId && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bu faylı silmək icazəniz yoxdur",
      });
    }

    // Soft delete
    await ticketFile.delete(); // softDeletePlugin method

    console.log(`🗑️ Fayl soft delete edildi: ${ticketFile.file_name}`);

    res.json({
      success: true,
      message: "Fayl uğurla silindi",
      fileId: fileId,
    });
  } catch (error) {
    console.error("File delete xətası:", error);
    res.status(500).json({
      success: false,
      message: "Fayl silinərkən xəta baş verdi",
    });
  }
};
