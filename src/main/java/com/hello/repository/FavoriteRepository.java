package com.hello.repository;

import com.hello.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 收藏数据访问层
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    /**
     * 查找用户对特定公告的收藏记录
     */
    Optional<Favorite> findByUserIdAndAnnouncementId(Long userId, Long announcementId);
    
    /**
     * 检查用户是否已收藏公告
     */
    boolean existsByUserIdAndAnnouncementId(Long userId, Long announcementId);
    
    /**
     * 根据用户ID查找收藏记录（分页）
     */
    Page<Favorite> findByUserId(Long userId, Pageable pageable);
    
    /**
     * 根据公告ID查找收藏记录
     */
    List<Favorite> findByAnnouncementId(Long announcementId);
    
    /**
     * 统计公告的收藏数量
     */
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.announcementId = :announcementId")
    Long countByAnnouncementId(@Param("announcementId") Long announcementId);
    
    /**
     * 统计用户的收藏总数
     */
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    /**
     * 删除用户对特定公告的收藏
     */
    void deleteByUserIdAndAnnouncementId(Long userId, Long announcementId);
    
    /**
     * 查找用户收藏的公告ID列表
     */
    @Query("SELECT f.announcementId FROM Favorite f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    List<Long> findAnnouncementIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 查找用户收藏的公告ID列表（分页）
     */
    @Query("SELECT f.announcementId FROM Favorite f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    Page<Long> findAnnouncementIdsByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 查找收藏特定公告的用户ID列表
     */
    @Query("SELECT f.userId FROM Favorite f WHERE f.announcementId = :announcementId ORDER BY f.createdAt DESC")
    List<Long> findUserIdsByAnnouncementId(@Param("announcementId") Long announcementId);
    
    /**
     * 查找最近的收藏记录
     */
    @Query("SELECT f FROM Favorite f ORDER BY f.createdAt DESC")
    List<Favorite> findRecentFavorites(Pageable pageable);
    
    /**
     * 查找用户最近收藏的公告
     */
    @Query("SELECT f FROM Favorite f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    List<Favorite> findRecentFavoritesByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 批量查询用户对多个公告的收藏状态
     */
    @Query("SELECT f FROM Favorite f WHERE f.userId = :userId AND f.announcementId IN :announcementIds")
    List<Favorite> findByUserIdAndAnnouncementIdIn(@Param("userId") Long userId, @Param("announcementIds") List<Long> announcementIds);
    
    /**
     * 查找热门收藏公告（按收藏数排序）
     */
    @Query("SELECT f.announcementId, COUNT(f) as favoriteCount FROM Favorite f GROUP BY f.announcementId ORDER BY favoriteCount DESC")
    List<Object[]> findPopularAnnouncementsByFavoriteCount(Pageable pageable);
    
    /**
     * 统计每个公告的收藏数量
     */
    @Query("SELECT f.announcementId, COUNT(f) FROM Favorite f GROUP BY f.announcementId")
    List<Object[]> countFavoritesByAnnouncement();
    
    /**
     * 查找在指定时间段内收藏的记录
     */
    @Query("SELECT f FROM Favorite f WHERE f.createdAt BETWEEN :startDate AND :endDate ORDER BY f.createdAt DESC")
    List<Favorite> findFavoritesInDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                           @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * 查找用户在指定时间段内的收藏记录
     */
    @Query("SELECT f FROM Favorite f WHERE f.userId = :userId AND f.createdAt BETWEEN :startDate AND :endDate ORDER BY f.createdAt DESC")
    List<Favorite> findUserFavoritesInDateRange(@Param("userId") Long userId,
                                               @Param("startDate") java.time.LocalDateTime startDate, 
                                               @Param("endDate") java.time.LocalDateTime endDate);
}
