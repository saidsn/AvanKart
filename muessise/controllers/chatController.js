import TicketMessage from "../../shared/model/partner/TicketMessage.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";

const saveMessage = async (socket, data) => {
  const { from, fromModel, to, toModel, message, ticket_id } = data;
  
  const myUser = await PartnerUser.findById(socket.user.id); 
  if (!myUser) {
    throw new Error("User not found");
  }

  if (!message || !ticket_id) {
    throw new Error("Missing required fields");
  }
  
  const newMessage = new TicketMessage({
    from: myUser._id,
    fromModel: "Muessise",
    to: null,
    toModel: "AdminUser",
    message,
    ticket_id,
    status: "sended",
  });

  const saved = await newMessage.save();
  return saved;
};

export default { saveMessage };
