const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /admin/posts/pending
exports.getPendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: 'pending' })
    .sort({ createdAt: 1 }) // oldest first = first come, first reviewed
    .populate('createdBy', 'name email');
  res.json({ success: true, count: posts.length, data: posts });
});

// Shared by approve and reject. The update only matches posts that are still
// "pending", so two admins clicking at the same time cannot clash.
async function decide(req, res, newStatus) {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    { status: newStatus },
    { new: true }
  );

  if (!post) {
    const existing = await Post.findById(req.params.id);
    if (!existing) throw new AppError('Post not found.', 404);
    throw new AppError(
      `Only pending posts can be ${newStatus}. This post is currently "${existing.status}".`,
      400
    );
  }

  res.json({ success: true, message: `Post ${newStatus}.`, data: post });
}

// PATCH /admin/posts/approve/:id
exports.approvePost = asyncHandler((req, res) => decide(req, res, 'approved'));

// PATCH /admin/posts/reject/:id
exports.rejectPost = asyncHandler((req, res) => decide(req, res, 'rejected'));
