const mongoose = require('mongoose');
const { Thread, Comment, Vote } = require('../models/community');

// =======================
// Community Forum Routes
// =======================

// GET /api/threads - Get all threads with filtering and sorting
async function getThreads(req, res) {
  try {
    const {
      category = 'All',
      sort = 'hot',
      search = '',
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    // Filter by category
    if (category !== 'All') {
      query.category = category;
    }

    // Filter by search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'hot':
        sortOption = { voteCount: -1, createdAt: -1 };
        break;
      case 'new':
        sortOption = { createdAt: -1 };
        break;
      case 'top':
        sortOption = { voteCount: -1 };
        break;
      case 'controversial':
        sortOption = { commentCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const threads = await Thread.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title body author category upvotes downvotes voteCount commentCount createdAt')
      .lean();

    const total = await Thread.countDocuments(query);

    res.json({
      success: true,
      data: threads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threads',
      error: error.message
    });
  }
}

// POST /api/threads - Create new thread
async function createThread(req, res) {
  try {
    const { title, body, category = 'General' } = req.body;
    let { author } = req.body;
    
    // Provide default author if missing
    author = author || 'Anonymous';

    console.log('📝 [createThread] Received data:', { title, bodyLength: body?.length, author, category });

    // Validation
    if (!title || !body) {
      console.warn('⚠️ [createThread] Missing title or body');
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    if (title.length > 200) {
      console.warn('⚠️ [createThread] Title too long:', title.length);
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }

    const validCategories = ['General', 'Politics', 'Education', 'Technology', 'Sports', 'Other'];
    if (!validCategories.includes(category)) {
      console.warn('⚠️ [createThread] Invalid category:', category);
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    console.log('✅ [createThread] Validation passed, creating thread...');

    const thread = new Thread({
      title: title.trim(),
      body: body.trim(),
      author: author.trim(),
      category
    });

    console.log('🔄 [createThread] Thread object created, saving to database...');
    const savedThread = await thread.save();

    console.log('✅ [createThread] Thread saved successfully:', savedThread._id);

    res.status(201).json({
      success: true,
      data: savedThread,
      message: 'Thread created successfully'
    });

  } catch (error) {
    console.error('❌ [createThread] ERROR:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      fullError: error
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create thread';
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.keys(error.errors).map(k => `${k} - ${error.errors[k].message}`).join(', ')}`;
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorMessage = `Database error: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
}

// GET /api/threads/:id - Get single thread with comments
async function getThread(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid thread ID'
      });
    }

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Get comments for this thread
    const comments = await Comment.find({ threadId: id, parentId: null })
      .sort({ createdAt: 1 })
      .populate({
        path: 'replies',
        populate: {
          path: 'replies',
          model: 'Comment'
        }
      })
      .lean();

    res.json({
      success: true,
      data: {
        thread,
        comments
      }
    });

  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch thread',
      error: error.message
    });
  }
}

// POST /api/threads/:id/comments - Add comment to thread
async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { body, author, parentId = null } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid thread ID'
      });
    }

    if (!body || !author) {
      return res.status(400).json({
        success: false,
        message: 'Body and author are required'
      });
    }

    // Check if thread exists
    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // If parentId provided, check if parent comment exists
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment ID'
        });
      }

      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = new Comment({
      threadId: id,
      body: body.trim(),
      author: author.trim(),
      parentId
    });

    const savedComment = await comment.save();

    // If this is a reply, add it to parent's replies array
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: savedComment._id }
      });
    }

    // Update thread's comment count
    await Thread.findByIdAndUpdate(id, {
      $inc: { commentCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: savedComment,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
}

// POST /api/threads/:id/vote - Vote on thread
async function voteOnThread(req, res) {
  try {
    const { id } = req.params;
    const { userId, voteType } = req.body; // voteType: 1 (up), -1 (down), 0 (remove)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid thread ID'
      });
    }

    if (!userId || ![-1, 0, 1].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and voteType (-1, 0, 1) are required'
      });
    }

    // Check if thread exists
    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      userId,
      targetId: id,
      targetType: 'thread'
    });

    let voteChange = 0;

    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === voteType) {
        // Same vote - remove it
        await Vote.findByIdAndDelete(existingVote._id);
        voteChange = -existingVote.voteType;
      } else {
        // Different vote - update it
        voteChange = voteType - existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      // New vote
      if (voteType !== 0) {
        const newVote = new Vote({
          userId,
          targetId: id,
          targetType: 'thread',
          voteType
        });
        await newVote.save();
        voteChange = voteType;
      }
    }

    // Update thread vote counts
    if (voteChange > 0) {
      await Thread.findByIdAndUpdate(id, {
        $inc: { upvotes: 1, voteCount: 1 }
      });
    } else if (voteChange < 0) {
      await Thread.findByIdAndUpdate(id, {
        $inc: { downvotes: 1, voteCount: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Error voting on thread:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
}

// POST /api/comments/:id/vote - Vote on comment
async function voteOnComment(req, res) {
  try {
    const { id } = req.params;
    const { userId, voteType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    if (!userId || ![-1, 0, 1].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and voteType (-1, 0, 1) are required'
      });
    }

    // Check if comment exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      userId,
      targetId: id,
      targetType: 'comment'
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        voteChange = -existingVote.voteType;
      } else {
        voteChange = voteType - existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      if (voteType !== 0) {
        const newVote = new Vote({
          userId,
          targetId: id,
          targetType: 'comment',
          voteType
        });
        await newVote.save();
        voteChange = voteType;
      }
    }

    // Update comment vote counts
    if (voteChange > 0) {
      await Comment.findByIdAndUpdate(id, {
        $inc: { upvotes: 1, voteCount: 1 }
      });
    } else if (voteChange < 0) {
      await Comment.findByIdAndUpdate(id, {
        $inc: { downvotes: 1, voteCount: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
}

// POST /api/comments/:id/like - Like a comment
async function likeComment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked this comment
    if (comment.likes && comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this comment'
      });
    }

    // Add the like
    if (!comment.likes) {
      comment.likes = [];
    }
    comment.likes.push(userId);
    await comment.save();

    res.json({
      success: true,
      data: {
        commentId: id,
        likeCount: comment.likes.length,
        liked: true
      }
    });

  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      error: error.message
    });
  }
}

// DELETE /api/comments/:id/like - Unlike a comment
async function unlikeComment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user liked this comment
    if (!comment.likes || !comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You haven\'t liked this comment'
      });
    }

    // Remove the like
    comment.likes = comment.likes.filter(id => id !== userId);
    await comment.save();

    res.json({
      success: true,
      data: {
        commentId: id,
        likeCount: comment.likes.length,
        liked: false
      }
    });

  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike comment',
      error: error.message
    });
  }
}

// GET /api/comments/:id/likes - Get like count for a comment
async function getCommentLikes(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID'
      });
    }

    const comment = await Comment.findById(id).select('likes');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      data: {
        commentId: id,
        likeCount: comment.likes ? comment.likes.length : 0,
        likes: comment.likes || []
      }
    });

  } catch (error) {
    console.error('Error fetching comment likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch likes',
      error: error.message
    });
  }
}

module.exports = {
  getThreads,
  createThread,
  getThread,
  addComment,
  voteOnThread,
  voteOnComment,
  likeComment,
  unlikeComment,
  getCommentLikes
};