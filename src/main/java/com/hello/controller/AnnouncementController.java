package com.hello.controller;

import com.hello.entity.Announcement;
import com.hello.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 公告/活动控制器 - 提供RESTful API
 */
@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*") // 允许跨域请求
public class AnnouncementController {
    
    @Autowired
    private AnnouncementService announcementService;
    
    /**
     * 获取所有公告/活动（分页，支持筛选）
     * GET /api/announcements?page=0&size=10&status=PUBLISHED&type=ANNOUNCEMENT
     */
    @GetMapping
    public ResponseEntity<Page<Announcement>> getAllAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        try {
            Page<Announcement> announcements = announcementService.getAllAnnouncements(page, size, status, type);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取已发布的公告/活动（分页）
     * GET /api/announcements/published?page=0&size=10
     */
    @GetMapping("/published")
    public ResponseEntity<Page<Announcement>> getPublishedAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Announcement> announcements = announcementService.getPublishedAnnouncements(page, size);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 根据类型获取已发布的公告/活动（分页）
     * GET /api/announcements/published/type/{type}?page=0&size=10
     */
    @GetMapping("/published/type/{type}")
    public ResponseEntity<Page<Announcement>> getPublishedAnnouncementsByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Announcement.AnnouncementType announcementType = Announcement.AnnouncementType.valueOf(type.toUpperCase());
            Page<Announcement> announcements = announcementService.getPublishedAnnouncementsByType(announcementType, page, size);
            return ResponseEntity.ok(announcements);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 根据ID获取公告/活动
     * GET /api/announcements/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
        try {
            Optional<Announcement> announcement = announcementService.getAnnouncementByIdAndIncrementView(id);
            return announcement.map(ResponseEntity::ok)
                             .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 创建公告/活动
     * POST /api/announcements
     */
    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        try {
            Announcement createdAnnouncement = announcementService.createAnnouncement(announcement);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAnnouncement);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 更新公告/活动
     * PUT /api/announcements/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcement) {
        try {
            Announcement updatedAnnouncement = announcementService.updateAnnouncement(id, announcement);
            return ResponseEntity.ok(updatedAnnouncement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 删除公告/活动
     * DELETE /api/announcements/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        try {
            announcementService.deleteAnnouncement(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 发布公告/活动
     * PUT /api/announcements/{id}/publish
     */
    @PutMapping("/{id}/publish")
    public ResponseEntity<Announcement> publishAnnouncement(@PathVariable Long id) {
        try {
            Announcement publishedAnnouncement = announcementService.publishAnnouncement(id);
            return ResponseEntity.ok(publishedAnnouncement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 取消发布公告/活动
     * PUT /api/announcements/{id}/unpublish
     */
    @PutMapping("/{id}/unpublish")
    public ResponseEntity<Announcement> unpublishAnnouncement(@PathVariable Long id) {
        try {
            Announcement unpublishedAnnouncement = announcementService.unpublishAnnouncement(id);
            return ResponseEntity.ok(unpublishedAnnouncement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 搜索公告/活动
     * GET /api/announcements/search?keyword=关键词&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Announcement>> searchAnnouncements(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Announcement> announcements = announcementService.searchAnnouncements(keyword, page, size);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取重要公告/活动
     * GET /api/announcements/important
     */
    @GetMapping("/important")
    public ResponseEntity<List<Announcement>> getImportantAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.getImportantAnnouncements();
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取最近发布的公告/活动
     * GET /api/announcements/recent?limit=5
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Announcement>> getRecentAnnouncements(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<Announcement> announcements = announcementService.getRecentAnnouncements(limit);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取热门公告/活动
     * GET /api/announcements/popular?limit=5
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Announcement>> getPopularAnnouncements(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<Announcement> announcements = announcementService.getPopularAnnouncements(limit);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取即将过期的公告/活动
     * GET /api/announcements/expiring
     */
    @GetMapping("/expiring")
    public ResponseEntity<List<Announcement>> getExpiringAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.getExpiringAnnouncements();
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取统计信息
     * GET /api/announcements/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<AnnouncementService.StatisticsInfo> getStatistics() {
        try {
            AnnouncementService.StatisticsInfo statistics = announcementService.getStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 更新过期公告/活动状态
     * PUT /api/announcements/update-expired
     */
    @PutMapping("/update-expired")
    public ResponseEntity<Void> updateExpiredAnnouncements() {
        try {
            announcementService.updateExpiredAnnouncements();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
