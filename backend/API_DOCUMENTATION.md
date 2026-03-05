# Community Forum API Documentation

## Setup Complete ✅

The Node.js Express backend for the Community Forum has been successfully set up with MongoDB schemas and REST API endpoints.

---

## Base URL
```
http://localhost:8000/api
```

---

## Implemented Endpoints

### 1. **GET /threads** - Get All Threads
Retrieve all threads with filtering, sorting, and pagination.

**Query Parameters:**
- `category` (string, default: "All") - Filter by category: General, Politics, Education, Technology, Sports, Other
- `sort` (string, default: "hot") - Sort by: hot, new, top, controversial
- `search` (string) - Search in title and body
- `page` (number, default: 1) - Pagination page
- `limit` (number, default: 20) - Items per page

**Example Request:**
```bash
GET /api/threads?category=Politics&sort=hot&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Discussion on Education Policy",
      "body": "What should be prioritized in education reform?",
      "author": "student1",
      "category": "Education",
      "upvotes": 25,
      "downvotes": 2,
      "voteCount": 23,
      "commentCount": 5,
      "createdAt": "2026-03-05T10:30:00Z",
      "updatedAt": "2026-03-05T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

### 2. **POST /threads** - Create New Thread
Create a new discussion thread.

**Request Body:**
```json
{
  "title": "What are your political views?",
  "body": "I'd like to discuss various political perspectives...",
  "author": "student123",
  "category": "Politics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "What are your political views?",
    "body": "I'd like to discuss various political perspectives...",
    "author": "student123",
    "category": "Politics",
    "upvotes": 0,
    "downvotes": 0,
    "voteCount": 0,
    "commentCount": 0,
    "createdAt": "2026-03-05T11:00:00Z"
  },
  "message": "Thread created successfully"
}
```

---

### 3. **GET /threads/:id** - Get Single Thread with Comments
Retrieve a specific thread and all its comments/replies.

**Example Request:**
```bash
GET /api/threads/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "thread": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Discussion on Education Policy",
      "body": "What should be prioritized in education reform?",
      "author": "student1",
      "category": "Education",
      "upvotes": 25,
      "voteCount": 23,
      "commentCount": 5,
      "createdAt": "2026-03-05T10:30:00Z"
    },
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "threadId": "507f1f77bcf86cd799439011",
        "body": "I think technology should be integrated more...",
        "author": "student2",
        "parentId": null,
        "upvotes": 8,
        "voteCount": 8,
        "replies": []
      }
    ]
  }
}
```

---

### 4. **POST /threads/:id/comments** - Add Comment to Thread
Post a comment or reply to a thread.

**Request Body:**
```json
{
  "body": "I completely agree with this perspective!",
  "author": "student3",
  "parentId": null
}
```

*Note: Set `parentId` to another comment's ID to create a reply.*

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "threadId": "507f1f77bcf86cd799439011",
    "body": "I completely agree with this perspective!",
    "author": "student3",
    "parentId": null,
    "upvotes": 0,
    "voteCount": 0,
    "createdAt": "2026-03-05T11:05:00Z"
  },
  "message": "Comment added successfully"
}
```

---

### 5. **POST /threads/:id/vote** - Vote on Thread
Upvote or downvote a thread.

**Request Body:**
```json
{
  "userId": "student123",
  "voteType": 1
}
```

*Note: voteType can be `1` (upvote), `-1` (downvote), or `0` (remove vote)*

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully"
}
```

---

### 6. **POST /comments/:id/vote** - Vote on Comment
Upvote or downvote a comment.

**Request Body:**
```json
{
  "userId": "student123",
  "voteType": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully"
}
```

---

## CORS Configuration ✅

CORS is enabled with the following settings:
```javascript
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
```

Your React frontend can now make requests to this backend.

---

## MongoDB Models

### Thread
- `title` (String, required, max 200 chars)
- `body` (String, required)
- `author` (String, required)
- `category` (String, enum: General, Politics, Education, Technology, Sports, Other)
- `upvotes` (Number, default: 0)
- `downvotes` (Number, default: 0)
- `voteCount` (Number, default: 0)
- `commentCount` (Number, default: 0)
- `createdAt` (Date)
- `updatedAt` (Date)

### Comment
- `threadId` (ObjectId, required, ref: Thread)
- `body` (String, required)
- `author` (String, required)
- `parentId` (ObjectId, optional, ref: Comment - for replies)
- `upvotes` (Number, default: 0)
- `downvotes` (Number, default: 0)
- `voteCount` (Number, default: 0)
- `replies` (Array of ObjectIds, ref: Comment)
- `createdAt` (Date)
- `updatedAt` (Date)

### Vote
- `userId` (String, required)
- `targetId` (ObjectId, required)
- `targetType` (String, enum: thread, comment)
- `voteType` (Number, enum: -1, 0, 1)
- `createdAt` (Date)

---

## Running the Server

**Option 1: Using nodemon (auto-reload)**
```bash
npm run dev
```

**Option 2: Direct node**
```bash
node server.js
```

Server runs on port `8000` (or custom port via `PORT` env variable).

---

## File Structure

```
backend/
├── models/
│   └── community.js          # MongoDB schemas (Thread, Comment, Vote)
├── routes/
│   └── community.js          # Community forum route handlers
├── server.js                 # Main Express server with all routes
├── package.json              # Dependencies and scripts
└── .env                       # Environment variables
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "detailed error message"
}
```

---

## Next Steps

1. **Connect React Frontend:**
   Update your `api.js` in the frontend to use these endpoints:
   ```javascript
   const API_URL = 'http://localhost:8000/api';
   
   export const getThreads = (category, sort) => {
     return axios.get(`${API_URL}/threads?category=${category}&sort=${sort}`);
   };
   
   export const createThread = (data) => {
     return axios.post(`${API_URL}/threads`, data);
   };
   ```

2. **Test with cURL/Postman:**
   ```bash
   curl -X GET "http://localhost:8000/api/threads?category=Politics&sort=hot"
   ```

3. **Set Environment Variables:**
   Ensure `.env` contains `MONGO_URI` pointing to your MongoDB instance.

---

## Status ✅

- ✅ Community Forum API fully configured
- ✅ MongoDB schemas created
- ✅ All 6 REST endpoints implemented
- ✅ CORS enabled for React frontend
- ✅ Error handling in place
- ✅ Vote tracking system ready
- ✅ Reply/nested comments support
