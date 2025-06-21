package com.hello.service;

import com.hello.entity.Favorite;
import com.hello.entity.Announcement;
import com.hello.repository.FavoriteRepository;
import com.hello.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 收藏服务层
 */
@Service
@Transactional
public class FavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private AnnouncementRepository announcementRepository;
    
    /**
     * 收藏或取消收藏公告
     */
    public boolean toggleFavorite(Long userId, Long announcementId) {
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndAnnouncementId(userId, announcementId);
        
        if (existingFavorite.isPresent()) {
            // 取消收藏
            favoriteRepository.delete(existingFavorite.get());
            updateAnnouncementFavoriteCount(announcementId, -1);
            return false;
        } else {
            // 添加收藏
            // 验证公告是否存在
            Optional<Announcement> announcement = announcementRepository.findById(announcementId);
            if (announcement.isEmpty()) {
                throw new RuntimeException("公告不存在，ID: " + announcementId);
            }
            
            Favorite favorite = new Favorite(userId, announcementId);
            favoriteRepository.save(favorite);
            updateAnnouncementFavoriteCount(announcementId, 1);
            return true;
        }
    }
    
    /**
     * 收藏公告
     */
    public boolean favoriteAnnouncement(Long userId, Long announcementId) {
        return toggleFavorite(userId, announcementId);
    }
    
    /**
     * 检查用户是否已收藏公告
     */
    public boolean isFavorited(Long userId, Long announcementId) {
        return favoriteRepository.existsByUserIdAndAnnouncementId(userId, announcementId);
    }
    
    /**
     * 获取用户的收藏列表
     */
    public Page<Favorite> getUserFavorites(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return favoriteRepository.findByUserId(userId, pageable);
    }
    
    /**
     * 获取用户收藏的公告ID列表
     */
    public List<Long> getUserFavoriteAnnouncementIds(Long userId) {
        return favoriteRepository.findAnnouncementIdsByUserId(userId);
    }
    
    /**
     * 获取用户收藏的公告ID列表（分页）
     */
    public Page<Long> getUserFavoriteAnnouncementIds(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return favoriteRepository.findAnnouncementIdsByUserId(userId, pageable);
    }
    
    /**
     * 获取收藏某公告的用户列表
     */
    public List<Long> getAnnouncementFavoriteUserIds(Long announcementId) {
        return favoriteRepository.findUserIdsByAnnouncementId(announcementId);
    }
    
    /**
     * 获取公告的收藏数
     */
    public Long getAnnouncementFavoriteCount(Long announcementId) {
        return favoriteRepository.countByAnnouncementId(announcementId);
    }
    
    /**
     * 统计用户的收藏总数
     */
    public Long countUserFavorites(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }
    
    /**
     * 获取最近的收藏记录
     */
    public List<Favorite> getRecentFavorites(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return favoriteRepository.findRecentFavorites(pageable);
    }
    
    /**
     * 获取用户最近的收藏记录
     */
    public List<Favorite> getUserRecentFavorites(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return favoriteRepository.findRecentFavoritesByUserId(userId, pageable);
    }
    
    /**
     * 批量检查用户对多个公告的收藏状态
     */
    public List<Favorite> getUserFavoritesForAnnouncements(Long userId, List<Long> announcementIds) {
        return favoriteRepository.findByUserIdAndAnnouncementIdIn(userId, announcementIds);
    }
    
    /**
     * 获取热门收藏公告
     */
    public List<Object[]> getPopularAnnouncementsByFavoriteCount(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return favoriteRepository.findPopularAnnouncementsByFavoriteCount(pageable);
    }
    
    /**
     * 获取收藏统计信息
     */
    public List<Object[]> getFavoriteStatistics() {
        return favoriteRepository.countFavoritesByAnnouncement();
    }
    
    /**
     * 获取指定时间段内的收藏记录
     */
    public List<Favorite> getFavoritesInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return favoriteRepository.findFavoritesInDateRange(startDate, endDate);
    }
    
    /**
     * 获取用户在指定时间段内的收藏记录
     */
    public List<Favorite> getUserFavoritesInDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return favoriteRepository.findUserFavoritesInDateRange(userId, startDate, endDate);
    }
    
    /**
     * 删除用户的收藏记录
     */
    public void removeFavorite(Long userId, Long announcementId) {
        Optional<Favorite> favorite = favoriteRepository.findByUserIdAndAnnouncementId(userId, announcementId);
        if (favorite.isPresent()) {
            favoriteRepository.delete(favorite.get());
            updateAnnouncementFavoriteCount(announcementId, -1);
        }
    }
    
    /**
     * 获取收藏详情
     */
    public Optional<Favorite> getFavoriteById(Long id) {
        return favoriteRepository.findById(id);
    }
    
    /**
     * 获取用户对特定公告的收藏记录
     */
    public Optional<Favorite> getUserFavoriteForAnnouncement(Long userId, Long announcementId) {
        return favoriteRepository.findByUserIdAndAnnouncementId(userId, announcementId);
    }
    
    /**
     * 更新公告收藏数
     */
    private void updateAnnouncementFavoriteCount(Long announcementId, int delta) {
        Optional<Announcement> announcement = announcementRepository.findById(announcementId);
        if (announcement.isPresent()) {
            Announcement ann = announcement.get();
            int newCount = Math.max(0, ann.getFavoriteCount() + delta);
            ann.setFavoriteCount(newCount);
            announcementRepository.save(ann);
        }
    }
}
