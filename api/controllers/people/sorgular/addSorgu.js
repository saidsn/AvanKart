import Ticket from "../../../../shared/model/partner/ticket.js";
import TicketFile from "../../../../shared/model/partner/ticketFile.js";
import PartnerUser from "../../../../shared/models/partnyorUserModel.js";
import fs from "fs";
import PeopleUser from "../../../../shared/models/peopleUserModel.js";

export const addSorgu = async (req, res) => {
  try {
    const { category, purpose, subject, title, content, userModel } = req.body;
    const { processedFiles, uploadMeta } = req;

    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    let number = 1;
    if (lastTicket?.ticket_id) {
      const match = lastTicket.ticket_id.match(/S-(\d{9})/);
      if (match) number = parseInt(match[1]) + 1;
    }
    const ticket_id = `S-${number.toString().padStart(9, "0")}`;
    const myUser = await PeopleUser.findById(req.user);
    const newTicket = new Ticket({
      category,
      reason: purpose,
      title,
      content,
      user_id: req.user,
      ticket_id,
      userModel: userModel || 'PeopleUser', // req.body-dən gələn dəyəri əlavə edin, əks halda default dəyəri saxlayın
      // muessise_id: uploadMeta.sirketId !== 'DEFAULT_SIRKET' ? uploadMeta.sirketId : null,
      sirket_id: uploadMeta?.sirketId !== 'DEFAULT_SIRKET' ? myUser.sirket_id : null
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
          uploader: uploadMeta.userId || req.user,
          ticket_id: savedTicket._id,
          muessise_id: uploadMeta.sirketId !== 'DEFAULT_SIRKET' ? uploadMeta.sirketId : null,
        });
        await ticketFile.save();
      }
    }

    return res.json({
      success: true,
      message: "Sorğu uğurla yaradıldı",
      data: {
        ticket_id: savedTicket.ticket_id,
        _id: savedTicket._id,
      },
    });
  } catch (error) {
    console.error("AddSorgu error:", error);

    if (req.processedFiles) {
      req.processedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
};
