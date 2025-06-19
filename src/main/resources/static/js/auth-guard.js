// 权限守卫JavaScript - 用于保护需要登录的页面
$(document).ready(function() {
    // 页面权限配置
    const pagePermissions = {
        'dashboard.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'announcements.html': { requireAuth: false, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'announcement-detail.html': { requireAuth: false, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'announcement-management.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER'] },
        'user-management.html': { requireAuth: true, roles: ['ADMIN'] },
        'about.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'experience.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'skills.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'portfolio.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] },
        'contact.html': { requireAuth: true, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] }
    };
    
    // 初始化权限检查
    initAuthGuard();
    
    function initAuthGuard() {
        const currentPage = getCurrentPageName();
        const pageConfig = pagePermissions[currentPage];
        
        if (!pageConfig) {
            // 未配置的页面默认不需要权限
            return;
        }
        
        // 检查认证状态
        checkAuthentication(pageConfig);
    }
    
    function getCurrentPageName() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        return fileName || 'index.html';
    }
    
    function checkAuthentication(pageConfig) {
        $.ajax({
            url: '/api/auth/current',
            method: 'GET',
            success: function(response) {
                if (response.success && response.authenticated) {
                    const user = response.user;
                    
                    // 检查角色权限
                    if (pageConfig.roles.includes(user.role)) {
                        // 有权限，初始化页面
                        initializePage(user);
                    } else {
                        // 无权限，显示错误页面
                        showAccessDenied();
                    }
                } else {
                    // 未登录
                    if (pageConfig.requireAuth) {
                        // 需要登录，跳转到登录页
                        redirectToLogin();
                    } else {
                        // 不需要登录，以游客身份初始化页面
                        initializePage(null);
                    }
                }
            },
            error: function() {
                // 检查失败
                if (pageConfig.requireAuth) {
                    redirectToLogin();
                } else {
                    initializePage(null);
                }
            }
        });
    }
    
    function initializePage(user) {
        // 保存用户信息到sessionStorage
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        // 更新导航栏
        updateNavigation(user);
        
        // 更新用户信息显示
        updateUserDisplay(user);
        
        // 根据权限显示/隐藏功能
        updatePagePermissions(user);
        
        // 触发页面初始化完成事件
        $(document).trigger('pageInitialized', [user]);
    }
    
    function updateNavigation(user) {
        const sidebar = $('#sidebar');
        if (!sidebar.length) return;
        
        const navLinks = sidebar.find('.nav-links');
        
        if (!user) {
            // 游客模式，只显示公开内容
            navLinks.find('li').each(function() {
                const link = $(this).find('a');
                const href = link.attr('href');
                
                if (href && (href.includes('announcement-management') || href.includes('user-management'))) {
                    $(this).hide();
                }
            });
            return;
        }
        
        // 根据用户角色显示/隐藏导航项
        navLinks.find('li').each(function() {
            const link = $(this).find('a');
            const href = link.attr('href');
            
            if (href) {
                if (href.includes('announcement-management')) {
                    // 公告管理：管理员和教师可见
                    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                } else if (href.includes('user-management')) {
                    // 用户管理：仅管理员可见
                    if (user.role === 'ADMIN') {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                } else {
                    // 其他页面都可见
                    $(this).show();
                }
            }
        });
        
        // 添加注销按钮
        addLogoutButton(sidebar, user);
    }
    
    function addLogoutButton(sidebar, user) {
        // 检查是否已存在注销按钮
        if (sidebar.find('.logout-section').length > 0) {
            return;
        }
        
        const logoutSection = $(`
            <div class="logout-section">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-details">
                        <div class="user-name">${user.realName || user.username}</div>
                        <div class="user-role">${user.roleDisplayName}</div>
                    </div>
                </div>
                <button class="logout-btn" onclick="AuthUtils.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    注销
                </button>
            </div>
        `);
        
        sidebar.append(logoutSection);
    }
    
    function updateUserDisplay(user) {
        // 更新页面中的用户信息显示
        if (user) {
            $('.current-user-name').text(user.realName || user.username);
            $('.current-user-role').text(user.roleDisplayName);
            $('.current-user-department').text(user.department || '');
        }
    }
    
    function updatePagePermissions(user) {
        // 根据用户权限显示/隐藏页面功能
        if (!user) {
            // 游客模式
            $('.admin-only, .teacher-only, .auth-required').hide();
            return;
        }
        
        // 根据角色显示/隐藏功能
        switch (user.role) {
            case 'ADMIN':
                $('.admin-only, .teacher-only, .student-only, .auth-required').show();
                $('.guest-only').hide();
                break;
            case 'TEACHER':
                $('.teacher-only, .auth-required').show();
                $('.admin-only, .guest-only').hide();
                break;
            case 'STUDENT':
                $('.student-only, .auth-required').show();
                $('.admin-only, .teacher-only, .guest-only').hide();
                break;
            case 'GUEST':
                $('.guest-only, .auth-required').show();
                $('.admin-only, .teacher-only, .student-only').hide();
                break;
        }
    }
    
    function redirectToLogin() {
        // 保存当前页面URL，登录后可以跳转回来
        sessionStorage.setItem('redirectUrl', window.location.href);
        window.location.href = 'index.html';
    }
    
    function showAccessDenied() {
        $('body').html(`
            <div class="access-denied">
                <div class="access-denied-content">
                    <div class="access-denied-icon">
                        <i class="fas fa-ban"></i>
                    </div>
                    <h1>访问被拒绝</h1>
                    <p>您没有权限访问此页面</p>
                    <div class="access-denied-actions">
                        <button onclick="history.back()" class="btn btn-secondary">返回上页</button>
                        <button onclick="AuthUtils.logout()" class="btn btn-primary">重新登录</button>
                    </div>
                </div>
            </div>
        `);
    }
    
    // 全局权限检查函数
    window.checkPermission = function(permission, callback) {
        $.ajax({
            url: '/api/auth/check-permission',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ permission: permission }),
            success: function(response) {
                callback(response.hasPermission);
            },
            error: function() {
                callback(false);
            }
        });
    };
    
    // 页面权限装饰器
    window.requireAuth = function(callback) {
        const user = AuthUtils.getCurrentUser();
        if (user) {
            callback(user);
        } else {
            redirectToLogin();
        }
    };
    
    window.requireRole = function(roles, callback) {
        const user = AuthUtils.getCurrentUser();
        if (user && roles.includes(user.role)) {
            callback(user);
        } else {
            showAccessDenied();
        }
    };
});
