package com.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 点赞实体类
 */
@Entity
@Table(name = "likes")
public class Like {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private TargetType targetType;
    
    @Column(name = "target_id", nullable = false)
    private Long targetId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // 关联映射
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    // 枚举类型定义
    public enum TargetType {
        ANNOUNCEMENT("公告"),
        COMMENT("评论");
        
        private final String displayName;
        
        TargetType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // 构造函数
    public Like() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Like(Long userId, TargetType targetType, Long targetId) {
        this();
        this.userId = userId;
        this.targetType = targetType;
        this.targetId = targetId;
    }
    
    // Getter和Setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public TargetType getTargetType() {
        return targetType;
    }
    
    public void setTargetType(TargetType targetType) {
        this.targetType = targetType;
    }
    
    public Long getTargetId() {
        return targetId;
    }
    
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    // 业务方法
    public boolean isAnnouncementLike() {
        return this.targetType == TargetType.ANNOUNCEMENT;
    }
    
    public boolean isCommentLike() {
        return this.targetType == TargetType.COMMENT;
    }
    
    @Override
    public String toString() {
        return "Like{" +
                "id=" + id +
                ", userId=" + userId +
                ", targetType=" + targetType +
                ", targetId=" + targetId +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        Like like = (Like) o;
        
        if (!userId.equals(like.userId)) return false;
        if (targetType != like.targetType) return false;
        return targetId.equals(like.targetId);
    }
    
    @Override
    public int hashCode() {
        int result = userId.hashCode();
        result = 31 * result + targetType.hashCode();
        result = 31 * result + targetId.hashCode();
        return result;
    }
}
