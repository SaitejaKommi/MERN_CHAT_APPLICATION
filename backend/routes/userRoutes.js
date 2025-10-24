const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateProfile, 
  searchUsers 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// User routes
router.get('/', getUsers);
router.get('/search/:query', searchUsers);
router.put('/profile', updateProfile);
router.get('/:id', getUserById); // Should be last to avoid conflicts

module.exports = router;