import { verifySocketConnection } from "../utils/socketAuth.js";
import notificationHandler from "./notifications.js";
import { chatHandler } from "./chat.js";

export default function initSocket(io) {
  io.use(verifySocketConnection);

  io.on("connection", (socket) => {
    const userId = socket.user?.id;

    if (userId) {
      socket.join(`user-${userId}`);
    }

    notificationHandler(socket, io);
    chatHandler(socket, io);
  });
}
