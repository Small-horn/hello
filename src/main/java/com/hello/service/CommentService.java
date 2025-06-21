package com.hello.service;

import com.hello.entity.Comment;
import com.hello.entity.Announcement;
import com.hello.entity.User;
import com.hello.dto.CommentDTO;
import com.hello.repository.CommentRepository;
import com.hello.repository.AnnouncementRepository;
import com.hello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 评论服务层
 */
@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;
    
    /**
     * 创建评论
     */
    public Comment createComment(Long announcementId, Long userId, String content, Long parentId) {
        // 验证公告是否存在
        Optional<Announcement> announcement = announcementRepository.findById(announcementId);
        if (announcement.isEmpty()) {
            throw new RuntimeException("公告不存在，ID: " + announcementId);
        }
        
        // 如果是回复，验证父评论是否存在
        if (parentId != null) {
            Optional<Comment> parentComment = commentRepository.findById(parentId);
            if (parentComment.isEmpty()) {
                throw new RuntimeException("父评论不存在，ID: " + parentId);
            }
        }
        
        Comment comment = new Comment(announcementId, userId, content);
        if (parentId != null) {
            comment.setParentId(parentId);
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        // 更新公告评论数
        updateAnnouncementCommentCount(announcementId);
        
        // 如果是回复，更新父评论回复数
        if (parentId != null) {
            updateCommentReplyCount(parentId);
        }
        
        return savedComment;
    }
    
    /**
     * 获取公告的评论列表（分页）
     */
    public Page<CommentDTO> getCommentsByAnnouncementId(Long announcementId, int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("likes".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "likeCount").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Comment> comments = commentRepository.findTopLevelCommentsByAnnouncementId(announcementId, pageable);

        // 转换为CommentDTO并添加用户信息
        List<CommentDTO> commentDTOs = comments.getContent().stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(commentDTOs, pageable, comments.getTotalElements());
    }
    
    /**
     * 获取评论的回复列表
     */
    public List<CommentDTO> getRepliesByParentId(Long parentId) {
        List<Comment> replies = commentRepository.findRepliesByParentId(parentId);
        return replies.stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());
    }

    /**
     * 转换Comment实体为CommentDTO
     */
    private CommentDTO convertToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setAnnouncementId(comment.getAnnouncementId());
        dto.setUserId(comment.getUserId());
        dto.setParentId(comment.getParentId());
        dto.setContent(comment.getContent());
        dto.setLikeCount(comment.getLikeCount());
        dto.setReplyCount(comment.getReplyCount());
        dto.setIsDeleted(comment.getIsDeleted());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        // 获取用户信息
        if (comment.getUserId() != null) {
            Optional<User> user = userRepository.findById(comment.getUserId());
            if (user.isPresent()) {
                dto.setUsername(user.get().getUsername());
                dto.setRealName(user.get().getRealName());
            }
        }

        return dto;
    }
    
    /**
     * 获取评论详情
     */
    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }
    
    /**
     * 更新评论内容
     */
    public Comment updateComment(Long id, String content, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在，ID: " + id));
        
        // 验证用户权限
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改此评论");
        }
        
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }
    
    /**
     * 删除评论（软删除）
     */
    public void deleteComment(Long id, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在，ID: " + id));
        
        // 验证用户权限
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除此评论");
        }
        
        comment.markAsDeleted();
        commentRepository.save(comment);
        
        // 更新公告评论数
        updateAnnouncementCommentCount(comment.getAnnouncementId());
        
        // 如果是回复，更新父评论回复数
        if (comment.getParentId() != null) {
            updateCommentReplyCount(comment.getParentId());
        }
    }
    
    /**
     * 获取用户的评论列表
     */
    public Page<Comment> getCommentsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return commentRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
    }
    
    /**
     * 搜索评论
     */
    public Page<Comment> searchComments(Long announcementId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return commentRepository.searchCommentsByKeyword(announcementId, keyword, pageable);
    }
    
    /**
     * 获取热门评论
     */
    public Page<Comment> getPopularComments(Long announcementId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findPopularCommentsByAnnouncementId(announcementId, pageable);
    }
    
    /**
     * 获取最新评论
     */
    public List<Comment> getRecentComments(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return commentRepository.findRecentComments(pageable);
    }
    
    /**
     * 获取评论树形结构
     */
    public List<Comment> getCommentsWithReplies(Long announcementId) {
        return commentRepository.findCommentsWithRepliesByAnnouncementId(announcementId);
    }
    
    /**
     * 统计公告评论数
     */
    public Long countCommentsByAnnouncementId(Long announcementId) {
        return commentRepository.countByAnnouncementId(announcementId);
    }
    
    /**
     * 统计用户评论数
     */
    public Long countCommentsByUserId(Long userId) {
        return commentRepository.countByUserId(userId);
    }
    
    /**
     * 更新公告评论数
     */
    private void updateAnnouncementCommentCount(Long announcementId) {
        Long count = commentRepository.countByAnnouncementId(announcementId);
        Optional<Announcement> announcement = announcementRepository.findById(announcementId);
        if (announcement.isPresent()) {
            Announcement ann = announcement.get();
            ann.setCommentCount(count.intValue());
            announcementRepository.save(ann);
        }
    }
    
    /**
     * 更新评论回复数
     */
    private void updateCommentReplyCount(Long parentId) {
        Long count = commentRepository.countRepliesByParentId(parentId);
        Optional<Comment> parentComment = commentRepository.findById(parentId);
        if (parentComment.isPresent()) {
            Comment parent = parentComment.get();
            parent.setReplyCount(count.intValue());
            commentRepository.save(parent);
        }
    }
}
