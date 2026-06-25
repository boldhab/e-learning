# Quick Setup Guide - Discussions & Private Chat

## Prerequisites
- PHP 7.4+
- MySQL/MariaDB
- React with React Router v6
- Tailwind CSS
- JWT Authentication configured

---

## Step 1: Database Setup

1. Run the migration script to create all necessary tables:

```bash
cd c:\xampp\htdocs\e-learning
php backend/migrate_discussions.php
```

Expected output:
```
Creating discussions table...
✓ Discussions table created
Creating discussion_replies table...
✓ Discussion replies table created
Creating discussion_reactions table...
✓ Discussion reactions table created
Creating discussion_search_index table...
✓ Discussion search index table created
Enhancing messages table...
✓ Added is_read column to messages
✓ Added file_type column to messages

✅ Migration completed successfully!
```

2. Verify tables were created:
```sql
SHOW TABLES LIKE 'discussion%';
DESCRIBE discussions;
DESCRIBE discussion_replies;
DESCRIBE discussion_reactions;
```

---

## Step 2: Backend Configuration

### No additional configuration needed!
The existing setup handles:
- File uploads (via FileUploader utility)
- JWT authentication (via JwtHandler)
- Database connections (via Database class)
- CORS headers (already configured)

### Check Files
The following new files are already in place:
- `backend/Models/Discussion.php` - Discussion model
- `backend/Controllers/DiscussionController.php` - API controller
- `backend/migrate_discussions.php` - Migration script

---

## Step 3: Frontend Setup

### No new packages needed!
The frontend uses existing:
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Existing message service

### New Files Added
```
frontend/src/
├── services/
│   └── discussionService.js (NEW)
├── pages/common/
│   ├── Discussions.jsx (NEW)
│   ├── DiscussionDetail.jsx (NEW)
│   └── PrivateChat.jsx (NEW)
├── components/discussions/
│   ├── DiscussionForm.jsx (NEW)
│   ├── DiscussionReplyForm.jsx (NEW)
│   └── DiscussionThread.jsx (NEW)
├── routes/
│   └── index.jsx (UPDATED - new routes)
└── constants/
    └── apiEndpoints.js (UPDATED - new endpoints)
```

---

## Step 4: Test the Features

### Test Discussions

1. **As a Teacher:**
   - Go to Course Content Editor
   - Look for "Discussions" tab/button
   - Create a sample discussion
   - Add a reply with an image

2. **As a Student:**
   - Go to your course
   - Find "Discussions" section
   - Create a question
   - Reply to other discussions
   - Like/react to helpful answers

### Test Private Chat

1. **As a Student:**
   - Go to Messages/Chat section
   - Find your teacher in contacts
   - Send a message with a PDF file
   - Verify teacher can see it

2. **As a Teacher:**
   - Go to Messages/Chat section
   - Find a student
   - Send a message
   - Verify student receives it

---

## Step 5: Integration with Existing Features

### Add to Sidebar Navigation

Update your `Sidebar.jsx` to include discussion links:

```jsx
{/* For Students */}
{user?.role === 'student' && (
  <Link to={`/course/${courseId}/discussions`} className="nav-link">
    💬 Discussions
  </Link>
)}

{/* For Teachers */}
{user?.role === 'teacher' && (
  <Link to={`/course/${courseId}/discussions`} className="nav-link">
    💬 Course Discussions
  </Link>
)}

{/* For All Users - Private Chat */}
<Link to="/chat" className="nav-link">
  ✉️ Private Messages
</Link>
```

### Add to Course Viewer

In your `CourseViewer.jsx`, add a tab for discussions:

```jsx
<div className="tabs">
  <button onClick={() => setTab('content')}>Content</button>
  <button onClick={() => setTab('assignments')}>Assignments</button>
  <button onClick={() => setTab('discussions')}>Discussions</button>
</div>

{tab === 'discussions' && (
  <Discussions courseId={courseId} />
)}
```

---

## Step 6: Customize Appearance (Optional)

### Discussion List Item Styling

Edit `Discussions.jsx` to match your theme:

```jsx
// Change colors
className="bg-white rounded-lg border border-gray-200 p-4"
// To your brand colors

// Change icons
<MessageCircle className="w-5 h-5" />
// To your preferred icons
```

