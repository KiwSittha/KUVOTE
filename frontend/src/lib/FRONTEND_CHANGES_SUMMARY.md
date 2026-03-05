# Frontend API Integration - Summary of Changes

## ✅ Overview
The frontend has been updated to connect to the real backend API at `http://localhost:8000/api`. All mock data has been replaced with API calls, proper loading states, and error handling.

---

## **Files Modified (3 files)**

### 1. **`frontend/src/lib/hooks/use-threads.js`** - Thread Management Hook

**What Changed:**
- ❌ Removed: Mock data (`mockThreads` array)
- ❌ Removed: Client-side filtering/sorting
- ✅ Added: `fetchThreads()` function to call GET `/api/threads`
- ✅ Added: `addThread()` function to call POST `/api/threads`
- ✅ Added: `updateThreadVotes()` function to call POST `/api/threads/:id/vote`
- ✅ Added: `error` state for error messages
- ✅ Added: `isLoading` state for loading indicators
- ✅ Added: `currentFilters` state to track filter state

**API Calls:**
```javascript
// GET all threads with filters
GET /api/threads?category=Politics&sort=hot&search=&page=1

// POST new thread
POST /api/threads
{ title, body, author, category }

// POST vote on thread
POST /api/threads/:id/vote
{ userId, voteType }
```

**New Return Values:**
```javascript
{
  threads,           // API response data
  isLoading,         // Boolean
  isHydrated,        // Initial load completed
  error,             // Error message or null
  fetchThreads,      // Function
  addThread,         // Function
  updateThreadVotes, // Function
  getFilteredThreads // Legacy function
}
```

---

### 2. **`frontend/src/lib/hooks/use-comments.js`** - Comment Management Hook (NEW FILE)

**New Hook for Comment Operations:**
- ✅ `fetchComments(threadId)` - GET `/api/threads/:id` for thread details + comments
- ✅ `addComment(threadId, commentData)` - POST `/api/threads/:id/comments`
- ✅ `voteOnComment(commentId, userId, voteType)` - POST `/api/comments/:id/vote`

**Features:**
- Supports nested replies via `parentId`
- Updates replies array when adding comments
- Handles vote count updates
- Full error handling and loading states

**Return Values:**
```javascript
{
  comments,        // Array of comments for thread
  isLoading,       // Boolean
  error,           // Error message or null
  fetchComments,   // Function
  addComment,      // Function
  voteOnComment    // Function
}
```

---

### 3. **`frontend/src/lib/hooks/use-votes.js`** - Voting Management Hook

**What Changed:**
- ❌ Removed: Mock votes storage (Map)
- ❌ Removed: Force update pattern
- ✅ Added: Real API calls to POST `/api/threads/:id/vote` and `/api/comments/:id/vote`
- ✅ Added: `voteOnThread()` function
- ✅ Added: `voteOnComment()` function
- ✅ Added: `toggleVote()` function for easy upvote/downvote toggling
- ✅ Added: Client-side cache for immediate UI feedback

**API Calls:**
```javascript
// Vote on thread
POST /api/threads/:id/vote
{ userId, voteType }

// Vote on comment
POST /api/comments/:id/vote
{ userId, voteType }
```

**New Return Values:**
```javascript
{
  isLoading,    // Boolean
  error,        // Error message or null
  getVote,      // Get current user vote
  voteOnThread, // Function
  voteOnComment,// Function
  toggleVote    // Function
}
```

---

## **Files Modified (1 file)**

### **`frontend/src/pages/CommunityPage.js`** - Community Forum Page

**What Changed:**
- ✅ Updated imports to use new hook signatures
- ✅ Added `useEffect` to refetch threads when filters change
- ✅ Changed from `threads.id` to `threads._id` (MongoDB format)
- ✅ Added userId extraction from localStorage
- ✅ Added loading state display
- ✅ Added error state display
- ✅ Updated vote handler to pass userId
- ✅ Simplified vote toggle logic

**Key Updates:**
```javascript
// OLD: Direct static data
const threads = getFilteredThreads(category, sort, search);

// NEW: Fetch from API when filters change
useEffect(() => {
  fetchThreads(category, sort, search);
}, [category, sort, search, fetchThreads]);

// OLD: threadId references
key={thread.id}
userVote={getVote(thread.id)}

// NEW: MongoDB ObjectId references
key={thread._id}
userVote={getVote(thread._id)}
onVote={(dir) => handleVote(thread._id, dir)}
```

---

## **Files Created (1 file)**

### **`frontend/src/lib/HOOKS_INTEGRATION_GUIDE.md`** - Complete Integration Guide

Comprehensive documentation including:
- Hook usage examples
- Function parameter documentation
- API endpoint mappings
- Complete code examples for various components
- Error handling patterns
- State management flow

---

## **Summary of Hook Transforms**

