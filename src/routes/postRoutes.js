const express = require('express');
const {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', getApprovedPosts); // public

// IMPORTANT: '/my-posts' must be declared BEFORE '/:id',
// otherwise Express would treat the word "my-posts" as an ID.
router.get('/my-posts', protect, getMyPosts);

router.get('/:id', validateId('id'), getApprovedPostById); // public
router.patch('/:id', protect, validateId('id'), updatePost);
router.delete('/:id', protect, validateId('id'), deletePost);

module.exports = router;
