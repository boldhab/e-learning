# E-Learning Platform - Discussions & Private Chat Features

## Overview

This document describes the implementation of two major collaborative features for the e-learning platform:
1. **Public Discussion Groups** - Course-level discussion forums
2. **Private Teacher Chat** - One-to-one messaging between students and teachers

---

## 1. Public Discussion Groups

### Features

#### 1.1 Create Discussions
- Students and teachers can create discussion threads for a course
- Each discussion includes:
  - **Title**: The main topic (required, min 5 characters)
  - **Content**: Detailed description (required, min 10 characters)
  - **Image/Photo Attachment**: Optional file upload (images, PDF, Word docs)
  - **Auto-tracking**: View count, reply count, creation timestamp

#### 1.2 Reply to Discussions
- Students and teachers can reply to any discussion
- Each reply can include:
  - **Text Content**: Answer or comment
  - **Attachments**: Support for images, PDFs, and documents
  - **Metadata**: Author, role, timestamp

#### 1.3 Reactions/Interactions
- Users can react to replies with:
  - **Like** - General appreciation
  - **Helpful** - Mark as useful answer
  - **Confused** - Indicate uncertainty
- Reaction counts are displayed per reply
- Mark best answer (original poster or admin only)

#### 1.4 Search & Filtering
- Full-text search across discussion titles and content
- Sort options:
  - **Recent**: Latest discussions first
  - **Popular**: Most viewed discussions
  - **Unanswered**: Discussions with no replies
- Pagination support (10 discussions per page by default)

### Database Schema

```sql
-- Main discussion threads
CREATE TABLE discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(255),
    attachment_type VARCHAR(50),
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Replies to discussions
CREATE TABLE discussion_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discussion_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(255),
    attachment_type VARCHAR(50),
    is_best_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reactions to replies
CREATE TABLE discussion_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reply_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type ENUM('like', 'helpful', 'confused') DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (reply_id, user_id, reaction_type),
    FOREIGN KEY (reply_id) REFERENCES discussion_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discussions` | Get discussions for a course |
| GET | `/discussions/view?id={id}` | Get single discussion with replies |
| POST | `/discussions/create` | Create new discussion |
| POST | `/discussions/reply` | Add reply to discussion |
| POST | `/discussions/react` | Add reaction to reply |
| POST | `/discussions/unreact` | Remove reaction from reply |
| POST | `/discussions/best-answer` | Mark reply as best answer |
| GET | `/discussions/search?course_id={id}&keyword={text}` | Search discussions |
| POST | `/discussions/delete` | Delete discussion (owner/admin only) |
| DELETE | `/discussions/reply/delete` | Delete reply (owner/admin only) |

### Frontend Components

#### Pages
- **`/course/:courseId/discussions`** - List of discussions for a course
- **`/course/:courseId/discussions/:discussionId`** - Single discussion view with replies

#### Components
- `Discussions.jsx` - Main discussions list page
- `DiscussionDetail.jsx` - Single discussion page
- `DiscussionThread.jsx` - Display discussion thread
- `DiscussionForm.jsx` - Create new discussion
- `DiscussionReplyForm.jsx` - Add reply to discussion

### Usage Example

```javascript
import discussionService from '@/services/discussionService';

// Get discussions for a course
const { discussions, pagination } = await discussionService.getDiscussions(
  courseId, 
  page = 1, 
  limit = 10, 
  sortBy = 'recent'
);

// Create new discussion
const { discussion } = await discussionService.createDiscussion(
  courseId,
  title,
  content,
  attachmentFile
);

// Add reply
const { replies } = await discussionService.addReply(
  discussionId,
  replyContent,
  attachmentFile
);

// React to reply
await discussionService.addReaction(replyId, 'like');
```

---

## 2. Private Teacher Chat

### Features

#### 2.1 One-to-One Messaging
- Students can initiate private chats with their teachers
- Teachers can message their assigned students
- Real-time conversation threads

#### 2.2 File Attachments
- **Image Support**: JPEG, PNG, GIF, WebP (inline preview)
- **Document Support**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- **File Size Limits**: 
  - Images: 10MB
  - Documents: 50MB
- Upload validation and error handling

#### 2.3 Message Features
- Text messaging with formatting preservation
- Message timestamps
- Read/unread status tracking
- Message history (scrollable conversation view)
- Contact list with recent conversations
- Typing indicators (can be enhanced)

#### 2.4 Conversation Management
- Automatically mark messages as read when opened
- Sort conversations by most recent
- Contact information (name, role, avatar)

### Database Schema

```sql
-- Enhanced messages table (already exists)
-- Added columns:
-- - is_read: BOOLEAN DEFAULT FALSE
-- - file_type: VARCHAR(50) (type of attachment)

ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN file_type VARCHAR(50) DEFAULT NULL;
```

### Backend API Enhancements

Existing endpoints work for private chat:
- `GET /messages/conversations` - Get list of conversations
- `GET /messages/chat?contact_id={id}` - Get messages with a contact
- `POST /messages/send` - Send message with file
- `GET /messages/unread` - Get unread count
- `GET /messages/contacts` - Get available contacts

New Model methods in `Message.php`:
- `getPrivateChat($userId, $contactId, $limit)` - Get chat history
- `markConversationAsRead($userId, $contactId)` - Mark messages as read
- `getConversationsWithPreview($userId)` - Get conversations with message previews

### Frontend Components

#### Pages
- **`/chat`** - Main private chat page
- **`/chat/:contactId`** - Chat with specific contact

