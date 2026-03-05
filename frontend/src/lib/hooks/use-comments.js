import { useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export function useComments() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comments for a specific thread
  const fetchComments = useCallback(async (threadId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/threads/${threadId}`);

      if (response.data.success) {
        setComments(response.data.data.comments || []);
        return { success: true, data: response.data.data };
      } else {
        setError("Failed to fetch comments");
        return { success: false };
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      const errorMsg = err.response?.data?.message || "Failed to fetch comments";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add comment to thread
  const addComment = useCallback(async (threadId, commentData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/threads/${threadId}/comments`, {
        body: commentData.body,
        author: commentData.author,
        parentId: commentData.parentId || null
      });

      if (response.data.success) {
        // Add new comment to local state
        const newComment = response.data.data;
        
        if (commentData.parentId) {
          // If it's a reply, update the parent's replies
          setComments(prev => prev.map(comment => {
            if (comment._id === commentData.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment._id]
              };
            }
            return comment;
          }));
        } else {
          // If it's a new top-level comment, add it to the list
          setComments(prev => [...prev, newComment]);
        }

        return { success: true, data: newComment };
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      const errorMsg = err.response?.data?.message || "Failed to add comment";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vote on a comment
  const voteOnComment = useCallback(async (commentId, userId, voteType) => {
    try {
      const response = await axios.post(`${API_URL}/comments/${commentId}/vote`, {
        userId,
        voteType
      });

      if (response.data.success) {
        // Update local comment to reflect vote
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            let voteChange = 0;
            
            if (voteType === 1) voteChange = 1;
            else if (voteType === -1) voteChange = -1;
            
            return {
              ...comment,
              voteCount: comment.voteCount + voteChange,
              upvotes: voteType === 1 ? comment.upvotes + 1 : comment.upvotes
            };
          }
          return comment;
        }));

        return { success: true };
      }
    } catch (err) {
      console.error("Error voting on comment:", err);
      const errorMsg = err.response?.data?.message || "Failed to record vote";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    addComment,
    voteOnComment
  };
}
