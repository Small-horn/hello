package com.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 公告/活动实体类
 */
@Entity
@Table(name = "announcements")
public class Announcement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnnouncementType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnnouncementStatus status;
    
    @Column(name = "publish_time", nullable = false)
    private LocalDateTime publishTime;
    
    @Column(name = "deadline_time")
    private LocalDateTime deadlineTime;
    
    @Column(length = 100)
    private String publisher;
    
    @Column(length = 500)
    private String summary;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "is_important")
    private Boolean isImportant = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 枚举类型定义
    public enum AnnouncementType {
        ANNOUNCEMENT("公告"),
        ACTIVITY("活动");
        
        private final String displayName;
        
        AnnouncementType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum AnnouncementStatus {
        DRAFT("草稿"),
        PUBLISHED("已发布"),
        EXPIRED("已过期"),
        CANCELLED("已取消");
        
        private final String displayName;
        
        AnnouncementStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // 构造函数
    public Announcement() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.publishTime = LocalDateTime.now();
        this.status = AnnouncementStatus.DRAFT;
        this.viewCount = 0;
        this.isImportant = false;
    }
    
    public Announcement(String title, String content, AnnouncementType type) {
        this();
        this.title = title;
        this.content = content;
        this.type = type;
    }
    
    // Getter和Setter方法
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public AnnouncementType getType() {
        return type;
    }
    
    public void setType(AnnouncementType type) {
        this.type = type;
    }
    
    public AnnouncementStatus getStatus() {
        return status;
    }
    
    public void setStatus(AnnouncementStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getPublishTime() {
        return publishTime;
    }
    
    public void setPublishTime(LocalDateTime publishTime) {
        this.publishTime = publishTime;
    }
    
    public LocalDateTime getDeadlineTime() {
        return deadlineTime;
    }
    
    public void setDeadlineTime(LocalDateTime deadlineTime) {
        this.deadlineTime = deadlineTime;
    }
    
    public String getPublisher() {
        return publisher;
    }
    
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }
    
    public String getSummary() {
        return summary;
    }
    
    public void setSummary(String summary) {
        this.summary = summary;
    }
    
    public Integer getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
    
    public Boolean getIsImportant() {
        return isImportant;
    }
    
    public void setIsImportant(Boolean isImportant) {
        this.isImportant = isImportant;
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // 业务方法
    public void incrementViewCount() {
        this.viewCount++;
    }
    
    public boolean isExpired() {
        return this.deadlineTime != null && LocalDateTime.now().isAfter(this.deadlineTime);
    }
    
    public boolean isActive() {
        return this.status == AnnouncementStatus.PUBLISHED && !isExpired();
    }
    
    @Override
    public String toString() {
        return "Announcement{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", status=" + status +
                ", publisher='" + publisher + '\'' +
                ", publishTime=" + publishTime +
                ", deadlineTime=" + deadlineTime +
                ", viewCount=" + viewCount +
                ", isImportant=" + isImportant +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