#### Components
- `PrivateChat.jsx` - Main chat interface with contact sidebar

### Usage Example

```javascript
import messageService from '@/services/messageService';

// Get contacts (teachers or students depending on role)
const { contacts } = await messageService.getContacts();

// Get message history with a contact
const { messages } = await messageService.getMessages(contactId);

// Send message with optional file
await messageService.sendMessage(
  receiverId,
  messageText,
  attachmentFile
);

// Get unread count
const { unread_count } = await messageService.getUnreadCount();
```

---

## Installation & Setup

### 1. Database Migration

Run the migration to create the discussion tables:

```bash
php backend/migrate_discussions.php
```

This will:
- Create `discussions` table
- Create `discussion_replies` table
- Create `discussion_reactions` table
- Create `discussion_search_index` table
- Add missing columns to `messages` table

### 2. Backend Setup

No additional dependencies required. Ensure:
- PHP 7.4+ with PDO support
- File upload utilities configured (uses existing `FileUploader`)
- JWT authentication working

### 3. Frontend Setup

All components use existing React setup. No new packages needed.

Ensure these are available:
- React Router v6
- Tailwind CSS
- Lucide React icons

---

## Access Control & Permissions

### Discussions
| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| View course discussions | ✓ (enrolled course) | ✓ (assigned course) | ✓ |
| Create discussion | ✓ | ✓ | ✓ |
| Reply to discussion | ✓ | ✓ | ✓ |
| React to reply | ✓ | ✓ | ✓ |
| Mark best answer | ✓ (if owner) | ✓ | ✓ |
| Delete own discussion | ✓ | ✓ | ✓ |
| Delete own reply | ✓ | ✓ | ✓ |
| Delete others' content | ✗ | ✗ | ✓ |

### Private Chat
| Action | Student | Teacher |
|--------|---------|---------|
| Message teacher | ✓ (assigned teacher) | N/A |
| Message student | N/A | ✓ (assigned student) |
| View conversation | ✓ (participant) | ✓ (participant) |
| Send files | ✓ | ✓ |
| Download files | ✓ | ✓ |

---

## File Upload Handling

### Supported File Types

**Images:**
- image/jpeg (.jpg, .jpeg)
- image/png (.png)
- image/gif (.gif)
- image/webp (.webp)

**Documents:**
- application/pdf (.pdf)
- application/msword (.doc)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
- application/vnd.ms-excel (.xls)
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)

### Upload Directories

```
backend/Uploads/
├── discussions/
│   └── course_[courseId]/
├── discussion_replies/
│   └── course_[courseId]/
└── messages/
```

---

## Error Handling

### Common Errors

**401 Unauthorized**
- Invalid or missing JWT token
- Solution: Login again

**403 Forbidden**
- User doesn't have access to course/discussion
- Solution: Verify enrollment or assignment

**400 Bad Request**
- Missing required fields
- Solution: Check API request parameters

**413 Payload Too Large**
- File exceeds size limit
- Solution: Use smaller files

**415 Unsupported Media Type**
- File type not allowed
- Solution: Use supported formats

---

## Performance Considerations

### Database Indexing
- Discussions are indexed by `course_id`, `student_id`, and `created_at`
- Reactions are indexed by `reply_id` and `user_id` (unique key)
- Full-text search available on `discussion_search_index`

### Query Optimization
- Pagination limits results (default 10 per page)
- Reactions counted in query (avoids N+1 problem)
- View count incremented only on view, not on list

### Frontend Optimization
- Messages lazy load with scroll
- Images compressed on upload
- Caching of conversation lists

---

## Future Enhancements

1. **Real-time Features**
   - WebSocket support for instant messages
   - Typing indicators
   - Online/offline status

2. **Advanced Discussions**
   - Thread pinning
   - Discussion categories/tags
   - Notification subscriptions
   - Nested replies (threads within replies)

3. **Rich Text Editing**
   - Markdown support
   - Code highlighting
   - Media embedding

4. **Moderation Tools**
   - Flag/report content
   - Automatic spam detection
   - Moderation dashboard

5. **Analytics**
   - Discussion participation metrics
   - User engagement tracking
   - Popular topics analysis

---

## Troubleshooting

### Discussions not appearing
- Verify user has access to course
- Check database migration completed
- Clear browser cache

### File upload fails
- Check file size limits
- Verify file type is supported
- Check directory permissions on server

### Reactions not updating
- Verify user is authenticated
- Check database constraints
- Refresh page to reload data

### Private messages not loading
- Verify contact relationship exists
- Check JWT token validity
- Verify student/teacher assignment

---

## Testing

### Database Verification

```sql
-- Check tables created
SHOW TABLES LIKE 'discussion%';

-- Check sample data
SELECT * FROM discussions LIMIT 5;
SELECT * FROM discussion_replies LIMIT 5;
SELECT * FROM discussion_reactions LIMIT 5;
```

### API Testing

Use Postman or curl to test endpoints:

```bash
# Get discussions
curl -H "Authorization: Bearer {token}" \
  "http://localhost/backend/api/discussions?course_id=1"

# Create discussion
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -F "course_id=1" \
  -F "title=How to do X?" \
  -F "content=I need help with..." \
  -F "attachment=@screenshot.png" \
  "http://localhost/backend/api/discussions/create"
```

---

## Support & Questions

For issues or questions about these features:
1. Check this documentation
2. Review component JSDoc comments
3. Check backend controller error responses
4. Review database schema integrity
