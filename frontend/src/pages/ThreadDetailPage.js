import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, MessageSquare, Send, ThumbsUp } from "lucide-react";
import axios from "axios";
import Avatar from "../components/community/avatar";
import { formatTimeAgo } from "../lib/time-utils";

const API_URL = "http://localhost:8000/api";
const KU_GREEN = "#006633";

export default function ThreadDetailPage() {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userId, setUserId] = useState("");
  const [commentLikes, setCommentLikes] = useState({});

  // Fetch thread data
  useEffect(() => {
    const fetchThread = async () => {
      try {
        setIsLoading(true);
        
        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserId(user.email || "Anonymous");
        
        const response = await axios.get(`${API_URL}/threads/${threadId}`);
        if (response.data.success) {
          setThread(response.data.data.thread || response.data.data);
          const fetchedComments = response.data.data.comments || [];
          setComments(fetchedComments);
          
          // Fetch likes for each comment
          const likesData = {};
          for (const comment of fetchedComments) {
            try {
              const likesResponse = await axios.get(`${API_URL}/comments/${comment._id}/likes`);
              if (likesResponse.data.success) {
                likesData[comment._id] = {
                  count: likesResponse.data.data.likeCount,
                  likes: likesResponse.data.data.likes || [],
                  liked: likesResponse.data.data.likes ? likesResponse.data.data.likes.includes(user.email || "Anonymous") : false
                };
              }
            } catch (err) {
              console.error(`Error fetching likes for comment ${comment._id}:`, err);
              likesData[comment._id] = { count: 0, likes: [], liked: false };
            }
          }
          setCommentLikes(likesData);
        } else {
          setError("Failed to load thread");
        }
      } catch (err) {
        console.error("Error fetching thread:", err);
        setError("Failed to load thread");
      } finally {
        setIsLoading(false);
      }
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    try {
      setIsSubmittingComment(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const author = user.email || "Anonymous";

      const response = await axios.post(`${API_URL}/threads/${threadId}/comments`, {
        body: commentBody.trim(),
        author,
        parentId: null
      });

      if (response.data.success) {
        setCommentBody("");
        // Add to local comments list
        const newComment = response.data.data;
        setComments([...comments, newComment]);
        
        // Initialize likes for new comment
        setCommentLikes(prev => ({
          ...prev,
          [newComment._id]: { count: 0, likes: [], liked: false }
        }));
        
        // Update thread comment count
        setThread(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const currentLikeData = commentLikes[commentId] || { count: 0, likes: [], liked: false };
      
      if (currentLikeData.liked) {
        // Unlike the comment
        const response = await axios.delete(`${API_URL}/comments/${commentId}/like`, {
          data: { userId }
        });
        
        if (response.data.success) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
              count: response.data.data.likeCount,
              likes: response.data.data.likes || [],
              liked: false
            }
          }));
        }
      } else {
        // Like the comment
        const response = await axios.post(`${API_URL}/comments/${commentId}/like`, {
          userId
        });
        
        if (response.data.success) {
          setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
              count: response.data.data.likeCount,
              likes: response.data.data.likes || [],
              liked: true
            }
          }));
        }
      }
    } catch (err) {
      console.error("Error liking comment:", err);
      alert("Failed to like comment");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-48 rounded-lg bg-gray-200" />
          <div className="h-32 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{error || "Thread not found"}</h1>
        <Link
          to="/community/discussions"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: KU_GREEN }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Link
        to="/community/discussions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: KU_GREEN }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      {/* Thread */}
      <article className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
        {/* Thread Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="rounded-md px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: KU_GREEN }}
          >
            {thread.category || "General"}
          </span>
          <div className="flex items-center gap-2">
            <Avatar name={thread.author} size={24} />
            <span className="text-sm text-gray-600">
              Posted by <span className="font-semibold text-gray-900">{thread.author}</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {formatTimeAgo(thread.createdAt)}
          </span>
        </div>

        {/* Thread Title */}
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          {thread.title}
        </h1>

        {/* Thread Body */}
        <p className="mb-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
          {thread.body}
        </p>

        {/* Thread Engagement */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{thread.commentCount || 0} comments</span>
          </div>
        </div>
      </article>

      {/* Add Comment Section */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Add a Comment</h2>
        <form onSubmit={handleAddComment} className="rounded-lg border border-gray-200 bg-white p-6">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Share your thoughts on this discussion..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200 mb-3"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment || !commentBody.trim()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: KU_GREEN }}
            >
              <Send className="h-4 w-4" />
              {isSubmittingComment ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const likeData = commentLikes[comment._id] || { count: 0, likes: [], liked: false };
              
              return (
                <div key={comment._id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar name={comment.author} size={24} />
                    <div className="font-semibold text-gray-900">{comment.author}</div>
                    <span className="text-xs text-gray-600">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {comment.body}
                  </p>
                  
                  {/* Like Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        likeData.liked
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={likeData.liked ? { backgroundColor: `${KU_GREEN}20`, color: KU_GREEN } : {}}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{likeData.count} {likeData.count === 1 ? "Like" : "Likes"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}