import chatController from "../controllers/chatController.js";

export const chatHandler = (socket, io) => {
  socket.on("sendMessage", async (data) => {
    try {
      const savedMessage = await chatController.saveMessage(socket, data);

      io.to(`user-${data.to}`).emit("getMessage", savedMessage);
    } catch (err) {
      console.error("Chat error:", err.message);
      socket.emit("errorMessage", { message: "Mesaj göndərilə bilmədi" });
    }
  });
};
