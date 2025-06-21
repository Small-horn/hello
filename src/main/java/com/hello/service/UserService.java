package com.hello.service;

import com.hello.entity.User;
import com.hello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用户服务层
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 获取所有用户
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * 根据ID获取用户
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * 根据用户名获取用户
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * 根据邮箱获取用户
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * 创建用户
     */
    public User createUser(User user) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在: " + user.getUsername());
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已存在: " + user.getEmail());
        }
        
        return userRepository.save(user);
    }
    
    /**
     * 更新用户
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在，ID: " + id));

        // 检查用户名是否被其他用户使用
        if (!user.getUsername().equals(userDetails.getUsername()) &&
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("用户名已存在: " + userDetails.getUsername());
        }

        // 检查邮箱是否被其他用户使用
        if (!user.getEmail().equals(userDetails.getEmail()) &&
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("邮箱已存在: " + userDetails.getEmail());
        }

        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setDescription(userDetails.getDescription());

        // 如果提供了角色和状态，也更新它们
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        if (userDetails.getStatus() != null) {
            user.setStatus(userDetails.getStatus());
        }
        if (userDetails.getRealName() != null) {
            user.setRealName(userDetails.getRealName());
        }
        if (userDetails.getStudentId() != null) {
            user.setStudentId(userDetails.getStudentId());
        }
        if (userDetails.getDepartment() != null) {
            user.setDepartment(userDetails.getDepartment());
        }
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }

        return userRepository.save(user);
    }

    /**
     * 更新用户状态
     */
    public User updateUserStatus(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在，ID: " + id));

        user.setStatus(status);
        return userRepository.save(user);
    }
    
    /**
     * 删除用户
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在，ID: " + id));
        userRepository.delete(user);
    }
    
    /**
     * 根据用户名模糊搜索
     */
    public List<User> searchUsersByUsername(String username) {
        return userRepository.findByUsernameContaining(username);
    }

    /**
     * 综合搜索用户（支持关键词、角色、状态筛选）
     */
    public List<User> searchUsers(String keyword, User.UserRole role, User.UserStatus status) {
        List<User> allUsers = userRepository.findAll();

        return allUsers.stream()
                .filter(user -> {
                    // 关键词搜索（用户名、真实姓名、邮箱、学号）
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String lowerKeyword = keyword.toLowerCase();
                        boolean matchesKeyword =
                            (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerKeyword)) ||
                            (user.getRealName() != null && user.getRealName().toLowerCase().contains(lowerKeyword)) ||
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword)) ||
                            (user.getStudentId() != null && user.getStudentId().toLowerCase().contains(lowerKeyword)) ||
                            (user.getDepartment() != null && user.getDepartment().toLowerCase().contains(lowerKeyword));

                        if (!matchesKeyword) {
                            return false;
                        }
                    }

                    // 角色筛选
                    if (role != null && !user.getRole().equals(role)) {
                        return false;
                    }

                    // 状态筛选
                    if (status != null && !user.getStatus().equals(status)) {
                        return false;
                    }

                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * 检查用户名是否可用
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    /**
     * 检查邮箱是否可用
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * 获取用户统计信息
     */
    public Map<String, Object> getUserStatistics() {
        List<User> allUsers = userRepository.findAll();
        Map<String, Object> statistics = new HashMap<>();

        // 总用户数
        statistics.put("totalUsers", allUsers.size());

        // 按角色统计
        Map<String, Long> roleStats = allUsers.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    user -> user.getRole().name(),
                    java.util.stream.Collectors.counting()
                ));
        statistics.put("roleStats", roleStats);

        // 按状态统计
        Map<String, Long> statusStats = allUsers.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    user -> user.getStatus().name(),
                    java.util.stream.Collectors.counting()
                ));
        statistics.put("statusStats", statusStats);

        // 活跃用户数（状态为ACTIVE）
        long activeUsers = allUsers.stream()
                .filter(user -> user.getStatus() == User.UserStatus.ACTIVE)
                .count();
        statistics.put("activeUsers", activeUsers);

        // 最近登录用户数（最近30天内登录过的用户）
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        long recentLoginUsers = allUsers.stream()
                .filter(user -> user.getLastLoginTime() != null &&
                               user.getLastLoginTime().isAfter(thirtyDaysAgo))
                .count();
        statistics.put("recentLoginUsers", recentLoginUsers);

        return statistics;
    }
}
