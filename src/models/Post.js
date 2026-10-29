const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [50000, 'Content must be at most 50000 characters'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
      validate: {
        // Empty is fine. Otherwise it must be an http(s) link.
        validator: (v) => v === '' || /^https?:\/\/\S+$/i.test(v),
        message: 'Image must be a valid http(s) URL',
      },
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category must be at most 50 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