| Operation | Before (Mock) | After (API) |
|-----------|--------------|-----------|
| Load threads | Static array | `fetchThreads()` → GET `/api/threads` |
| Create thread | State update | `addThread()` → POST `/api/threads` |
| Vote on thread | Map storage | `updateThreadVotes()` → POST `/api/threads/:id/vote` |
| Load comments | N/A | `fetchComments()` → GET `/api/threads/:id` |
| Add comment | N/A | `addComment()` → POST `/api/threads/:id/comments` |
| Vote on comment | N/A | `voteOnComment()` → POST `/api/comments/:id/vote` |

---

## **Error Handling Implementation**

All hooks now include error handling:

```javascript
// Each hook returns error state
const { error, isLoading } = useThreads();

// Components can display errors
{error && (
  <div className="text-red-600">⚠️ {error}</div>
)}
```

---

## **Loading States**

Three-tier loading indication:

```javascript
// Initial load
if (!isHydrated && isLoading) {
  return <div>🔄 Loading...</div>;
}

// During operations
if (isLoading && threads.length === 0) {
  return <div>🔄 Fetching threads...</div>;
}

// Empty results
if (threads.length === 0) {
  return <div>No threads found</div>;
}
```

---

## **UserId Extraction**

Automatically gets user email for API calls:

```javascript
const user = JSON.parse(localStorage.getItem("user"));
const userId = user ? user.email : "anonymous";

// Used in vote calls
await updateThreadVotes(threadId, userId, voteType);
```

---

## **API Base URL**

**Location:** All three hooks  
**URL:** `http://localhost:8000/api`

To change:
1. Update the `API_URL` constant in:
   - `use-threads.js` (line 3)
   - `use-comments.js` (line 3)
   - `use-votes.js` (line 3)

---

## **Data Structure Changes**

### Thread Object (from API)
```javascript
{
  _id: "507f1f77bcf86cd799439011",      // MongoDB ObjectId
  title: "String",
  body: "String",
  author: "student@example.com",
  category: "Politics",
  upvotes: 25,
  downvotes: 2,
  voteCount: 23,                        // upvotes - downvotes
  commentCount: 5,
  createdAt: "2026-03-05T10:30:00Z",
  updatedAt: "2026-03-05T10:30:00Z"
}
```

### Comment Object (from API)
```javascript
{
  _id: "507f1f77bcf86cd799439020",
  threadId: "507f1f77bcf86cd799439011",
  body: "String",
  author: "student@example.com",
  parentId: null,                       // ObjectId if reply, null if top-level
  upvotes: 8,
  downvotes: 1,
  voteCount: 7,
  replies: [],                          // Array of comment _ids
  createdAt: "2026-03-05T11:05:00Z"
}
```

---

## **Testing the Integration**

### 1. **Verify Backend is Running**
```bash
cd backend
npm start
# Or: node server.js
```

Server should be running on `http://localhost:8000`

### 2. **Start Frontend**
```bash
cd frontend
npm start
```

### 3. **Test in Browser**
- Navigate to `/community`
- Verify threads load from API (check Network tab in DevTools)
- Try voting on a thread
- Try creating a new thread
- Check Network tab for API calls

### 4. **Check Network Requests**
In browser DevTools → Network tab, you should see:
- `GET /api/threads` - Initial load
- `POST /api/threads/:id/vote` - When voting
- `POST /api/threads` - When creating thread

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| "Failed to fetch threads" | Check backend is running on port 8000 |
| CORS errors | Ensure backend has CORS enabled |
| Votes not saving | Verify user is logged in (localStorage has user) |
| Comments not showing | Ensure `fetchComments()` is called on component mount |
| `_id is undefined` | Thread object may be using old `id` field, verify API response |

---

## **Next Components to Update**

After these changes, consider updating:
1. ✅ **CommunityPage** - Done
2. ⏳ **ThreadDetailPage** - Use `useComments()` to fetch comments
3. ⏳ **CreateThreadPage** - Use `addThread()` to create threads
4. ⏳ **UserProfilePage** - Use `useThreads()` to show user's threads
5. ⏳ **SearchPage** - Use `fetchThreads(search=term)` for search

---

## **File Structure After Changes**

```
frontend/
├── src/
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── use-threads.js              ✅ MODIFIED
│   │   │   ├── use-comments.js             ✅ CREATED (NEW)
│   │   │   └── use-votes.js                ✅ MODIFIED
│   │   ├── HOOKS_INTEGRATION_GUIDE.md      ✅ CREATED (NEW)
│   │   └── i18n.js
│   ├── pages/
│   │   └── CommunityPage.js                ✅ MODIFIED
│   └── api.js
```

---

## **Status: ✅ Complete**

- ✅ All three hooks connected to backend API
- ✅ Proper error handling implemented
- ✅ Loading states managed
- ✅ CommunityPage updated to use new hooks
- ✅ User authentication integrated (localStorage)
- ✅ MongoDB ObjectId format handled
- ✅ Full documentation provided
