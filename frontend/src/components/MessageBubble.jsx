import './MessageBubble.css';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {message.messageType === 'image' && message.image && (
          <img src={`http://localhost:5000${message.image}`} alt="Message" className="message-image" />
        )}
        {message.content && <p>{message.content}</p>}
      </div>
      <div className="message-meta">
        <span className="message-time">{formatTime(message.createdAt)}</span>
        {isOwn && (
          <span className="message-status">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
