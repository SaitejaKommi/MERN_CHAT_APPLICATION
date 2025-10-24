import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import './Chat.css';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{user?.username[0].toUpperCase()}</div>
            <div className="user-info">
              <h3>{user?.username}</h3>
              <span className="status">Online</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <ChatList 
          onSelectChat={setSelectedChat} 
          selectedChatId={selectedChat?._id} 
        />
      </div>
      <div className="chat-main">
        <ChatWindow selectedChat={selectedChat} />
      </div>
    </div>
  );
};

export default Chat;
