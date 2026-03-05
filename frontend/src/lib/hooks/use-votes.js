import { useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Store user votes locally for UI feedback
const userVotesCache = new Map();

export function useVotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user vote for a target (thread or comment)
  const getVote = useCallback((targetId) => {
    return userVotesCache.get(targetId) || 0;
  }, []);

  // Vote on a thread
  const voteOnThread = useCallback(async (threadId, userId, direction, onUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/threads/${threadId}/vote`, {
        userId,
        voteType: direction
      });

      if (response.data.success) {
        // Store in cache for UI feedback
        userVotesCache.set(threadId, direction);

        // Calculate vote change for local UI update
        const currentVote = userVotesCache.get(threadId) || 0;
        let delta = direction - currentVote;

        if (onUpdate) {
          onUpdate(delta);
        }

        return { success: true };
      }
    } catch (err) {
      console.error("Error voting on thread:", err);
      const errorMsg = err.response?.data?.message || "Failed to record vote";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vote on a comment
  const voteOnComment = useCallback(async (commentId, userId, direction, onUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/comments/${commentId}/vote`, {
        userId,
        voteType: direction
      });

      if (response.data.success) {
        // Store in cache for UI feedback
        userVotesCache.set(commentId, direction);

        // Calculate vote change for local UI update
        const currentVote = userVotesCache.get(commentId) || 0;
        let delta = direction - currentVote;

        if (onUpdate) {
          onUpdate(delta);
        }

        return { success: true };
      }
    } catch (err) {
      console.error("Error voting on comment:", err);
      const errorMsg = err.response?.data?.message || "Failed to record vote";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle vote (upvote/downvote/remove)
  const toggleVote = useCallback(async (targetId, userId, direction, targetType = "thread", onUpdate) => {
    const currentVote = userVotesCache.get(targetId) || 0;
    let newVote = 0;

    if (currentVote === direction) {
      // Remove vote
      newVote = 0;
    } else {
      // Set new vote
      newVote = direction;
    }

    if (targetType === "thread") {
      return voteOnThread(targetId, userId, newVote, onUpdate);
    } else if (targetType === "comment") {
      return voteOnComment(targetId, userId, newVote, onUpdate);
    }
  }, [voteOnThread, voteOnComment]);

  return {
    isLoading,
    error,
    getVote,
    voteOnThread,
    voteOnComment,
    toggleVote
  };
}