package com.hello.service;

import com.hello.entity.User;
import com.hello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 认证服务类
 */
@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 用户登录
     */
    public LoginResult login(String username, String password) {
        try {
            // 查找用户
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (!userOpt.isPresent()) {
                return new LoginResult(false, "用户名不存在", null);
            }
            
            User user = userOpt.get();
            
            // 检查用户状态
            if (!user.isActive()) {
                String message = getStatusMessage(user.getStatus());
                return new LoginResult(false, message, null);
            }
            
            // 验证密码（这里简化处理，实际应该使用BCrypt等加密）
            if (!verifyPassword(password, user.getPassword())) {
                return new LoginResult(false, "密码错误", null);
            }
            
            // 更新登录信息
            // 确保loginCount不为null
            if (user.getLoginCount() == null) {
                user.setLoginCount(0);
            }
            user.incrementLoginCount();
            userRepository.save(user);
            
            return new LoginResult(true, "登录成功", user);
            
        } catch (Exception e) {
            return new LoginResult(false, "登录失败：" + e.getMessage(), null);
        }
    }
    
    /**
     * 验证密码
     */
    private boolean verifyPassword(String rawPassword, String encodedPassword) {
        // 简化处理，直接比较明文密码（仅用于演示）
        // 实际项目中应该使用BCrypt等加密算法
        return rawPassword.equals(encodedPassword);
    }
    
    /**
     * 获取用户状态对应的消息
     */
    private String getStatusMessage(User.UserStatus status) {
        switch (status) {
            case INACTIVE:
                return "账户已被禁用，请联系管理员";
            case PENDING:
                return "账户待审核，请等待管理员审核";
            case LOCKED:
                return "账户已被锁定，请联系管理员";
            default:
                return "账户状态异常";
        }
    }
    
    /**
     * 检查用户权限
     */
    public boolean hasPermission(User user, String permission) {
        if (user == null || !user.isActive()) {
            return false;
        }
        
        // 管理员拥有所有权限
        if (user.isAdmin()) {
            return true;
        }
        
        // 根据权限类型和用户角色判断
        switch (permission) {
            case "ANNOUNCEMENT_MANAGE":
                return user.isAdmin() || user.isTeacher();
            case "ANNOUNCEMENT_VIEW":
                return true; // 所有用户都可以查看公告
            case "USER_MANAGE":
                return user.isAdmin();
            case "USER_VIEW":
                return user.isAdmin() || user.isTeacher();
            default:
                return false;
        }
    }
    
    /**
     * 检查用户是否可以访问指定页面
     */
    public boolean canAccessPage(User user, String page) {
        if (user == null) {
            return page.equals("login") || page.equals("announcements");
        }
        
        if (!user.isActive()) {
            return page.equals("login");
        }
        
        switch (page) {
            case "announcement-management":
                return user.isAdmin() || user.isTeacher();
            case "user-management":
                return user.isAdmin();
            case "announcements":
            case "announcement-detail":
            case "dashboard":
                return true;
            default:
                return true;
        }
    }
    
    /**
     * 根据用户名获取用户信息
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * 更新用户最后登录时间
     */
    public void updateLastLoginTime(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginTime(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    /**
     * 登录结果类
     */
    public static class LoginResult {
        private boolean success;
        private String message;
        private User user;
        
        public LoginResult(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public User getUser() { return user; }
    }
}
