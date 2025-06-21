package com.hello.controller;

import com.hello.entity.Like;
import com.hello.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 点赞控制器 - 提供RESTful API
 */
@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    /**
     * 点赞或取消点赞公告
     * POST /api/likes/announcement
     */
    @PostMapping("/announcement")
    public ResponseEntity<Map<String, Object>> toggleAnnouncementLike(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long announcementId = Long.valueOf(request.get("announcementId").toString());
            
            boolean isLiked = likeService.likeAnnouncement(userId, announcementId);
            Long likeCount = likeService.getAnnouncementLikeCount(announcementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isLiked", isLiked);
            response.put("likeCount", likeCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 点赞或取消点赞评论
     * POST /api/likes/comment
     */
    @PostMapping("/comment")
    public ResponseEntity<Map<String, Object>> toggleCommentLike(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long commentId = Long.valueOf(request.get("commentId").toString());
            
            boolean isLiked = likeService.likeComment(userId, commentId);
            Long likeCount = likeService.getCommentLikeCount(commentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isLiked", isLiked);
            response.put("likeCount", likeCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 检查用户是否已点赞公告
     * GET /api/likes/announcement/{announcementId}/status?userId=1
     */
    @GetMapping("/announcement/{announcementId}/status")
    public ResponseEntity<Map<String, Object>> getAnnouncementLikeStatus(
            @PathVariable Long announcementId,
            @RequestParam Long userId) {
        try {
            boolean isLiked = likeService.isAnnouncementLiked(userId, announcementId);
            Long likeCount = likeService.getAnnouncementLikeCount(announcementId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isLiked", isLiked);
            response.put("likeCount", likeCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 检查用户是否已点赞评论
     * GET /api/likes/comment/{commentId}/status?userId=1
     */
    @GetMapping("/comment/{commentId}/status")
    public ResponseEntity<Map<String, Object>> getCommentLikeStatus(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        try {
            boolean isLiked = likeService.isCommentLiked(userId, commentId);
            Long likeCount = likeService.getCommentLikeCount(commentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isLiked", isLiked);
            response.put("likeCount", likeCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取公告的点赞数
     * GET /api/likes/announcement/{announcementId}/count
     */
    @GetMapping("/announcement/{announcementId}/count")
    public ResponseEntity<Long> getAnnouncementLikeCount(@PathVariable Long announcementId) {
        try {
            Long count = likeService.getAnnouncementLikeCount(announcementId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取评论的点赞数
     * GET /api/likes/comment/{commentId}/count
     */
    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<Long> getCommentLikeCount(@PathVariable Long commentId) {
        try {
            Long count = likeService.getCommentLikeCount(commentId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户的点赞记录
     * GET /api/likes/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Like>> getUserLikes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Like> likes = likeService.getUserLikes(userId, page, size);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户点赞的公告列表
     * GET /api/likes/user/{userId}/announcements
     */
    @GetMapping("/user/{userId}/announcements")
    public ResponseEntity<List<Long>> getUserLikedAnnouncementIds(@PathVariable Long userId) {
        try {
            List<Long> announcementIds = likeService.getUserLikedAnnouncementIds(userId);
            return ResponseEntity.ok(announcementIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取用户点赞的评论列表
     * GET /api/likes/user/{userId}/comments
     */
    @GetMapping("/user/{userId}/comments")
    public ResponseEntity<List<Long>> getUserLikedCommentIds(@PathVariable Long userId) {
        try {
            List<Long> commentIds = likeService.getUserLikedCommentIds(userId);
            return ResponseEntity.ok(commentIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取点赞某公告的用户列表
     * GET /api/likes/announcement/{announcementId}/users
     */
    @GetMapping("/announcement/{announcementId}/users")
    public ResponseEntity<List<Long>> getAnnouncementLikedUserIds(@PathVariable Long announcementId) {
        try {
            List<Long> userIds = likeService.getAnnouncementLikedUserIds(announcementId);
            return ResponseEntity.ok(userIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取点赞某评论的用户列表
     * GET /api/likes/comment/{commentId}/users
     */
    @GetMapping("/comment/{commentId}/users")
    public ResponseEntity<List<Long>> getCommentLikedUserIds(@PathVariable Long commentId) {
        try {
            List<Long> userIds = likeService.getCommentLikedUserIds(commentId);
            return ResponseEntity.ok(userIds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 统计用户的点赞总数
     * GET /api/likes/user/{userId}/count
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> getUserLikeCount(@PathVariable Long userId) {
        try {
            Long totalCount = likeService.countUserLikes(userId);
            Long announcementCount = likeService.countUserAnnouncementLikes(userId);
            Long commentCount = likeService.countUserCommentLikes(userId);
            
            Map<String, Long> response = new HashMap<>();
            response.put("total", totalCount);
            response.put("announcements", announcementCount);
            response.put("comments", commentCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取最近的点赞记录
     * GET /api/likes/recent?limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Like>> getRecentLikes(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Like> likes = likeService.getRecentLikes(limit);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取点赞统计信息
     * GET /api/likes/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getLikeStatistics() {
        try {
            List<Object[]> statistics = likeService.getLikeStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
