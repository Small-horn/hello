package com.hello.repository;

import com.hello.entity.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 点赞数据访问层
 */
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    /**
     * 查找用户对特定目标的点赞记录
     */
    Optional<Like> findByUserIdAndTargetTypeAndTargetId(Long userId, Like.TargetType targetType, Long targetId);
    
    /**
     * 检查用户是否已点赞
     */
    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, Like.TargetType targetType, Long targetId);
    
    /**
     * 统计目标的点赞数量
     */
    @Query("SELECT COUNT(l) FROM Like l WHERE l.targetType = :targetType AND l.targetId = :targetId")
    Long countByTargetTypeAndTargetId(@Param("targetType") Like.TargetType targetType, @Param("targetId") Long targetId);
    
    /**
     * 根据目标类型和ID查找所有点赞记录
     */
    List<Like> findByTargetTypeAndTargetId(Like.TargetType targetType, Long targetId);
    
    /**
     * 根据用户ID查找点赞记录（分页）
     */
    Page<Like> findByUserId(Long userId, Pageable pageable);
    
    /**
     * 根据用户ID和目标类型查找点赞记录
     */
    Page<Like> findByUserIdAndTargetType(Long userId, Like.TargetType targetType, Pageable pageable);
    
    /**
     * 删除用户对特定目标的点赞
     */
    void deleteByUserIdAndTargetTypeAndTargetId(Long userId, Like.TargetType targetType, Long targetId);
    
    /**
     * 查找用户点赞的公告ID列表
     */
    @Query("SELECT l.targetId FROM Like l WHERE l.userId = :userId AND l.targetType = 'ANNOUNCEMENT'")
    List<Long> findLikedAnnouncementIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 查找用户点赞的评论ID列表
     */
    @Query("SELECT l.targetId FROM Like l WHERE l.userId = :userId AND l.targetType = 'COMMENT'")
    List<Long> findLikedCommentIdsByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户的点赞总数
     */
    @Query("SELECT COUNT(l) FROM Like l WHERE l.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户对公告的点赞数
     */
    @Query("SELECT COUNT(l) FROM Like l WHERE l.userId = :userId AND l.targetType = 'ANNOUNCEMENT'")
    Long countAnnouncementLikesByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户对评论的点赞数
     */
    @Query("SELECT COUNT(l) FROM Like l WHERE l.userId = :userId AND l.targetType = 'COMMENT'")
    Long countCommentLikesByUserId(@Param("userId") Long userId);
    
    /**
     * 查找最近的点赞记录
     */
    @Query("SELECT l FROM Like l ORDER BY l.createdAt DESC")
    List<Like> findRecentLikes(Pageable pageable);
    
    /**
     * 查找特定公告的点赞用户列表
     */
    @Query("SELECT l.userId FROM Like l WHERE l.targetType = 'ANNOUNCEMENT' AND l.targetId = :announcementId")
    List<Long> findUserIdsByAnnouncementId(@Param("announcementId") Long announcementId);
    
    /**
     * 查找特定评论的点赞用户列表
     */
    @Query("SELECT l.userId FROM Like l WHERE l.targetType = 'COMMENT' AND l.targetId = :commentId")
    List<Long> findUserIdsByCommentId(@Param("commentId") Long commentId);
    
    /**
     * 批量查询用户对多个目标的点赞状态
     */
    @Query("SELECT l FROM Like l WHERE l.userId = :userId AND l.targetType = :targetType AND l.targetId IN :targetIds")
    List<Like> findByUserIdAndTargetTypeAndTargetIdIn(@Param("userId") Long userId, 
                                                      @Param("targetType") Like.TargetType targetType, 
                                                      @Param("targetIds") List<Long> targetIds);
    
    /**
     * 统计各类型目标的点赞数量
     */
    @Query("SELECT l.targetType, COUNT(l) FROM Like l GROUP BY l.targetType")
    List<Object[]> countByTargetType();
}
