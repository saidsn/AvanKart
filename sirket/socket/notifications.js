export default function notificationHandler(socket, io) {
  // Dışarıdan başka biri bu kullanıcıya bildiriş göndermek isterse
  socket.on('notifyMe', ({ userId, message, status, category }) => {
    // userId'ye özel oda varsa oraya gönder
    io.to(`user-${userId}`).emit('notification', {
      title: 'Notification',
      status,
      category,
      message,
    });
  });

  // Dışarıdan başka biri bu kullanıcıya bildiriş göndermek isterse
  socket.on('notifyPage', ({ userId, message, status, category }) => {
    // userId'ye özel oda varsa oraya gönder
    io.to(`user-${userId}`).emit('notificationPage', {
      title: 'Notification',
      message,
    });
  });


  socket.on('sendMessage', ({ userId, message }) => {
    io.emit('getMessage', { userId, message });
  });
  
}