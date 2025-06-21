package com.hello.controller;

import com.hello.entity.Comment;
import com.hello.dto.CommentDTO;
import com.hello.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 评论控制器 - 提供RESTful API
 */
@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    /**
     * 创建评论
     * POST /api/comments
     */
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Map<String, Object> request) {
        try {
            Long announcementId = Long.valueOf(request.get("announcementId").toString());
            Long userId = Long.valueOf(request.get("userId").toString());
            String content = request.get("content").toString();
            Long parentId = request.get("parentId") != null ? 
                           Long.valueOf(request.get("parentId").toString()) : null;
            
            Comment comment = commentService.createComment(announcementId, userId, content, parentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 获取公告的评论列表
     * GET /api/comments/announcement/{announcementId}?page=0&size=10&sortBy=time
     */
    @GetMapping("/announcement/{announcementId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsByAnnouncementId(
            @PathVariable Long announcementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "time") String sortBy) {
        try {
            Page<CommentDTO> comments = commentService.getCommentsByAnnouncementId(announcementId, page, size, sortBy);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取评论的回复列表
     * GET /api/comments/{commentId}/replies
     */
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentDTO>> getRepliesByParentId(@PathVariable Long commentId) {
        try {
            List<CommentDTO> replies = commentService.getRepliesByParentId(commentId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取评论详情
     * GET /api/comments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        try {
            Optional<Comment> comment = commentService.getCommentById(id);
            return comment.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 更新评论
     * PUT /api/comments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            String content = request.get("content").toString();
            Long userId = Long.valueOf(request.get("userId").toString());
            
            Comment comment = commentService.updateComment(id, content, userId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 删除评论
     * DELETE /api/comments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            commentService.deleteComment(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * 获取用户的评论列表
     * GET /api/comments/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Comment>> getCommentsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Comment> comments = commentService.getCommentsByUserId(userId, page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 搜索评论
     * GET /api/comments/search?announcementId=1&keyword=关键词&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Comment>> searchComments(
            @RequestParam Long announcementId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Comment> comments = commentService.searchComments(announcementId, keyword, page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取热门评论
     * GET /api/comments/popular/{announcementId}?page=0&size=10
     */
    @GetMapping("/popular/{announcementId}")
    public ResponseEntity<Page<Comment>> getPopularComments(
            @PathVariable Long announcementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Comment> comments = commentService.getPopularComments(announcementId, page, size);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取最新评论
     * GET /api/comments/recent?limit=5
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Comment>> getRecentComments(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<Comment> comments = commentService.getRecentComments(limit);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取评论树形结构
     * GET /api/comments/tree/{announcementId}
     */
    @GetMapping("/tree/{announcementId}")
    public ResponseEntity<List<Comment>> getCommentsWithReplies(@PathVariable Long announcementId) {
        try {
            List<Comment> comments = commentService.getCommentsWithReplies(announcementId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 统计公告评论数
     * GET /api/comments/count/announcement/{announcementId}
     */
    @GetMapping("/count/announcement/{announcementId}")
    public ResponseEntity<Long> countCommentsByAnnouncementId(@PathVariable Long announcementId) {
        try {
            Long count = commentService.countCommentsByAnnouncementId(announcementId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 统计用户评论数
     * GET /api/comments/count/user/{userId}
     */
    @GetMapping("/count/user/{userId}")
    public ResponseEntity<Long> countCommentsByUserId(@PathVariable Long userId) {
        try {
            Long count = commentService.countCommentsByUserId(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