### Message Bubble Styling

Edit `PrivateChat.jsx` to match your brand:

```jsx
// Current: Blue for sent messages
className={`${message.sender_id === user?.id ? 'bg-blue-600' : 'bg-white'}`}
// Change 'blue-600' to your brand color
```

---

## Step 7: Troubleshooting

### Issue: 404 on discussion routes
**Solution:** 
- Verify routes added to `frontend/src/routes/index.jsx`
- Check that DiscussionController is imported in backend

### Issue: File upload fails
**Solution:**
- Check upload directory permissions: `backend/Uploads/`
- Verify file size under limits (10MB images, 50MB documents)
- Check MIME types are supported

### Issue: Discussions not showing
**Solution:**
- Run migration again: `php backend/migrate_discussions.php`
- Verify user has course access
- Clear browser cache and reload

### Issue: Private messages not loading
**Solution:**
- Verify teacher-student relationship exists
- Check JWT token is valid
- Refresh page

### Issue: Images not displaying in messages
**Solution:**
- Check image was uploaded (check network tab)
- Verify image path is correct
- Check CORS headers allow image loading

---

## Step 8: Performance Optimization

### Enable Database Indexing

If you want to manually verify indexes:

```sql
-- Check indexes on discussions
SHOW INDEX FROM discussions;

-- Check full-text search index
SELECT * FROM discussion_search_index LIMIT 5;

-- Check reaction performance
EXPLAIN SELECT COUNT(*) FROM discussion_reactions WHERE reply_id = 1;
```

### Enable Caching (Optional)

In `discussionService.js`, add caching:

```javascript
const discussionCache = new Map();

const getDiscussions = async (courseId, page, limit, sortBy) => {
  const cacheKey = `disc_${courseId}_${page}_${sortBy}`;
  
  if (discussionCache.has(cacheKey)) {
    return discussionCache.get(cacheKey);
  }
  
  const data = await api.get('/discussions', { params: { ... } });
  discussionCache.set(cacheKey, data);
  
  // Clear cache after 5 minutes
  setTimeout(() => discussionCache.delete(cacheKey), 5 * 60 * 1000);
  
  return data;
};
```

---

## Step 9: Production Checklist

Before deploying to production:

- [ ] Database migration script run successfully
- [ ] All new files uploaded to server
- [ ] Routes configured correctly
- [ ] File upload directories have proper permissions
- [ ] JWT tokens working on server
- [ ] CORS headers configured for production domain
- [ ] File size limits appropriate for server capacity
- [ ] Error handling tested
- [ ] User permissions verified
- [ ] File cleanup policy set (old uploads cleanup)

---

## Common Customizations

### Change discussion limit per page
`frontend/src/pages/common/Discussions.jsx`:
```javascript
const limit = 10; // Change to desired number
```

### Change attachment file size limit
`frontend/src/components/discussions/DiscussionForm.jsx`:
```javascript
if (file.size > 10 * 1024 * 1024) { // Change 10MB limit
```

### Change reaction types
`backend/Models/Discussion.php`:
```sql
-- Update the ENUM in discussion_reactions table
ALTER TABLE discussion_reactions MODIFY reaction_type 
  ENUM('like', 'helpful', 'confused', 'bookmark') DEFAULT 'like';
```

### Add notification for new discussions
In `backend/Controllers/DiscussionController.php`:
```php
// After creating discussion, add:
// $this->notifyTeachers($courseId, $discussion);
```

---

## Support Commands

### Clear upload cache
```bash
rm -rf backend/Uploads/discussions/*
rm -rf backend/Uploads/discussion_replies/*
```

### View recent discussions
```bash
# SSH to server and run:
mysql -u root -p elearning -e "SELECT * FROM discussions ORDER BY created_at DESC LIMIT 10;"
```

### Check file upload logs
```bash
tail -f backend/request.log | grep "POST.*discussions"
```

---

## Next Steps

1. Test all features thoroughly
2. Customize styling to match your brand
3. Train users on how to use discussions
4. Monitor usage and gather feedback
5. Plan future enhancements (real-time, advanced features, etc.)

---

**Need help?** Check `DISCUSSIONS_AND_CHAT_GUIDE.md` for detailed documentation.
