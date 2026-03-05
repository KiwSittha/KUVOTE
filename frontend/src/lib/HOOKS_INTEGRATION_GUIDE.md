# Frontend Hooks - API Integration Guide

## Overview
The frontend hooks have been updated to fetch real data from the backend API instead of using mock data. All hooks now support loading states, error handling, and automatic state updates.

---

## Hook: `useThreads()` - Thread Management

### Usage
```javascript
import { useThreads } from "../lib/hooks/use-threads";

export function MyComponent() {
  const {
    threads,           // Array of threads from API
    isLoading,         // Loading state
    isHydrated,        // Initial load completed
    error,             // Error message if any
    fetchThreads,      // Function to fetch/refetch threads
    addThread,         // Function to create new thread
    updateThreadVotes, // Function to vote on thread
    getFilteredThreads // Legacy function (returns all threads)
  } = useThreads();
}
```

### Functions

#### `fetchThreads(category, sort, search, page)`
Fetch threads from the API with optional filters.

```javascript
// Fetch all threads
await threadHook.fetchThreads();

// Fetch with filters
await threadHook.fetchThreads("Politics", "hot", "education", 1);

// Parameters:
// - category: "All" | "General" | "Politics" | "Education" | "Technology" | "Sports" | "Other"
// - sort: "hot" | "new" | "top" | "controversial"
// - search: string (searches title and body)
// - page: number (pagination, default 1)
```

#### `addThread(threadData)`
Create a new thread and refresh the list.

```javascript
const result = await threadHook.addThread({
  title: "My Question",
  body: "Detailed explanation...",
  author: "student@ku.ac.th",
  category: "Politics"
});

if (result.success) {
  console.log("Thread created:", result.data);
} else {
  console.error("Failed:", result.error);
}
```

#### `updateThreadVotes(threadId, userId, voteType)`
Vote on a thread (upvote, downvote, or remove vote).

```javascript
// Upvote
const result = await threadHook.updateThreadVotes(threadId, "user@example.com", 1);

// Downvote
const result = await threadHook.updateThreadVotes(threadId, "user@example.com", -1);

// Remove vote
const result = await threadHook.updateThreadVotes(threadId, "user@example.com", 0);

// voteType: 1 (upvote), -1 (downvote), 0 (remove vote)
```

---

## Hook: `useComments()` - Comment Management

### Usage
```javascript
import { useComments } from "../lib/hooks/use-comments";

export function MyComponent() {
  const {
    comments,      // Array of comments for the thread
    isLoading,     // Loading state
    error,         // Error message if any
    fetchComments, // Function to fetch comments for a thread
    addComment,    // Function to add comment or reply
    voteOnComment  // Function to vote on comment
  } = useComments();
}
```

### Functions

#### `fetchComments(threadId)`
Get all comments for a specific thread.

```javascript
const result = await commentHook.fetchComments("507f1f77bcf86cd799439011");

if (result.success) {
  const { thread, comments } = result.data;
  console.log("Thread:", thread);
  console.log("Comments:", comments);
}
```

#### `addComment(threadId, commentData)`
Post a new comment or reply to a thread.

```javascript
// Post top-level comment
const result = await commentHook.addComment(threadId, {
  body: "Great discussion!",
  author: "student@ku.ac.th",
  parentId: null  // null for top-level
});

// Post a reply to another comment
const result = await commentHook.addComment(threadId, {
  body: "I agree with you!",
  author: "student@ku.ac.th",
  parentId: parentCommentId  // ID of the comment being replied to
});

if (result.success) {
  console.log("Comment added:", result.data);
}
```

#### `voteOnComment(commentId, userId, voteType)`
Vote on a comment.

```javascript
// Upvote
await commentHook.voteOnComment(commentId, "user@example.com", 1);

// Downvote
await commentHook.voteOnComment(commentId, "user@example.com", -1);

// Remove vote
await commentHook.voteOnComment(commentId, "user@example.com", 0);
```

---

## Hook: `useVotes()` - Voting Management

### Usage
```javascript
import { useVotes } from "../lib/hooks/use-votes";

export function MyComponent() {
  const {
    isLoading,      // Loading state during vote operations
    error,          // Error message if any
    getVote,        // Get user's current vote on a target
    voteOnThread,   // Vote on a thread
    voteOnComment,  // Vote on a comment
    toggleVote      // Toggle vote (upvote/downvote/remove)
  } = useVotes();
}
```

### Functions

#### `getVote(targetId)`
Get the current user's vote on a thread or comment (-1, 0, or 1).

