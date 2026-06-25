# Developer Quick Reference

## API Endpoints Quick Guide

### Discussions API
```
GET     /api/discussions?course_id={id}&page=1&limit=10&sort_by=recent
GET     /api/discussions/view?id={discussionId}
POST    /api/discussions/create
POST    /api/discussions/reply
POST    /api/discussions/react
POST    /api/discussions/unreact
POST    /api/discussions/best-answer
GET     /api/discussions/search?course_id={id}&keyword=text
POST    /api/discussions/delete
DELETE  /api/discussions/reply/delete
```

### Messages API (existing + enhanced)
```
GET     /api/messages/conversations
GET     /api/messages/chat?contact_id={id}
POST    /api/messages/send
GET     /api/messages/unread
GET     /api/messages/contacts
```

---

## Frontend Service Usage

### Discussion Service
```javascript
import discussionService from '@/services/discussionService';

// Get discussions
await discussionService.getDiscussions(courseId, page, limit, sortBy);

// Get single discussion
await discussionService.getDiscussion(discussionId);

// Create discussion
await discussionService.createDiscussion(courseId, title, content, attachment);

// Add reply
await discussionService.addReply(discussionId, content, attachment);

// React to reply
await discussionService.addReaction(replyId, reactionType);

// Remove reaction
await discussionService.removeReaction(replyId);

// Mark best answer
await discussionService.markBestAnswer(replyId);

// Search
await discussionService.searchDiscussions(courseId, keyword, page, limit);

// Delete
await discussionService.deleteDiscussion(discussionId);
await discussionService.deleteReply(replyId);
```

### Message Service (for private chat)
```javascript
import messageService from '@/services/messageService';

// Get conversations
await messageService.getConversations();

// Get messages with contact
await messageService.getMessages(contactId);

// Send message
await messageService.sendMessage(receiverId, content, attachment);

// Get contacts
await messageService.getContacts();

// Get unread count
await messageService.getUnreadCount();
```

---

## Common Code Patterns

### Backend Controller Authentication
```php
private function auth() {
    $authHeader = $this->getAuthorizationHeader();
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return false;
    }
    
    $token = substr($authHeader, 7);
    $decoded = JwtHandler::validateToken($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        return false;
    }
    
    return $decoded;
}
```

### Frontend Error Handling
```jsx
try {
    const data = await discussionService.getDiscussions(...);
    // Use data
} catch (err) {
    setError(err.message || 'Failed to load discussions');
    // Handle error
}
```

### File Upload Validation
```javascript
const handleAttachment = (file) => {
    // Size check
    if (file.size > 10 * 1024 * 1024) {
        setError('File too large');
        return;
    }
    
    // Type check
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
        setError('File type not supported');
        return;
    }
    
    setAttachment(file);
};
```

---

## Database Queries

### Get discussions with reply count
```sql
SELECT d.*, 
       COUNT(dr.id) as reply_count
FROM discussions d
LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
WHERE d.course_id = ?
GROUP BY d.id
ORDER BY d.created_at DESC;
```

### Get best answer
```sql
SELECT * FROM discussion_replies 
WHERE discussion_id = ? AND is_best_answer = 1 
LIMIT 1;
```

### Get reaction stats
```sql
SELECT 
    reply_id,
    reaction_type,
    COUNT(*) as count
FROM discussion_reactions
WHERE reply_id IN (SELECT id FROM discussion_replies WHERE discussion_id = ?)
GROUP BY reply_id, reaction_type;
```

### Search discussions
```sql
SELECT d.* FROM discussions d
WHERE d.course_id = ? 
AND (d.title LIKE ? OR d.content LIKE ?)
ORDER BY d.created_at DESC;
```

---

## File Structure Reference

### Backend Model Methods (Discussion.php)
- `createDiscussion()` - Create new discussion
- `getDiscussionsByCourse()` - Get paginated discussions
- `getDiscussionById()` - Get single discussion
- `incrementViews()` - Increment view count
- `addReply()` - Add reply to discussion
- `getRepliesByDiscussion()` - Get all replies
- `addReaction()` - Add/update reaction
- `removeReaction()` - Remove reaction
- `markBestAnswer()` - Mark best answer
- `searchDiscussions()` - Search by keyword
- `deleteDiscussion()` - Delete discussion
- `deleteReply()` - Delete reply
- `updateDiscussion()` - Update discussion
- `updateReply()` - Update reply

