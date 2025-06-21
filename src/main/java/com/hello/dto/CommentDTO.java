package com.hello.dto;

import com.hello.entity.Comment;
import java.time.LocalDateTime;

/**
 * 评论数据传输对象
 */
public class CommentDTO {
    
    private Long id;
    private Long announcementId;
    private Long userId;
    private String username;
    private String realName;
    private Long parentId;
    private String content;
    private Integer likeCount;
    private Integer replyCount;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 构造函数
    public CommentDTO() {}
    
    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.announcementId = comment.getAnnouncementId();
        this.userId = comment.getUserId();
        this.parentId = comment.getParentId();
        this.content = comment.getContent();
        this.likeCount = comment.getLikeCount();
        this.replyCount = comment.getReplyCount();
        this.isDeleted = comment.getIsDeleted();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        
        // 如果有用户信息，设置用户名
        if (comment.getUser() != null) {
            this.username = comment.getUser().getUsername();
            this.realName = comment.getUser().getRealName();
        }
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRealName() {
        return realName;
    }
    
    public void setRealName(String realName) {
        this.realName = realName;
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
    
    @Override
    public String toString() {
        return "CommentDTO{" +
                "id=" + id +
                ", announcementId=" + announcementId +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", realName='" + realName + '\'' +
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
