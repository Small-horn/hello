package com.hello.controller;

import com.hello.entity.Favorite;
import com.hello.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 收藏控制器 - 提供RESTful API
 */
@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {
    
    @Autowired
    private FavoriteService favoriteService;
    
    /**
     * 收藏或取消收藏公告
     * POST /api/favorites
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleFavorite(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long announcementId = Long.valueOf(request.get("announcementId").toString());
            
            boolean isFavorited = favoriteService.toggleFavorite(userId, announcementId);
            Long favoriteCount = favoriteService.getAnnouncementFavoriteCount(announcementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorited", isFavorited);
            response.put("favoriteCount", favoriteCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 检查用户是否已收藏公告
     * GET /api/favorites/status?userId=1&announcementId=1
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getFavoriteStatus(
            @RequestParam Long userId,
            @RequestParam Long announcementId) {
        try {
            boolean isFavorited = favoriteService.isFavorited(userId, announcementId);
            Long favoriteCount = favoriteService.getAnnouncementFavoriteCount(announcementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorited", isFavorited);
            response.put("favoriteCount", favoriteCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户的收藏列表
     * GET /api/favorites/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Favorite>> getUserFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Favorite> favorites = favoriteService.getUserFavorites(userId, page, size);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户收藏的公告ID列表
     * GET /api/favorites/user/{userId}/announcements
     */
    @GetMapping("/user/{userId}/announcements")
    public ResponseEntity<List<Long>> getUserFavoriteAnnouncementIds(@PathVariable Long userId) {
        try {
            List<Long> announcementIds = favoriteService.getUserFavoriteAnnouncementIds(userId);
            return ResponseEntity.ok(announcementIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户收藏的公告ID列表（分页）
     * GET /api/favorites/user/{userId}/announcements/page?page=0&size=10
     */
    @GetMapping("/user/{userId}/announcements/page")
    public ResponseEntity<Page<Long>> getUserFavoriteAnnouncementIdsPage(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Long> announcementIds = favoriteService.getUserFavoriteAnnouncementIds(userId, page, size);
            return ResponseEntity.ok(announcementIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取收藏某公告的用户列表
     * GET /api/favorites/announcement/{announcementId}/users
     */
    @GetMapping("/announcement/{announcementId}/users")
    public ResponseEntity<List<Long>> getAnnouncementFavoriteUserIds(@PathVariable Long announcementId) {
        try {
            List<Long> userIds = favoriteService.getAnnouncementFavoriteUserIds(announcementId);
            return ResponseEntity.ok(userIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取公告的收藏数
     * GET /api/favorites/announcement/{announcementId}/count
     */
    @GetMapping("/announcement/{announcementId}/count")
    public ResponseEntity<Long> getAnnouncementFavoriteCount(@PathVariable Long announcementId) {
        try {
            Long count = favoriteService.getAnnouncementFavoriteCount(announcementId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 统计用户的收藏总数
     * GET /api/favorites/user/{userId}/count
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserFavoriteCount(@PathVariable Long userId) {
        try {
            Long count = favoriteService.countUserFavorites(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取最近的收藏记录
     * GET /api/favorites/recent?limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Favorite>> getRecentFavorites(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Favorite> favorites = favoriteService.getRecentFavorites(limit);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户最近的收藏记录
     * GET /api/favorites/user/{userId}/recent?limit=10
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Favorite>> getUserRecentFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Favorite> favorites = favoriteService.getUserRecentFavorites(userId, limit);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取热门收藏公告
     * GET /api/favorites/popular?limit=10
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Object[]>> getPopularAnnouncementsByFavoriteCount(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Object[]> popular = favoriteService.getPopularAnnouncementsByFavoriteCount(limit);
            return ResponseEntity.ok(popular);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取收藏统计信息
     * GET /api/favorites/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getFavoriteStatistics() {
        try {
            List<Object[]> statistics = favoriteService.getFavoriteStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取指定时间段内的收藏记录
     * GET /api/favorites/date-range?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Favorite>> getFavoritesInDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            List<Favorite> favorites = favoriteService.getFavoritesInDateRange(start, end);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 删除收藏记录
     * DELETE /api/favorites?userId=1&announcementId=1
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long announcementId) {
        try {
            favoriteService.removeFavorite(userId, announcementId);
            Long favoriteCount = favoriteService.getAnnouncementFavoriteCount(announcementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorited", false);
            response.put("favoriteCount", favoriteCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 获取收藏详情
     * GET /api/favorites/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Favorite> getFavoriteById(@PathVariable Long id) {
        try {
            Optional<Favorite> favorite = favoriteService.getFavoriteById(id);
            return favorite.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
