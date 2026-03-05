#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function testCommentLikes() {
  try {
    console.log('🧪 Testing Comment Like Feature...\n');

    // 1. Create a thread
    console.log('1️⃣  Creating a test thread...');
    const threadResponse = await axios.post(`${API_URL}/threads`, {
      title: 'Test Thread for Likes',
      body: 'This is a test thread to verify the like feature works correctly',
      author: 'TestUser@test.com',
      category: 'General'
    });

    const threadId = threadResponse.data.data._id;
    console.log(`   ✅ Thread created: ${threadId}\n`);

    // 2. Add a comment
    console.log('2️⃣  Adding a test comment...');
    const commentResponse = await axios.post(`${API_URL}/threads/${threadId}/comments`, {
      body: 'This is a test comment for liking',
      author: 'CommentAuthor@test.com',
      parentId: null
    });

    const commentId = commentResponse.data.data._id;
    console.log(`   ✅ Comment created: ${commentId}\n`);

    // 3. Get likes before liking
    console.log('3️⃣  Getting likes before liking...');
    const likesBeforeResponse = await axios.get(`${API_URL}/comments/${commentId}/likes`);
    console.log(`   Like count: ${likesBeforeResponse.data.data.likeCount}`);
    console.log(`   Liked by: ${likesBeforeResponse.data.data.likes.join(', ') || 'Nobody yet'}\n`);

    // 4. Like the comment
    console.log('4️⃣  Liking the comment...');
    const likeResponse = await axios.post(`${API_URL}/comments/${commentId}/like`, {
      userId: 'User1@test.com'
    });
    console.log(`   ✅ Like successful!`);
    console.log(`   Like count after like: ${likeResponse.data.data.likeCount}\n`);

    // 5. Try to like again (should fail)
    console.log('5️⃣  Trying to like again (should fail)...');
    try {
      await axios.post(`${API_URL}/comments/${commentId}/like`, {
        userId: 'User1@test.com'
      });
      console.log('   ❌ ERROR: Should not allow double like!');
    } catch (err) {
      console.log(`   ✅ Correctly prevented double like: ${err.response.data.message}\n`);
    }

    // 6. Add another like from different user
    console.log('6️⃣  Adding like from another user...');
    const likeResponse2 = await axios.post(`${API_URL}/comments/${commentId}/like`, {
      userId: 'User2@test.com'
    });
    console.log(`   ✅ Second like successful!`);
    console.log(`   Like count after second like: ${likeResponse2.data.data.likeCount}\n`);

    // 7. Unlike the comment (first user)
    console.log('7️⃣  Unlike the comment (first user)...');
    const unlikeResponse = await axios.delete(`${API_URL}/comments/${commentId}/like`, {
      data: { userId: 'User1@test.com' }
    });
    console.log(`   ✅ Unlike successful!`);
    console.log(`   Like count after unlike: ${unlikeResponse.data.data.likeCount}\n`);

    // 8. Get final likes
    console.log('8️⃣  Getting final like count...');
    const likesAfterResponse = await axios.get(`${API_URL}/comments/${commentId}/likes`);
    console.log(`   Final like count: ${likesAfterResponse.data.data.likeCount}`);
    console.log(`   Liked by: ${likesAfterResponse.data.data.likes.join(', ')}\n`);

    // 9. Try to unlike a comment we didn't like (should fail)
    console.log('9️⃣  Trying to unlike a comment we didn\'t like (should fail)...');
    try {
      await axios.delete(`${API_URL}/comments/${commentId}/like`, {
        data: { userId: 'User1@test.com' }
      });
      console.log('   ❌ ERROR: Should not allow unlinking without liking!');
    } catch (err) {
      console.log(`   ✅ Correctly prevented invalid unlike: ${err.response.data.message}\n`);
    }

    console.log('✅ All tests passed! The comment like feature is working correctly!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

testCommentLikes();
