// socket.js
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const initializeSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Store online users: userId -> Set<socketId>
  const onlineUsers = new Map();

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.id})`);

    // Add user to online users map
    if (!onlineUsers.has(socket.userId)) onlineUsers.set(socket.userId, new Set());
    onlineUsers.get(socket.userId).add(socket.id);

    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { status: 'online', lastSeen: new Date() })
      .catch(err => console.error('Error updating user status:', err));

    // Broadcast online users to all clients
    io.emit('users:online', Array.from(onlineUsers.keys()));

    // Notify this user about their connection
    socket.emit('connection:success', { userId: socket.userId, socketId: socket.id });

    // ===============================
    // Private & Group Message Handling
    // ===============================
    socket.on('message:send', (message) => {
      try {
        if (message.isGroupMessage && message.room) {
          // Send to room
          socket.to(message.room).emit('message:receive', message);
          console.log(`Message sent to room ${message.room}`);
        } else if (message.receiver) {
          // Send to all sockets of receiver
          const receiverSockets = onlineUsers.get(message.receiver);
          if (receiverSockets) {
            receiverSockets.forEach(sId => io.to(sId).emit('message:receive', message));
            console.log(`Message sent to user ${message.receiver}`);
          } else {
            console.log(`User ${message.receiver} is offline`);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: error.message });
      }
    });

    // ===============================
    // Typing Indicators
    // ===============================
    socket.on('typing:start', ({ recipientId, room }) => {
      const typingData = { userId: socket.userId, username: socket.user.username };
      if (room) {
        socket.to(room).emit('typing:display', { ...typingData, room });
      } else if (recipientId) {
        const recipientSockets = onlineUsers.get(recipientId);
        if (recipientSockets) {
          recipientSockets.forEach(sId => io.to(sId).emit('typing:display', typingData));
        }
      }
    });

    socket.on('typing:stop', ({ recipientId, room }) => {
      const typingData = { userId: socket.userId };
      if (room) {
        socket.to(room).emit('typing:hide', { ...typingData, room });
      } else if (recipientId) {
        const recipientSockets = onlineUsers.get(recipientId);
        if (recipientSockets) {
          recipientSockets.forEach(sId => io.to(sId).emit('typing:hide', typingData));
        }
      }
    });

    // ===============================
    // Message Read Receipts
    // ===============================
    socket.on('message:read', ({ messageId, senderId }) => {
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(sId =>
          io.to(sId).emit('message:read:update', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
          })
        );
      }
    });

    // ===============================
    // Disconnect
    // ===============================
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId} (${socket.id})`);

      // Remove this socket from online users
      if (onlineUsers.has(socket.userId)) {
        onlineUsers.get(socket.userId).delete(socket.id);
        if (onlineUsers.get(socket.userId).size === 0) onlineUsers.delete(socket.userId);
      }

      // Update user status to offline
      try {
        await User.findByIdAndUpdate(socket.userId, { status: 'offline', lastSeen: new Date() });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }

      // Broadcast updated online users
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  console.log('✅ Socket.io initialized successfully');
  return io;
};

module.exports = initializeSocket;