```javascript
const userVote = votesHook.getVote(threadId);
// Returns: -1 (downvoted), 0 (no vote), 1 (upvoted)
```

#### `voteOnThread(threadId, userId, direction, onUpdate)`
Vote on a thread.

```javascript
const result = await votesHook.voteOnThread(
  threadId,
  "user@example.com",
  1,  // direction: 1 (up), -1 (down), 0 (remove)
  (delta) => {
    // Called with vote count change for UI updates
    console.log("Vote change:", delta);
  }
);
```

#### `voteOnComment(commentId, userId, direction, onUpdate)`
Vote on a comment.

```javascript
const result = await votesHook.voteOnComment(
  commentId,
  "user@example.com",
  1,
  (delta) => console.log("Vote recorded")
);
```

#### `toggleVote(targetId, userId, direction, targetType, onUpdate)`
Toggle a vote (automatically handles upvote/downvote/remove states).

```javascript
// Toggle thread vote
await votesHook.toggleVote(
  threadId,
  "user@example.com",
  1,           // direction: 1 (up), -1 (down)
  "thread",    // targetType: "thread" or "comment"
  (delta) => console.log("Vote toggled")
);

// Toggle comment vote
await votesHook.toggleVote(
  commentId,
  "user@example.com",
  1,
  "comment",
  (delta) => console.log("Vote toggled")
);
```

---

## Example: Complete Thread Creation Page

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThreads } from "../lib/hooks/use-threads";

export function CreateThreadPage() {
  const navigate = useNavigate();
  const { addThread, isLoading, error } = useThreads();
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "General"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("user"));
    
    const result = await addThread({
      title: formData.title,
      body: formData.body,
      author: user.email,
      category: formData.category
    });

    if (result.success) {
      // Navigate back to community page
      navigate("/community");
    } else {
      console.error("Failed to create thread:", result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <input
        type="text"
        placeholder="Thread Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Your discussion..."
        value={formData.body}
        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        required
        className="w-full mb-4 p-2 border rounded"
        rows="6"
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="w-full mb-6 p-2 border rounded"
      >
        <option>General</option>
        <option>Politics</option>
        <option>Education</option>
        <option>Technology</option>
        <option>Sports</option>
        <option>Other</option>
      </select>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create Thread"}
      </button>
    </form>
  );
}
```

---

## Example: Comment Thread Display

```javascript
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useComments } from "../lib/hooks/use-comments";
import { useVotes } from "../lib/hooks/use-votes";

export function ThreadDetailPage() {
  const { threadId } = useParams();
  const { comments, fetchComments, addComment, isLoading } = useComments();
  const { getVote, voteOnComment } = useVotes();
  const [reply, setReply] = React.useState("");

  useEffect(() => {
    if (threadId) {
      fetchComments(threadId);
    }
  }, [threadId, fetchComments]);

  const handleAddComment = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    const result = await addComment(threadId, {
      body: reply,
      author: user.email,
      parentId: null
    });

    if (result.success) {
      setReply("");
    }
  };

  const handleVote = async (commentId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const currentVote = getVote(commentId);
    
    await voteOnComment(commentId, user.email, currentVote === 1 ? 0 : 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <>
          {comments.map((comment) => (
            <div key={comment._id} className="mb-4 p-4 border rounded">
              <p className="font-semibold">{comment.author}</p>
              <p className="text-gray-700">{comment.body}</p>
              
              <button
                onClick={() => handleVote(comment._id)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                👍 {comment.upvotes}
              </button>
            </div>
          ))}

          <div className="mt-6 p-4 border-t">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border rounded mb-2"
              rows="3"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post Comment
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Error Handling

All hooks return an `error` state that contains error messages from the API:

```javascript
const { error, isLoading } = useThreads();

useEffect(() => {
  if (error) {
    // Show error toast/alert to user
    toast.error(error);
  }
}, [error]);
```

---

## State Management Flow

1. **Initial Load**: Component mounts → `fetchThreads()` called → API response sets `threads` state
2. **User Action**: User votes/comments → `updateThreadVotes()` called → API response → Local state updates
3. **Optimistic Updates**: UI shows changes immediately → API confirms → No revert needed (API returns success)
4. **Error Handling**: If API fails → `error` state is set → Component displays error message

---

## API Base URL

All hooks use: `http://localhost:8000/api`

Update this in `hooks/use-threads.js`, `hooks/use-comments.js`, and `hooks/use-votes.js` if you change your backend URL.

---

## Next Steps

1. Update component imports to use new hooks
2. Remove references to mock data
3. Test voting functionality
4. Test thread creation
5. Test comment replies
6. Add error handling UI (toast notifications, alerts)
