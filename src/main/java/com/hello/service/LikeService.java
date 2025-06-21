package com.hello.service;

import com.hello.entity.Like;
import com.hello.entity.Announcement;
import com.hello.entity.Comment;
import com.hello.repository.LikeRepository;
import com.hello.repository.AnnouncementRepository;
import com.hello.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 点赞服务层
 */
@Service
@Transactional
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private AnnouncementRepository announcementRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    /**
     * 点赞或取消点赞
     */
    public boolean toggleLike(Long userId, Like.TargetType targetType, Long targetId) {
        Optional<Like> existingLike = likeRepository.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
        
        if (existingLike.isPresent()) {
            // 取消点赞
            likeRepository.delete(existingLike.get());
            updateTargetLikeCount(targetType, targetId, -1);
            return false;
        } else {
            // 添加点赞
            Like like = new Like(userId, targetType, targetId);
            likeRepository.save(like);
            updateTargetLikeCount(targetType, targetId, 1);
            return true;
        }
    }
    
    /**
     * 点赞公告
     */
    public boolean likeAnnouncement(Long userId, Long announcementId) {
        return toggleLike(userId, Like.TargetType.ANNOUNCEMENT, announcementId);
    }
    
    /**
     * 点赞评论
     */
    public boolean likeComment(Long userId, Long commentId) {
        return toggleLike(userId, Like.TargetType.COMMENT, commentId);
    }
    
    /**
     * 检查用户是否已点赞
     */
    public boolean isLiked(Long userId, Like.TargetType targetType, Long targetId) {
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }
    
    /**
     * 检查用户是否已点赞公告
     */
    public boolean isAnnouncementLiked(Long userId, Long announcementId) {
        return isLiked(userId, Like.TargetType.ANNOUNCEMENT, announcementId);
    }
    
    /**
     * 检查用户是否已点赞评论
     */
    public boolean isCommentLiked(Long userId, Long commentId) {
        return isLiked(userId, Like.TargetType.COMMENT, commentId);
    }
    
    /**
     * 获取目标的点赞数
     */
    public Long getLikeCount(Like.TargetType targetType, Long targetId) {
        return likeRepository.countByTargetTypeAndTargetId(targetType, targetId);
    }
    
    /**
     * 获取公告的点赞数
     */
    public Long getAnnouncementLikeCount(Long announcementId) {
        return getLikeCount(Like.TargetType.ANNOUNCEMENT, announcementId);
    }
    
    /**
     * 获取评论的点赞数
     */
    public Long getCommentLikeCount(Long commentId) {
        return getLikeCount(Like.TargetType.COMMENT, commentId);
    }
    
    /**
     * 获取用户的点赞记录
     */
    public Page<Like> getUserLikes(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return likeRepository.findByUserId(userId, pageable);
    }
    
    /**
     * 获取用户点赞的公告列表
     */
    public List<Long> getUserLikedAnnouncementIds(Long userId) {
        return likeRepository.findLikedAnnouncementIdsByUserId(userId);
    }
    
    /**
     * 获取用户点赞的评论列表
     */
    public List<Long> getUserLikedCommentIds(Long userId) {
        return likeRepository.findLikedCommentIdsByUserId(userId);
    }
    
    /**
     * 获取点赞某公告的用户列表
     */
    public List<Long> getAnnouncementLikedUserIds(Long announcementId) {
        return likeRepository.findUserIdsByAnnouncementId(announcementId);
    }
    
    /**
     * 获取点赞某评论的用户列表
     */
    public List<Long> getCommentLikedUserIds(Long commentId) {
        return likeRepository.findUserIdsByCommentId(commentId);
    }
    
    /**
     * 统计用户的点赞总数
     */
    public Long countUserLikes(Long userId) {
        return likeRepository.countByUserId(userId);
    }
    
    /**
     * 统计用户对公告的点赞数
     */
    public Long countUserAnnouncementLikes(Long userId) {
        return likeRepository.countAnnouncementLikesByUserId(userId);
    }
    
    /**
     * 统计用户对评论的点赞数
     */
    public Long countUserCommentLikes(Long userId) {
        return likeRepository.countCommentLikesByUserId(userId);
    }
    
    /**
     * 获取最近的点赞记录
     */
    public List<Like> getRecentLikes(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return likeRepository.findRecentLikes(pageable);
    }
    
    /**
     * 批量检查用户对多个目标的点赞状态
     */
    public List<Like> getUserLikesForTargets(Long userId, Like.TargetType targetType, List<Long> targetIds) {
        return likeRepository.findByUserIdAndTargetTypeAndTargetIdIn(userId, targetType, targetIds);
    }
    
    /**
     * 获取点赞统计信息
     */
    public List<Object[]> getLikeStatistics() {
        return likeRepository.countByTargetType();
    }
    
    /**
     * 更新目标的点赞数
     */
    private void updateTargetLikeCount(Like.TargetType targetType, Long targetId, int delta) {
        if (targetType == Like.TargetType.ANNOUNCEMENT) {
            Optional<Announcement> announcement = announcementRepository.findById(targetId);
            if (announcement.isPresent()) {
                Announcement ann = announcement.get();
                int newCount = Math.max(0, ann.getLikeCount() + delta);
                ann.setLikeCount(newCount);
                announcementRepository.save(ann);
            }
        } else if (targetType == Like.TargetType.COMMENT) {
            Optional<Comment> comment = commentRepository.findById(targetId);
            if (comment.isPresent()) {
                Comment comm = comment.get();
                int newCount = Math.max(0, comm.getLikeCount() + delta);
                comm.setLikeCount(newCount);
                commentRepository.save(comm);
            }
        }
    }
}
