<?php
// v2.1 - Cache invalidation - May 8 2026 - Fixed PHP 8 match() to switch
namespace Models;

use Core\Database;
use PDO;

class Discussion {
    private $db;
    private $discussionGroupModel;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->discussionGroupModel = new DiscussionGroup();
    }

    /**
     * Create a teacher-owned discussion group.
     */
    public function createGroup($courseId, $teacherId, $name, $description = null) {
        return $this->discussionGroupModel->createForCourse($courseId, $teacherId, $name, $description);
    }

    /**
     * Get discussion groups for a course.
     */
    public function getGroupsByCourse($courseId) {
        return $this->discussionGroupModel->getForCourse($courseId);
    }

    /**
     * Get a discussion group by id.
     */
    public function getGroupById($groupId) {
        $stmt = $this->db->prepare("
            SELECT g.*,
                   u.name  AS teacher_name,
                   cl.name AS class_name,
                   s.name  AS subject_name
            FROM discussion_groups g
            LEFT JOIN users u    ON u.id  = g.teacher_id
            LEFT JOIN classes cl ON cl.id = g.class_id
            LEFT JOIN subjects s  ON s.id  = g.subject_id
            WHERE g.id = :group_id
            LIMIT 1
        ");

        $stmt->execute(['group_id' => $groupId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new discussion thread
     */
    public function createDiscussion($courseId, $studentId, $title, $content, $attachmentUrl = null, $attachmentType = null, $groupId = null) {
        $stmt = $this->db->prepare("
            INSERT INTO discussions (course_id, group_id, student_id, title, content, attachment_url, attachment_type)
            VALUES (:course_id, :group_id, :student_id, :title, :content, :attachment_url, :attachment_type)
        ");

        $result = $stmt->execute([
            'course_id' => $courseId,
            'group_id' => $groupId,
            'student_id' => $studentId,
            'title' => $title,
            'content' => $content,
            'attachment_url' => $attachmentUrl,
            'attachment_type' => $attachmentType
        ]);

        if ($result) {
            $discussionId = $this->db->lastInsertId();
            // Update search index
            $this->updateSearchIndex($discussionId, $title . ' ' . $content);
            return $discussionId;
        }
        return false;
    }

    /**
     * Get all discussions for a course with pagination
     */
    public function getDiscussionsByCourse($courseId, $page = 1, $limit = 10, $sortBy = 'recent', $groupId = null) {
        $offset = ($page - 1) * $limit;

        switch($sortBy) {
            case 'popular':
                $orderBy = 'views DESC, d.created_at DESC';
                break;
            case 'unanswered':
                $orderBy = '(SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) ASC, d.created_at DESC';
                break;
            default:
                $orderBy = 'd.created_at DESC';
        }

        $stmt = $this->db->prepare("
            SELECT 
                d.*,
                u.name as student_name,
                u.role as student_role,
                u.profile_image as student_avatar,
                (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count,
                (SELECT COUNT(DISTINCT user_id) FROM discussion_reactions dr 
                 JOIN discussion_replies dr2 ON dr.reply_id = dr2.id 
                 WHERE dr2.discussion_id = d.id) as reaction_count
            FROM discussions d
            JOIN users u ON u.id = d.student_id
            WHERE d.course_id = :course_id
            " . ($groupId ? " AND d.group_id = :group_id " : "") . "
            ORDER BY {$orderBy}
            LIMIT :offset, :limit
        ");

        $stmt->bindValue('course_id', $courseId, PDO::PARAM_INT);
        if ($groupId) {
            $stmt->bindValue('group_id', $groupId, PDO::PARAM_INT);
        }
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get discussion count for a course
     */
    public function getDiscussionCountByCourse($courseId, $groupId = null) {
        $sql = "SELECT COUNT(*) as count FROM discussions WHERE course_id = :course_id";
        if ($groupId) {
            $sql .= " AND group_id = :group_id";
        }

        $stmt = $this->db->prepare($sql);
        $params = ['course_id' => $courseId];
        if ($groupId) {
            $params['group_id'] = $groupId;
        }
        $stmt->execute($params);
        return $stmt->fetch()['count'];
    }

    /**
     * Get single discussion with details
     */
    public function getDiscussionById($discussionId) {
        $stmt = $this->db->prepare("
            SELECT 
                d.*,
                g.name as group_name,
                g.description as group_description,
                u.name as student_name,
                u.role as student_role,
                u.profile_image as student_avatar,
                (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
            FROM discussions d
            JOIN users u ON u.id = d.student_id
            LEFT JOIN discussion_groups g ON g.id = d.group_id
            WHERE d.id = :id
        ");

        $stmt->execute(['id' => $discussionId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Increment discussion view count
     */
    public function incrementViews($discussionId) {
        $stmt = $this->db->prepare("UPDATE discussions SET views = views + 1 WHERE id = :id");
        return $stmt->execute(['id' => $discussionId]);
    }

    /**
     * Add reply to discussion
     */
    public function addReply($discussionId, $userId, $content, $attachmentUrl = null, $attachmentType = null) {
        $stmt = $this->db->prepare("
            INSERT INTO discussion_replies (discussion_id, user_id, content, attachment_url, attachment_type)
            VALUES (:discussion_id, :user_id, :content, :attachment_url, :attachment_type)
        ");

        return $stmt->execute([
            'discussion_id' => $discussionId,
            'user_id' => $userId,
            'content' => $content,
            'attachment_url' => $attachmentUrl,
            'attachment_type' => $attachmentType
        ]);
    }

    /**
     * Get all replies for a discussion
     */
    public function getRepliesByDiscussion($discussionId) {
        $stmt = $this->db->prepare("
            SELECT 
                dr.*,
                u.name as user_name,
                u.role as user_role,
                u.profile_image as user_avatar,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'like') as like_count,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'helpful') as helpful_count,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'confused') as confused_count
            FROM discussion_replies dr
            JOIN users u ON u.id = dr.user_id
            WHERE dr.discussion_id = :discussion_id
            ORDER BY dr.is_best_answer DESC, dr.created_at ASC
        ");

        $stmt->execute(['discussion_id' => $discussionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get reply with user reactions
     */
    public function getReplyWithReactions($replyId, $userId = null) {
        $stmt = $this->db->prepare("
            SELECT 
                dr.*,
                u.name as user_name,
                u.role as user_role,
                u.profile_image as user_avatar,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'like') as like_count,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'helpful') as helpful_count,
                (SELECT COUNT(*) FROM discussion_reactions 
                 WHERE reply_id = dr.id AND reaction_type = 'confused') as confused_count
        ");

        if ($userId) {
            $stmt = $this->db->prepare("
                SELECT 
                    dr.*,
                    u.name as user_name,
                    u.role as user_role,
                    u.profile_image as user_avatar,
                    (SELECT COUNT(*) FROM discussion_reactions 
                     WHERE reply_id = dr.id AND reaction_type = 'like') as like_count,
                    (SELECT COUNT(*) FROM discussion_reactions 
                     WHERE reply_id = dr.id AND reaction_type = 'helpful') as helpful_count,
                    (SELECT COUNT(*) FROM discussion_reactions 
                     WHERE reply_id = dr.id AND reaction_type = 'confused') as confused_count,
                    CASE WHEN EXISTS (SELECT 1 FROM discussion_reactions 
                                     WHERE reply_id = dr.id AND user_id = :user_id) 
                         THEN 1 ELSE 0 END as user_reacted
                FROM discussion_replies dr
                JOIN users u ON u.id = dr.user_id
                WHERE dr.id = :reply_id
            ");
            $stmt->execute(['reply_id' => $replyId, 'user_id' => $userId]);
        } else {
            $stmt->execute(['reply_id' => $replyId]);
        }

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Add reaction to reply
     */
    public function addReaction($replyId, $userId, $reactionType = 'like') {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO discussion_reactions (reply_id, user_id, reaction_type)
                VALUES (:reply_id, :user_id, :reaction_type)
                ON DUPLICATE KEY UPDATE reaction_type = :reaction_type
            ");

            return $stmt->execute([
                'reply_id' => $replyId,
                'user_id' => $userId,
                'reaction_type' => $reactionType
            ]);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Remove reaction from reply
     */
    public function removeReaction($replyId, $userId) {
        $stmt = $this->db->prepare("
            DELETE FROM discussion_reactions 
            WHERE reply_id = :reply_id AND user_id = :user_id
        ");

        return $stmt->execute([
            'reply_id' => $replyId,
            'user_id' => $userId
        ]);
    }

    /**
     * Mark reply as best answer
     */
    public function markBestAnswer($replyId, $discussionId) {
        // First, unmark all previous best answers
        $stmt = $this->db->prepare("
            UPDATE discussion_replies 
            SET is_best_answer = 0 
            WHERE discussion_id = :discussion_id
        ");
        $stmt->execute(['discussion_id' => $discussionId]);

        // Mark the new best answer
        $stmt = $this->db->prepare("
            UPDATE discussion_replies 
            SET is_best_answer = 1 
            WHERE id = :reply_id
        ");

        return $stmt->execute(['reply_id' => $replyId]);
    }

    /**
     * Search discussions by keyword
     */
    public function searchDiscussions($courseId, $keyword, $page = 1, $limit = 10, $groupId = null) {
        $offset = ($page - 1) * $limit;
        $searchTerm = '%' . $keyword . '%';

        $stmt = $this->db->prepare("
            SELECT 
                d.*,
                u.name as student_name,
                u.role as student_role,
                u.profile_image as student_avatar,
                (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
            FROM discussions d
            JOIN users u ON u.id = d.student_id
            WHERE d.course_id = :course_id 
            " . ($groupId ? " AND d.group_id = :group_id " : "") . "
            AND (d.title LIKE :keyword OR d.content LIKE :keyword)
            ORDER BY d.created_at DESC
            LIMIT :offset, :limit
        ");

        $stmt->bindValue('course_id', $courseId, PDO::PARAM_INT);
        if ($groupId) {
            $stmt->bindValue('group_id', $groupId, PDO::PARAM_INT);
        }
        $stmt->bindValue('keyword', $searchTerm, PDO::PARAM_STR);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update search index for discussion
     */
    private function updateSearchIndex($discussionId, $searchText) {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM discussion_search_index WHERE discussion_id = :discussion_id
            ");
            $stmt->execute(['discussion_id' => $discussionId]);

            $stmt = $this->db->prepare("
                INSERT INTO discussion_search_index (discussion_id, search_text)
                VALUES (:discussion_id, :search_text)
            ");
            $stmt->execute([
                'discussion_id' => $discussionId,
                'search_text' => $searchText
            ]);
        } catch (\Exception $e) {
            // Search index update is not critical
            return false;
        }
    }

    /**
     * Delete discussion (only by owner or admin)
     */
    public function deleteDiscussion($discussionId) {
        $stmt = $this->db->prepare("DELETE FROM discussions WHERE id = :id");
        return $stmt->execute(['id' => $discussionId]);
    }

    /**
     * Delete reply (only by owner or admin)
     */
    public function deleteReply($replyId) {
        $stmt = $this->db->prepare("DELETE FROM discussion_replies WHERE id = :id");
        return $stmt->execute(['id' => $replyId]);
    }

    /**
     * Update discussion
     */
    public function updateDiscussion($discussionId, $title, $content) {
        $stmt = $this->db->prepare("
            UPDATE discussions 
            SET title = :title, content = :content, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");

        return $stmt->execute([
            'id' => $discussionId,
            'title' => $title,
            'content' => $content
        ]);
    }

    /**
     * Update reply
     */
    public function updateReply($replyId, $content) {
        $stmt = $this->db->prepare("
            UPDATE discussion_replies 
            SET content = :content, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");

        return $stmt->execute([
            'id' => $replyId,
            'content' => $content
        ]);
    }
}
