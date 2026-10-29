const express = require('express');
const { improvePost } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.post('/improve/:postId', protect, validateId('postId'), improvePost);

module.exports = router;
