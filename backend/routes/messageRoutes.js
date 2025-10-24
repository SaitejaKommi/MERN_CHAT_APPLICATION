const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getConversation, 
  getRoomMessages, 
  markAsRead, 
  getRecentConversations 
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

router.post('/', protect, upload.single('image'), sendMessage);
router.get('/conversations', protect, getRecentConversations);
router.get('/conversation/:userId', protect, getConversation);
router.get('/room/:roomName', protect, getRoomMessages);
router.put('/:messageId/read', protect, markAsRead);

module.exports = router;  
