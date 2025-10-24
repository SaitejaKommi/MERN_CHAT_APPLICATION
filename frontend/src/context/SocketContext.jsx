import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

      const newSocket = io(SOCKET_URL, { auth: { token } });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);

        // Register this socket with backend
        newSocket.emit('user:online', user._id);
      });

      newSocket.on('users:online', (users) => setOnlineUsers(users));
      newSocket.on('disconnect', () => console.log('Socket disconnected'));

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const sendPrivateMessage = (receiverId, message) => {
    if (socket) {
      socket.emit('message:send', {
        receiver: receiverId,
        sender: user._id,
        content: message.content,
        messageType: message.messageType || 'text',
        image: message.image
      });
    }
  };

  const sendTypingIndicator = (receiverId, room, isTyping) => {
    if (!socket) return;
    if (isTyping) socket.emit('typing:start', { recipientId: receiverId, room });
    else socket.emit('typing:stop', { recipientId: receiverId, room });
  };

  const value = { socket, onlineUsers, sendPrivateMessage, sendTypingIndicator };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
