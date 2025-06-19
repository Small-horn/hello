package com.hello.repository;

import com.hello.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 公告/活动数据访问层
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    /**
     * 根据类型查找公告/活动
     */
    Page<Announcement> findByType(Announcement.AnnouncementType type, Pageable pageable);
    
    /**
     * 根据状态查找公告/活动
     */
    Page<Announcement> findByStatus(Announcement.AnnouncementStatus status, Pageable pageable);
    
    /**
     * 根据类型和状态查找公告/活动
     */
    Page<Announcement> findByTypeAndStatus(Announcement.AnnouncementType type, 
                                         Announcement.AnnouncementStatus status, 
                                         Pageable pageable);
    
    /**
     * 查找已发布的公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' ORDER BY a.isImportant DESC, a.publishTime DESC")
    Page<Announcement> findPublishedAnnouncements(Pageable pageable);
    
    /**
     * 根据类型查找已发布的公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.type = :type AND a.status = 'PUBLISHED' ORDER BY a.isImportant DESC, a.publishTime DESC")
    Page<Announcement> findPublishedAnnouncementsByType(@Param("type") Announcement.AnnouncementType type, Pageable pageable);
    
    /**
     * 查找重要的已发布公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.isImportant = true ORDER BY a.publishTime DESC")
    List<Announcement> findImportantPublishedAnnouncements();
    
    /**
     * 根据标题模糊搜索
     */
    @Query("SELECT a FROM Announcement a WHERE a.title LIKE %:keyword% AND a.status = 'PUBLISHED' ORDER BY a.isImportant DESC, a.publishTime DESC")
    Page<Announcement> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 根据标题和内容模糊搜索
     */
    @Query("SELECT a FROM Announcement a WHERE (a.title LIKE %:keyword% OR a.content LIKE %:keyword% OR a.summary LIKE %:keyword%) AND a.status = 'PUBLISHED' ORDER BY a.isImportant DESC, a.publishTime DESC")
    Page<Announcement> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 根据发布者查找公告/活动
     */
    Page<Announcement> findByPublisher(String publisher, Pageable pageable);
    
    /**
     * 查找即将过期的公告/活动（未来7天内过期）
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.deadlineTime IS NOT NULL AND a.deadlineTime BETWEEN :now AND :sevenDaysLater ORDER BY a.deadlineTime ASC")
    List<Announcement> findExpiringAnnouncements(@Param("now") LocalDateTime now, 
                                                @Param("sevenDaysLater") LocalDateTime sevenDaysLater);
    
    /**
     * 查找已过期但状态未更新的公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.deadlineTime IS NOT NULL AND a.deadlineTime < :now")
    List<Announcement> findExpiredAnnouncements(@Param("now") LocalDateTime now);
    
    /**
     * 统计各类型公告/活动数量
     */
    @Query("SELECT a.type, COUNT(a) FROM Announcement a WHERE a.status = 'PUBLISHED' GROUP BY a.type")
    List<Object[]> countByType();
    
    /**
     * 统计各状态公告/活动数量
     */
    @Query("SELECT a.status, COUNT(a) FROM Announcement a GROUP BY a.status")
    List<Object[]> countByStatus();
    
    /**
     * 获取最近发布的公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' ORDER BY a.publishTime DESC")
    List<Announcement> findRecentAnnouncements(Pageable pageable);
    
    /**
     * 获取热门公告/活动（按浏览量排序）
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' ORDER BY a.viewCount DESC")
    List<Announcement> findPopularAnnouncements(Pageable pageable);
    
    /**
     * 根据发布时间范围查找公告/活动
     */
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.publishTime BETWEEN :startTime AND :endTime ORDER BY a.publishTime DESC")
    Page<Announcement> findByPublishTimeBetween(@Param("startTime") LocalDateTime startTime, 
                                              @Param("endTime") LocalDateTime endTime, 
                                              Pageable pageable);
}
