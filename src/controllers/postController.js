const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const TEXT_FIELDS = ['title', 'description', 'content', 'image', 'category'];
const USER_ALLOWED_STATUS = ['draft', 'pending']; // users can never set approved/rejected
const ALL_STATUS = ['draft', 'pending', 'approved', 'rejected'];

// Take only the allowed text fields from the request body and make sure they are strings.
function pickTextFields(body) {
  const out = {};
  for (const field of TEXT_FIELDS) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string') {
      throw new AppError(`"${field}" must be text.`, 400);
    }
    out[field] = body[field];
  }
  return out;
}

function checkUserStatus(status) {
  if (!USER_ALLOWED_STATUS.includes(status)) {
    throw new AppError(
      'status can only be "draft" or "pending". Only an admin can approve or reject posts.',
      400
    );
  }
}

function parsePaging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

// Loads a post and makes sure the logged-in user owns it.
async function getOwnedPost(id, user, action) {
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found.', 404);
  if (!post.createdBy.equals(user._id)) {
    throw new AppError(`You can only ${action} your own posts.`, 403);
  }
  return post;
}

// POST /posts   (needs token)
// status: "pending" (default, sends it for admin approval) or "draft" (just save it).
exports.createPost = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const fields = pickTextFields(body);

  const status = body.status === undefined ? 'pending' : body.status;
  checkUserStatus(status);

  const post = await Post.create({
    ...fields,
    status,
    createdBy: req.user._id, // always the logged-in user, never taken from the body
  });

  res.status(201).json({
    success: true,
    message: status === 'draft' ? 'Draft saved.' : 'Post submitted for admin approval.',
    data: post,
  });
});

// GET /posts   (public: approved posts only)
exports.getApprovedPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { status: 'approved' };

  // only accept plain text for category (blocks ?category[$ne]=x tricks)
  if (typeof req.query.category === 'string' && req.query.category.trim()) {
    filter.category = req.query.category.trim();
  }

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name'),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: posts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

// GET /posts/:id   (public: only if the post is approved)
exports.getApprovedPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'approved' }).populate(
    'createdBy',
    'name'
  );
  if (!post) throw new AppError('Post not found.', 404);
  res.json({ success: true, data: post });
});

// GET /posts/my-posts   (needs token) - all of MY posts and drafts
exports.getMyPosts = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };

  if (typeof req.query.status === 'string' && req.query.status) {
    if (!ALL_STATUS.includes(req.query.status)) {
      throw new AppError(`status filter must be one of: ${ALL_STATUS.join(', ')}`, 400);
    }
    filter.status = req.query.status;
  }

  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, data: posts });
});

// PATCH /posts/:id   (needs token, owner only)
exports.updatePost = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const post = await getOwnedPost(req.params.id, req.user, 'edit');

  const fields = pickTextFields(body);
  const contentChanged = Object.keys(fields).length > 0;

  if (!contentChanged && body.status === undefined) {
    throw new AppError('Nothing to update. Send title, description, content, image, category or status.', 400);
  }

  Object.assign(post, fields);

  if (body.status !== undefined) {
    checkUserStatus(body.status);
    post.status = body.status; // e.g. draft -> pending submits it for approval
  } else if (post.status === 'approved' && contentChanged) {
    // Editing a live post sends it back for review so nobody can sneak in new content.
    post.status = 'pending';
  }

  await post.save(); // runs the schema validation again
  res.json({ success: true, message: 'Post updated.', data: post });
});

// DELETE /posts/:id   (needs token, owner only)
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await getOwnedPost(req.params.id, req.user, 'delete');
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted.' });
});
