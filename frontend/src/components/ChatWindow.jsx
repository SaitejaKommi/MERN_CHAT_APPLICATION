import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user } = useAuth();
  const { socket, sendPrivateMessage, sendTypingIndicator, onlineUsers } = useSocket();

  // Fetch messages when chat changes
  useEffect(() => {
    if (selectedChat) fetchMessages();
  }, [selectedChat]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('message:receive', (message) => {
      const senderId = message.sender && message.sender._id ? message.sender._id : message.sender;
      if (senderId === selectedChat?._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    socket.on('typing:display', (data) => {
      if (data.userId === selectedChat?._id) setIsTyping(true);
    });

    socket.on('typing:hide', (data) => {
      if (data.userId === selectedChat?._id) setIsTyping(false);
    });

    socket.on('message:read:update', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isRead: true, readAt: data.readAt } : msg
        )
      );
    });

    return () => {
      socket.off('message:receive');
      socket.off('typing:display');
      socket.off('typing:hide');
      socket.off('message:read:update');
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/conversation/${selectedChat._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fixed handleSendMessage
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat || (!newMessage.trim() && !selectedImage)) return;

    try {
      let response;

      // If image is selected, use FormData
      if (selectedImage) {
        const formData = new FormData();
        formData.append('receiver', selectedChat._id);
        formData.append('content', newMessage || '');
        formData.append('isGroupMessage', 'false'); // still string but backend will handle
        formData.append('image', selectedImage);

        // Debug log
        for (let [key, value] of formData.entries()) console.log(key, value);

        response = await api.post('/messages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // No image, send JSON
        const payload = {
          receiver: selectedChat._id,
          content: newMessage || '',
          isGroupMessage: false, // boolean
        };

        console.log('Sending payload:', payload);

        response = await api.post('/messages', payload);
      }

      const sentMessage = response.data;

      // Send via socket
      sendPrivateMessage(selectedChat._id, sentMessage);

      // Update locally
      setMessages((prev) => [...prev, sentMessage]);

      // Reset input
      setNewMessage('');
      setSelectedImage(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    sendTypingIndicator(selectedChat._id, null, true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(selectedChat._id, null, false);
    }, 1000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) setSelectedImage(file);
  };

  const isOnline = onlineUsers.includes(selectedChat?._id);

  if (!selectedChat)
    return (
      <div className="chat-window-empty">
        <h2>Select a chat to start messaging</h2>
      </div>
    );

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar">{selectedChat.username[0].toUpperCase()}</div>
          <div>
            <h3>{selectedChat.username}</h3>
            <span className="status">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="empty-message">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user._id || message.sender === user._id}
            />
          ))
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span>{selectedChat.username} is typing</span>
            <span className="dots">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        {selectedImage && (
          <div className="image-preview">
            <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
            <button type="button" onClick={() => setSelectedImage(null)}>
              ×
            </button>
          </div>
        )}
        <div className="input-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button type="button" className="image-button" onClick={() => fileInputRef.current?.click()}>
            📎
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