### Backend Controller Methods (DiscussionController.php)
- `getDiscussions()` - API: List discussions
- `getDiscussion()` - API: Get single discussion
- `createDiscussion()` - API: Create discussion
- `addReply()` - API: Add reply
- `addReaction()` - API: Add reaction
- `removeReaction()` - API: Remove reaction
- `markBestAnswer()` - API: Mark best answer
- `search()` - API: Search discussions
- `deleteDiscussion()` - API: Delete discussion
- `deleteReply()` - API: Delete reply

### Frontend Components
- `Discussions.jsx` - Main discussions page
- `DiscussionDetail.jsx` - Single discussion view
- `DiscussionForm.jsx` - Create discussion form
- `DiscussionReplyForm.jsx` - Reply form
- `DiscussionThread.jsx` - Display thread
- `PrivateChat.jsx` - Chat interface

---

## Debugging Tips

### Debug SQL Queries
Add logging in Model methods:
```php
error_log("Query: " . json_encode(['sql' => $sql, 'params' => $params]));
```

### Debug API Responses
Check browser DevTools Network tab:
- Request headers (Authorization token)
- Response status codes
- Response body (error messages)

### Debug Frontend State
Add console logs:
```javascript
console.log('Discussions loaded:', discussions);
console.log('Error:', error);
```

### Check Database
```bash
mysql -u root -p elearning
SHOW TABLES LIKE 'discussion%';
SELECT COUNT(*) FROM discussions;
SELECT * FROM discussions LIMIT 5;
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on discussions route | Routes not added | Update routes/index.jsx |
| 401 Unauthorized | Invalid token | User needs to login again |
| 403 Forbidden | No course access | Verify enrollment |
| File upload fails | File too large | Reduce file size |
| No data displayed | Database not migrated | Run migrate_discussions.php |
| Reactions not working | JS error | Check browser console |
| Images not showing | Wrong URL path | Check buildUploadUrl() function |
| Slow queries | Missing indexes | Check database indexes |

---

## Performance Checklist

- [ ] Discussions indexed by course_id
- [ ] Discussions indexed by created_at
- [ ] Reactions indexed by reply_id
- [ ] Messages indexed by sender_id, receiver_id
- [ ] Pagination limits result sets
- [ ] Query uses COUNT(*) for totals
- [ ] No N+1 query problems
- [ ] File uploads compressed
- [ ] Cache strategy considered

---

## Adding New Features

### To add a new reaction type:

**Backend:**
```sql
ALTER TABLE discussion_reactions MODIFY reaction_type 
ENUM('like', 'helpful', 'confused', 'bookmark');
```

**Frontend (DiscussionReplyForm.jsx):**
```jsx
<button onClick={() => handleReaction(reply.id, 'bookmark')}>
  🔖 Bookmark
</button>
```

### To add discussion categories:

**Database:**
```sql
ALTER TABLE discussions ADD COLUMN category VARCHAR(100);
```

**Backend:** Add filter to `getDiscussionsByCourse()`

**Frontend:** Add category selector in form

---

## Testing Checklist for New Features

When adding new functionality:
- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with missing permissions
- [ ] Test with large file uploads
- [ ] Test pagination
- [ ] Test search functionality
- [ ] Check error messages are clear
- [ ] Verify database data saved correctly
- [ ] Check UI responds properly
- [ ] Test on mobile view

---

## Code Style Guidelines

### PHP
```php
// Use prepared statements for security
$stmt = $this->db->prepare("SELECT * FROM table WHERE id = :id");
$stmt->execute(['id' => $id]);

// Use meaningful variable names
$discussionReplies instead of $dr

// Add error handling
try { /* code */ } catch (Exception $e) { /* handle */ }
```

### JavaScript
```javascript
// Use async/await
const data = await service.getDiscussions();

// Use destructuring
const { discussions, pagination } = response;

// Clear error messages
setError(null);

// Use optional chaining
data?.discussions?.map()
```

---

## Useful Commands

```bash
# Run migration
php backend/migrate_discussions.php

# Check tables
mysql -u root -p elearning -e "SHOW TABLES LIKE 'discussion%';"

# View recent discussions
mysql -u root -p elearning -e "SELECT * FROM discussions ORDER BY created_at DESC LIMIT 5;"

# Count total discussions
mysql -u root -p elearning -e "SELECT COUNT(*) FROM discussions;"

# Check file uploads
ls -la backend/Uploads/discussions/
```

---

## Resources

- **Full Guide:** `DISCUSSIONS_AND_CHAT_GUIDE.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **This File:** `DEVELOPER_QUICK_REFERENCE.md`

---

**Last Updated:** May 8, 2026
**Version:** 1.0
