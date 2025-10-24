const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    let { receiver, room, content, messageType, isGroupMessage } = req.body;

    // Convert string 'true'/'false' to boolean
    isGroupMessage = isGroupMessage === 'true';

    // Validation
    if (!content && !req.file) {
      return res.status(400).json({ message: 'Message content or image is required' });
    }

    if (!isGroupMessage && !receiver) {
      return res.status(400).json({ message: 'Receiver is required for private messages' });
    }

    if (isGroupMessage && !room) {
      return res.status(400).json({ message: 'Room is required for group messages' });
    }

    const messageData = {
      sender: req.user._id,
      content: content || '',
      messageType: messageType || 'text',
      isGroupMessage: isGroupMessage || false
    };

    if (!isGroupMessage && receiver) messageData.receiver = receiver;
    if (isGroupMessage && room) messageData.room = room;
    if (req.file) {
      messageData.image = `/uploads/${req.file.filename}`;
      messageData.messageType = 'image';
    }

    const message = await Message.create(messageData);
    await message.populate('sender', 'username avatar status');
    if (!isGroupMessage && receiver) {
      await message.populate('receiver', 'username avatar status');
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------- ADD THIS -------------------
// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      isGroupMessage: false,
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username avatar status')
      .populate('receiver', 'username avatar status');

    messages.reverse(); // show oldest first
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ------------------- END -------------------

const getRoomMessages = async (req, res) => {
  try {
    const { roomName } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      isGroupMessage: true,
      room: roomName
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username avatar status');

    messages.reverse();
    res.json(messages);
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (!message.receiver) return res.status(400).json({ message: 'Cannot mark group message as read' });

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecentConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      isGroupMessage: false,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username avatar status')
      .populate('receiver', 'username avatar status');

    const conversationsMap = new Map();

    messages.forEach(message => {
      if (!message.sender || !message.receiver) return;

      const partnerId = message.sender._id.toString() === req.user._id.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.toString() === req.user._id.toString()
          ? message.receiver
          : message.sender;

        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      if (message.receiver._id.toString() === req.user._id.toString() && !message.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation, // ✅ now defined
  getRoomMessages,
  markAsRead,
  getRecentConversations
};
