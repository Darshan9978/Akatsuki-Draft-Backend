const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { improveText } = require('../services/gemini');

const MAX_INPUT_CHARS = 20000;

// POST /ai/improve/:postId   (needs token, owner only)
// Reads the post, asks Gemini to improve its content, and saves the result as a
// NEW draft (new ID). The original post is never changed.
exports.improvePost = asyncHandler(async (req, res) => {
  const original = await Post.findById(req.params.postId);
  if (!original) throw new AppError('Post not found.', 404);
  if (!original.createdBy.equals(req.user._id)) {
    throw new AppError('You can only improve your own posts.', 403);
  }
  if (!original.content || !original.content.trim()) {
    throw new AppError('This post has no content to improve.', 400);
  }
  if (original.content.length > MAX_INPUT_CHARS) {
    throw new AppError(`Content is too long for AI improvement (max ${MAX_INPUT_CHARS} characters).`, 400);
  }

  const improvedContent = await improveText(original.content);

  const improvedDraft = await Post.create({
    title: original.title,
    description: original.description,
    content: improvedContent,
    image: original.image,
    category: original.category,
    createdBy: req.user._id,
    status: 'draft',
  });

  res.status(201).json({
    success: true,
    message: 'AI-improved version saved as a new draft. The original post was not changed.',
    originalPostId: original._id,
    data: improvedDraft,
  });
});
