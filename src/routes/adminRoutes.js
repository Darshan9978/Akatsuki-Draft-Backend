const express = require('express');
const { getPendingPosts, approvePost, rejectPost } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

// Every route in this file needs a valid token AND the admin role.
router.use(protect, adminOnly);

router.get('/posts/pending', getPendingPosts);
router.patch('/posts/approve/:id', validateId('id'), approvePost);
router.patch('/posts/reject/:id', validateId('id'), rejectPost);

module.exports = router;
