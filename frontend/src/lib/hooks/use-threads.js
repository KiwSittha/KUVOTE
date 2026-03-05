import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export function useThreads() {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    category: "All",
    sort: "hot",
    search: ""
  });

  // Fetch threads from API
  const fetchThreads = useCallback(async (category = "All", sort = "hot", search = "", page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: 20
      };
      
      if (category !== "All") {
        params.category = category;
      }
      
      if (sort) {
        params.sort = sort;
      }
      
      if (search) {
        params.search = search;
      }

      const response = await axios.get(`${API_URL}/threads`, { params });
      
      if (response.data.success) {
        setThreads(response.data.data);
        setCurrentFilters({ category, sort, search });
        setIsHydrated(true);
      } else {
        setError("Failed to fetch threads");
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
      setError(err.response?.data?.message || "Failed to fetch threads");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial threads on mount
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Create new thread
  const addThread = useCallback(async (threadData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/threads`, {
        title: threadData.title,
        body: threadData.body,
        author: threadData.author,
        category: threadData.category || "General"
      });

      if (response.data.success) {
        // Refresh threads list
        await fetchThreads(currentFilters.category, currentFilters.sort, currentFilters.search);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error("Error creating thread:", err);
      const errorMsg = err.response?.data?.message || "Failed to create thread";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchThreads, currentFilters]);

  // Update thread votes
  const updateThreadVotes = useCallback(async (threadId, userId, voteType) => {
    try {
      const response = await axios.post(`${API_URL}/threads/${threadId}/vote`, {
        userId,
        voteType
      });

      if (response.data.success) {
        // Update local thread to reflect vote change
        setThreads(prev => prev.map(thread => {
          if (thread._id === threadId) {
            let voteChange = 0;
            
            // Calculate vote change based on voteType
            if (voteType === 1) voteChange = 1;
            else if (voteType === -1) voteChange = -1;
            
            return {
              ...thread,
              voteCount: thread.voteCount + voteChange,
              upvotes: voteType === 1 ? thread.upvotes + 1 : thread.upvotes
            };
          }
          return thread;
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating votes:", err);
      const errorMsg = err.response?.data?.message || "Failed to update votes";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Get filtered threads (client-side filtering for display)
  const getFilteredThreads = useCallback((category, sort, search) => {
    return threads;
  }, [threads]);

  return {
    threads,
    isLoading,
    isHydrated,
    error,
    fetchThreads,
    addThread,
    updateThreadVotes,
    getFilteredThreads
  };
}