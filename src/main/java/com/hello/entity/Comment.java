package com.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 评论实体类
 */
@Entity
@Table(name = "comments")
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "announcement_id", nullable = false)
    private Long announcementId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "parent_id")
    private Long parentId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "like_count")
    private Integer likeCount = 0;
    
    @Column(name = "reply_count")
    private Integer replyCount = 0;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 关联映射
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", insertable = false, updatable = false)
    private Announcement announcement;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Comment parentComment;
    
    // 构造函数
    public Comment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.likeCount = 0;
        this.replyCount = 0;
        this.isDeleted = false;
    }
    
    public Comment(Long announcementId, Long userId, String content) {
        this();
        this.announcementId = announcementId;
        this.userId = userId;
        this.content = content;
    }
    
    public Comment(Long announcementId, Long userId, Long parentId, String content) {
        this(announcementId, userId, content);
        this.parentId = parentId;
    }
    
    // Getter和Setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getAnnouncementId() {
        return announcementId;
    }
    
    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getParentId() {
        return parentId;
    }
    
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Integer getLikeCount() {
        return likeCount;
    }
    
    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }
    
    public Integer getReplyCount() {
        return replyCount;
    }
    
    public void setReplyCount(Integer replyCount) {
        this.replyCount = replyCount;
    }
    
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Announcement getAnnouncement() {
        return announcement;
    }
    
    public void setAnnouncement(Announcement announcement) {
        this.announcement = announcement;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Comment getParentComment() {
        return parentComment;
    }
    
    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // 业务方法
    public void incrementLikeCount() {
        this.likeCount++;
    }
    
    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
    
    public void incrementReplyCount() {
        this.replyCount++;
    }
    
    public void decrementReplyCount() {
        if (this.replyCount > 0) {
            this.replyCount--;
        }
    }
    
    public boolean isReply() {
        return this.parentId != null;
    }
    
    public boolean isDeleted() {
        return this.isDeleted != null && this.isDeleted;
    }
    
    public void markAsDeleted() {
        this.isDeleted = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", announcementId=" + announcementId +
                ", userId=" + userId +
                ", parentId=" + parentId +
                ", content='" + content + '\'' +
                ", likeCount=" + likeCount +
                ", replyCount=" + replyCount +
                ", isDeleted=" + isDeleted +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
