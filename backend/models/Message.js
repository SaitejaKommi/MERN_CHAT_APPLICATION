
// ============================================
// Message.js
// ============================================
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  room: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: function() {
      return !this.image;
    }
  },
  image: {
    type: String,
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isGroupMessage: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, isGroupMessage: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Validation: Ensure either receiver or room is set based on message type
messageSchema.pre('save', function(next) {
  if (this.isGroupMessage && !this.room) {
    return next(new Error('Room is required for group messages'));
  }
  if (!this.isGroupMessage && !this.receiver) {
    return next(new Error('Receiver is required for private messages'));
  }
  next();
});

// Static method: Get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ],
    isGroupMessage: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username avatar status')
    .populate('receiver', 'username avatar status');
};

// Static method: Get room messages
messageSchema.statics.getRoomMessages = async function(roomName, limit = 50) {
  return this.find({ room: roomName, isGroupMessage: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username avatar status');
};

// Static method: Get unread message count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    isGroupMessage: false
  });
};

module.exports = mongoose.model('Message', messageSchema);