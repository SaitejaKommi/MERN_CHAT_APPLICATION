import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import './ChatList.css';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { onlineUsers } = useSocket();

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await api.get(`/users/search/${query}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      fetchUsers();
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="conversations-section">
        <h3>Recent Chats</h3>
        {conversations.length === 0 ? (
          <p className="empty-message">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.user._id}
              className={`conversation-item ${selectedChatId === conv.user._id ? 'active' : ''}`}
              onClick={() => onSelectChat(conv.user)}
            >
              <div className="avatar-container">
                <div className="avatar">{conv.user.username[0].toUpperCase()}</div>
                {isUserOnline(conv.user._id) && <span className="online-indicator"></span>}
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <h4>{conv.user.username}</h4>
                  <span className="timestamp">{formatTime(conv.lastMessage.createdAt)}</span>
                </div>
                <div className="last-message">
                  <p>{conv.lastMessage.messageType === 'image' ? '📷 Image' : conv.lastMessage.content}</p>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="users-section">
        <h3>All Users</h3>
        {users.length === 0 ? (
          <p className="empty-message">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`user-item ${selectedChatId === user._id ? 'active' : ''}`}
              onClick={() => onSelectChat(user)}
            >
              <div className="avatar-container">
                <div className="avatar">{user.username[0].toUpperCase()}</div>
                {isUserOnline(user._id) && <span className="online-indicator"></span>}
              </div>
              <div className="user-info">
                <h4>{user.username}</h4>
                <span className="status">{isUserOnline(user._id) ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
