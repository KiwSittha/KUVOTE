const mongoose = require('mongoose');

// Thread Schema
const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Politics', 'Education', 'Technology', 'Sports', 'Other'],
    default: 'General'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Comment Schema
const commentSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Vote Schema for tracking user votes
const voteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['thread', 'comment'],
    required: true
  },
  voteType: {
    type: Number,
    enum: [-1, 0, 1], // -1 downvote, 0 neutral, 1 upvote
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Compound index to ensure one vote per user per target
  indexes: [
    { userId: 1, targetId: 1, targetType: 1, unique: true }
  ]
});

// Update timestamps on save (use async for Mongoose 9.x compatibility)
threadSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

commentSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

// Virtual for thread URL
threadSchema.virtual('url').get(function() {
  return `/community/${this._id}`;
});

// Export models
const Thread = mongoose.model('Thread', threadSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Vote = mongoose.model('Vote', voteSchema);

module.exports = { Thread, Comment, Vote };