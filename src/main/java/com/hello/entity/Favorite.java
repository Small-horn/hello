package com.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 收藏实体类
 */
@Entity
@Table(name = "favorites")
public class Favorite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "announcement_id", nullable = false)
    private Long announcementId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // 关联映射
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", insertable = false, updatable = false)
    private Announcement announcement;
    
    // 构造函数
    public Favorite() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Favorite(Long userId, Long announcementId) {
        this();
        this.userId = userId;
        this.announcementId = announcementId;
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
    
    public Long getAnnouncementId() {
        return announcementId;
    }
    
    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
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
    
    public Announcement getAnnouncement() {
        return announcement;
    }
    
    public void setAnnouncement(Announcement announcement) {
        this.announcement = announcement;
    }
    
    @Override
    public String toString() {
        return "Favorite{" +
                "id=" + id +
                ", userId=" + userId +
                ", announcementId=" + announcementId +
                ", createdAt=" + createdAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        Favorite favorite = (Favorite) o;
        
        if (!userId.equals(favorite.userId)) return false;
        return announcementId.equals(favorite.announcementId);
    }
    
    @Override
    public int hashCode() {
        int result = userId.hashCode();
        result = 31 * result + announcementId.hashCode();
        return result;
    }
}
