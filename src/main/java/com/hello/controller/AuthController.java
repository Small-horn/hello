package com.hello.controller;

import com.hello.entity.User;
import com.hello.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * 用户登录
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest loginRequest,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            AuthService.LoginResult result = authService.login(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            );
            
            if (result.isSuccess()) {
                User user = result.getUser();
                
                // 将用户信息存储到session中
                session.setAttribute("currentUser", user);
                session.setAttribute("userId", user.getId());
                session.setAttribute("username", user.getUsername());
                session.setAttribute("userRole", user.getRole().name());
                
                // 返回用户信息（不包含密码）
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("email", user.getEmail());
                userInfo.put("realName", user.getRealName());
                userInfo.put("role", user.getRole().name());
                userInfo.put("roleDisplayName", user.getRole().getDisplayName());
                userInfo.put("department", user.getDepartment());
                userInfo.put("studentId", user.getStudentId());
                userInfo.put("loginCount", user.getLoginCount());
                userInfo.put("lastLoginTime", user.getLastLoginTime());
                
                response.put("success", true);
                response.put("message", result.getMessage());
                response.put("user", userInfo);
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", result.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "登录失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 用户注销
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 清除session
            session.invalidate();
            
            response.put("success", true);
            response.put("message", "注销成功");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "注销失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 获取当前用户信息
     * GET /api/auth/current
     */
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("currentUser");
            
            if (currentUser != null) {
                // 从数据库获取最新的用户信息
                Optional<User> userOpt = authService.getUserByUsername(currentUser.getUsername());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("username", user.getUsername());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("realName", user.getRealName());
                    userInfo.put("role", user.getRole().name());
                    userInfo.put("roleDisplayName", user.getRole().getDisplayName());
                    userInfo.put("department", user.getDepartment());
                    userInfo.put("studentId", user.getStudentId());
                    userInfo.put("loginCount", user.getLoginCount());
                    userInfo.put("lastLoginTime", user.getLastLoginTime());
                    
                    response.put("success", true);
                    response.put("user", userInfo);
                    response.put("authenticated", true);
                } else {
                    response.put("success", false);
                    response.put("message", "用户不存在");
                    response.put("authenticated", false);
                }
            } else {
                response.put("success", false);
                response.put("message", "未登录");
                response.put("authenticated", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取用户信息失败：" + e.getMessage());
            response.put("authenticated", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 检查权限
     * POST /api/auth/check-permission
     */
    @PostMapping("/check-permission")
    public ResponseEntity<Map<String, Object>> checkPermission(
            @RequestBody PermissionRequest permissionRequest,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("currentUser");
            boolean hasPermission = authService.hasPermission(currentUser, permissionRequest.getPermission());
            
            response.put("success", true);
            response.put("hasPermission", hasPermission);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "权限检查失败：" + e.getMessage());
            response.put("hasPermission", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 检查页面访问权限
     * POST /api/auth/check-page-access
     */
    @PostMapping("/check-page-access")
    public ResponseEntity<Map<String, Object>> checkPageAccess(
            @RequestBody PageAccessRequest pageAccessRequest,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = (User) session.getAttribute("currentUser");
            boolean canAccess = authService.canAccessPage(currentUser, pageAccessRequest.getPage());
            
            response.put("success", true);
            response.put("canAccess", canAccess);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "页面访问权限检查失败：" + e.getMessage());
            response.put("canAccess", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // 请求类
    public static class LoginRequest {
        private String username;
        private String password;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class PermissionRequest {
        private String permission;
        
        // Getters and Setters
        public String getPermission() { return permission; }
        public void setPermission(String permission) { this.permission = permission; }
    }
    
    public static class PageAccessRequest {
        private String page;

        // Getters and Setters
        public String getPage() { return page; }
        public void setPage(String page) { this.page = page; }
    }

    /**
     * 修复数据库中的null值问题
     * GET /api/auth/fix-database
     */
    @GetMapping("/fix-database")
    public ResponseEntity<Map<String, Object>> fixDatabase() {
        Map<String, Object> response = new HashMap<>();

        try {
            // 这里可以添加修复逻辑，但为了安全起见，我们只返回提示信息
            response.put("success", true);
            response.put("message", "请在MySQL中执行: UPDATE users SET login_count = 0 WHERE login_count IS NULL;");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "修复失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
