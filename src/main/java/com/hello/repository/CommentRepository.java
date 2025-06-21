package com.hello.repository;

import com.hello.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 评论数据访问层
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    /**
     * 根据公告ID查找评论（分页）
     */
    Page<Comment> findByAnnouncementIdAndIsDeletedFalse(Long announcementId, Pageable pageable);
    
    /**
     * 根据公告ID查找顶级评论（非回复）
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.parentId IS NULL AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> findTopLevelCommentsByAnnouncementId(@Param("announcementId") Long announcementId, Pageable pageable);
    
    /**
     * 根据父评论ID查找回复
     */
    @Query("SELECT c FROM Comment c WHERE c.parentId = :parentId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);
    
    /**
     * 根据用户ID查找评论
     */
    Page<Comment> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    
    /**
     * 统计公告的评论数量
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.announcementId = :announcementId AND c.isDeleted = false")
    Long countByAnnouncementId(@Param("announcementId") Long announcementId);
    
    /**
     * 统计评论的回复数量
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parentId = :parentId AND c.isDeleted = false")
    Long countRepliesByParentId(@Param("parentId") Long parentId);
    
    /**
     * 查找热门评论（按点赞数排序）
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.isDeleted = false ORDER BY c.likeCount DESC, c.createdAt DESC")
    Page<Comment> findPopularCommentsByAnnouncementId(@Param("announcementId") Long announcementId, Pageable pageable);
    
    /**
     * 查找最新评论
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> findLatestCommentsByAnnouncementId(@Param("announcementId") Long announcementId, Pageable pageable);
    
    /**
     * 根据内容模糊搜索评论
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.content LIKE %:keyword% AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> searchCommentsByKeyword(@Param("announcementId") Long announcementId, @Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 查找用户在特定公告下的评论
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.userId = :userId AND c.isDeleted = false ORDER BY c.createdAt DESC")
    List<Comment> findByAnnouncementIdAndUserId(@Param("announcementId") Long announcementId, @Param("userId") Long userId);
    
    /**
     * 查找最近的评论（全局）
     */
    @Query("SELECT c FROM Comment c WHERE c.isDeleted = false ORDER BY c.createdAt DESC")
    List<Comment> findRecentComments(Pageable pageable);
    
    /**
     * 统计用户的评论总数
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.userId = :userId AND c.isDeleted = false")
    Long countByUserId(@Param("userId") Long userId);
    
    /**
     * 查找评论及其回复（树形结构）
     */
    @Query("SELECT c FROM Comment c WHERE c.announcementId = :announcementId AND c.isDeleted = false ORDER BY " +
           "CASE WHEN c.parentId IS NULL THEN c.id ELSE c.parentId END, " +
           "CASE WHEN c.parentId IS NULL THEN 0 ELSE 1 END, " +
           "c.createdAt ASC")
    List<Comment> findCommentsWithRepliesByAnnouncementId(@Param("announcementId") Long announcementId);
    
    /**
     * 批量更新评论的点赞数
     */
    @Query("UPDATE Comment c SET c.likeCount = :likeCount WHERE c.id = :commentId")
    void updateLikeCount(@Param("commentId") Long commentId, @Param("likeCount") Integer likeCount);
    
    /**
     * 批量更新评论的回复数
     */
    @Query("UPDATE Comment c SET c.replyCount = :replyCount WHERE c.id = :commentId")
    void updateReplyCount(@Param("commentId") Long commentId, @Param("replyCount") Integer replyCount);
}
