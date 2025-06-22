package com.hello.service;

import com.hello.entity.Announcement;
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
 * 公告/活动服务层
 */
@Service
@Transactional
public class AnnouncementService {
    
    @Autowired
    private AnnouncementRepository announcementRepository;
    
    /**
     * 获取所有公告/活动（分页）
     */
    public Page<Announcement> getAllAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishTime"));
        return announcementRepository.findAll(pageable);
    }

    /**
     * 获取所有公告/活动（分页，支持筛选）
     */
    public Page<Announcement> getAllAnnouncements(int page, int size, String status, String type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishTime"));

        // 如果没有筛选条件，返回所有数据
        if ((status == null || status.trim().isEmpty()) && (type == null || type.trim().isEmpty())) {
            return announcementRepository.findAll(pageable);
        }

        // 根据筛选条件查询
        return announcementRepository.findByFilters(status, type, pageable);
    }
    
    /**
     * 获取已发布的公告/活动（分页）
     */
    public Page<Announcement> getPublishedAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.findPublishedAnnouncements(pageable);
    }
    
    /**
     * 根据类型获取已发布的公告/活动（分页）
     */
    public Page<Announcement> getPublishedAnnouncementsByType(Announcement.AnnouncementType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.findPublishedAnnouncementsByType(type, pageable);
    }
    
    /**
     * 根据ID获取公告/活动
     */
    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }
    
    /**
     * 根据ID获取公告/活动并增加浏览量
     */
    public Optional<Announcement> getAnnouncementByIdAndIncrementView(Long id) {
        Optional<Announcement> announcementOpt = announcementRepository.findById(id);
        if (announcementOpt.isPresent()) {
            Announcement announcement = announcementOpt.get();
            announcement.incrementViewCount();
            announcementRepository.save(announcement);
        }
        return announcementOpt;
    }
    
    /**
     * 创建公告/活动
     */
    public Announcement createAnnouncement(Announcement announcement) {
        // 如果没有设置发布时间，使用当前时间
        if (announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        
        // 生成摘要（如果没有提供）
        if (announcement.getSummary() == null || announcement.getSummary().trim().isEmpty()) {
            announcement.setSummary(generateSummary(announcement.getContent()));
        }
        
        return announcementRepository.save(announcement);
    }
    
    /**
     * 更新公告/活动
     */
    public Announcement updateAnnouncement(Long id, Announcement announcementDetails) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("公告/活动不存在，ID: " + id));
        
        announcement.setTitle(announcementDetails.getTitle());
        announcement.setContent(announcementDetails.getContent());
        announcement.setType(announcementDetails.getType());
        announcement.setStatus(announcementDetails.getStatus());
        announcement.setPublishTime(announcementDetails.getPublishTime());
        announcement.setDeadlineTime(announcementDetails.getDeadlineTime());
        announcement.setPublisher(announcementDetails.getPublisher());
        announcement.setIsImportant(announcementDetails.getIsImportant());
        
        // 更新摘要
        if (announcementDetails.getSummary() == null || announcementDetails.getSummary().trim().isEmpty()) {
            announcement.setSummary(generateSummary(announcementDetails.getContent()));
        } else {
            announcement.setSummary(announcementDetails.getSummary());
        }
        
        return announcementRepository.save(announcement);
    }
    
    /**
     * 删除公告/活动
     */
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("公告/活动不存在，ID: " + id));
        announcementRepository.delete(announcement);
    }
    
    /**
     * 发布公告/活动
     */
    public Announcement publishAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("公告/活动不存在，ID: " + id));
        
        announcement.setStatus(Announcement.AnnouncementStatus.PUBLISHED);
        announcement.setPublishTime(LocalDateTime.now());
        
        return announcementRepository.save(announcement);
    }
    
    /**
     * 取消发布公告/活动
     */
    public Announcement unpublishAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("公告/活动不存在，ID: " + id));
        
        announcement.setStatus(Announcement.AnnouncementStatus.CANCELLED);
        
        return announcementRepository.save(announcement);
    }
    
    /**
     * 搜索公告/活动
     */
    public Page<Announcement> searchAnnouncements(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.searchByKeyword(keyword, pageable);
    }
    
    /**
     * 获取重要公告/活动
     */
    public List<Announcement> getImportantAnnouncements() {
        return announcementRepository.findImportantPublishedAnnouncements();
    }
    
    /**
     * 获取最近发布的公告/活动
     */
    public List<Announcement> getRecentAnnouncements(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return announcementRepository.findRecentAnnouncements(pageable);
    }
    
    /**
     * 获取热门公告/活动
     */
    public List<Announcement> getPopularAnnouncements(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return announcementRepository.findPopularAnnouncements(pageable);
    }
    
    /**
     * 获取即将过期的公告/活动
     */
    public List<Announcement> getExpiringAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        return announcementRepository.findExpiringAnnouncements(now, sevenDaysLater);
    }
    
    /**
     * 更新过期公告/活动状态
     */
    public void updateExpiredAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> expiredAnnouncements = announcementRepository.findExpiredAnnouncements(now);
        
        for (Announcement announcement : expiredAnnouncements) {
            announcement.setStatus(Announcement.AnnouncementStatus.EXPIRED);
            announcementRepository.save(announcement);
        }
    }
    
    /**
     * 获取统计信息
     */
    public StatisticsInfo getStatistics() {
        return new StatisticsInfo(
            announcementRepository.countByType(),
            announcementRepository.countByStatus(),
            announcementRepository.count()
        );
    }

    /**
     * 统计信息类
     */
    public static class StatisticsInfo {
        private final List<Object[]> typeCount;
        private final List<Object[]> statusCount;
        private final long totalCount;

        public StatisticsInfo(List<Object[]> typeCount, List<Object[]> statusCount, long totalCount) {
            this.typeCount = typeCount;
            this.statusCount = statusCount;
            this.totalCount = totalCount;
        }

        public List<Object[]> getTypeCount() { return typeCount; }
        public List<Object[]> getStatusCount() { return statusCount; }
        public long getTotalCount() { return totalCount; }
    }
    
    /**
     * 根据ID列表获取公告/活动
     */
    public List<Announcement> getAnnouncementsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return announcementRepository.findByIdIn(ids);
    }

    /**
     * 生成内容摘要
     */
    private String generateSummary(String content) {
        if (content == null || content.trim().isEmpty()) {
            return "";
        }

        // 移除HTML标签
        String plainText = content.replaceAll("<[^>]*>", "");

        // 限制摘要长度为100个字符
        if (plainText.length() <= 100) {
            return plainText;
        } else {
            return plainText.substring(0, 100) + "...";
        }
    }
}
