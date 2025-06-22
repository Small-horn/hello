// 主页面JavaScript
$(document).ready(function() {
    // 等待权限检查完成后初始化
    $(document).on('pageInitialized', function(event, user) {
        init(user);
    });
    
    function init(user) {
        // 更新时间显示
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // 更新用户信息
        updateUserInfo(user);
        
        // 加载最新公告
        loadRecentAnnouncements();
        
        // 如果是管理员，加载系统统计信息
        if (user && user.role === 'ADMIN') {
            loadSystemStatistics();
        }
        
        // 检查是否有重定向URL
        checkRedirectUrl();
    }
    
    function updateDateTime() {
        const now = new Date();
        
        // 更新日期
        const dateStr = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        $('#today-date').text(dateStr);
        
        // 更新时间
        const timeStr = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        $('#current-time').text(timeStr);
        
        // 更新问候语
        updateGreeting(now.getHours());
    }
    
    function updateGreeting(hour) {
        let greeting;
        if (hour < 6) {
            greeting = '夜深了';
        } else if (hour < 9) {
            greeting = '早上好';
        } else if (hour < 12) {
            greeting = '上午好';
        } else if (hour < 14) {
            greeting = '中午好';
        } else if (hour < 18) {
            greeting = '下午好';
        } else if (hour < 22) {
            greeting = '晚上好';
        } else {
            greeting = '夜深了';
        }
        $('#greeting-text').text(greeting);
    }
    
    function updateUserInfo(user) {
        if (user) {
            $('.current-user-name').text(user.realName || user.username);
            $('.current-user-role').text(user.roleDisplayName).removeClass().addClass('role-badge current-user-role ' + user.role.toLowerCase());

            if (user.department) {
                $('.current-user-department').text(' - ' + user.department);
            }

            $('#login-count').text(user.loginCount || 0);

            // 更新侧边栏头像
            if (typeof AvatarUtils !== 'undefined') {
                AvatarUtils.updateSidebarAvatar(user.id);
            }
        } else {
            $('.current-user-name').text('游客');
            $('.current-user-role').text('游客').removeClass().addClass('role-badge current-user-role guest');
            $('#login-count').text('--');

            // 使用默认头像
            if (typeof AvatarUtils !== 'undefined') {
                AvatarUtils.updateSidebarAvatar(null);
            }
        }
    }
    
    function loadRecentAnnouncements() {
        $.ajax({
            url: '/api/announcements/recent',
            method: 'GET',
            data: { limit: 5 },
            success: function(announcements) {
                renderRecentAnnouncements(announcements);
            },
            error: function(xhr, status, error) {
                console.error('加载最新公告失败:', error);
                $('#recent-announcements').html(`
                    <div class="error-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>加载失败</span>
                    </div>
                `);
            }
        });
    }
    
    function renderRecentAnnouncements(announcements) {
        const container = $('#recent-announcements');
        
        if (!announcements || announcements.length === 0) {
            container.html(`
                <div class="empty-placeholder">
                    <i class="fas fa-inbox"></i>
                    <span>暂无公告</span>
                </div>
            `);
            return;
        }
        
        container.empty();
        
        announcements.forEach(function(announcement) {
            const item = $(`
                <div class="announcement-preview-item" data-id="${announcement.id}">
                    <div class="preview-header">
                        <span class="preview-type ${announcement.type.toLowerCase()}">
                            ${getTypeDisplayName(announcement.type)}
                        </span>
                        ${announcement.isImportant ? '<span class="preview-important"><i class="fas fa-star"></i></span>' : ''}
                        <span class="preview-date">${formatDate(announcement.publishTime)}</span>
                    </div>
                    <h4 class="preview-title">${escapeHtml(announcement.title)}</h4>
                    <p class="preview-summary">${escapeHtml(announcement.summary || '')}</p>
                    <div class="preview-footer">
                        <span class="preview-publisher">
                            <i class="fas fa-user"></i>
                            ${escapeHtml(announcement.publisher || '系统')}
                        </span>
                        <span class="preview-views">
                            <i class="fas fa-eye"></i>
                            ${announcement.viewCount}
                        </span>
                    </div>
                </div>
            `);
            
            item.click(function() {
                window.location.href = `announcement-detail.html?id=${announcement.id}`;
            });
            
            container.append(item);
        });
    }
    
    function loadSystemStatistics() {
        // 加载用户统计
        $.ajax({
            url: '/api/users/statistics',
            method: 'GET',
            success: function(data) {
                $('#total-users').text(data.totalUsers || 0);
                $('#active-users').text(data.activeUsers || 0);
            },
            error: function() {
                $('#total-users').text('--');
                $('#active-users').text('--');
            }
        });
        
        // 加载公告统计
        $.ajax({
            url: '/api/announcements/statistics',
            method: 'GET',
            success: function(data) {
                $('#total-announcements').text(data.totalCount || 0);
                
                // 计算已发布的公告数量
                let publishedCount = 0;
                if (data.statusCount) {
                    data.statusCount.forEach(function(item) {
                        if (item[0] === 'PUBLISHED') {
                            publishedCount = item[1];
                        }
                    });
                }
                $('#published-announcements').text(publishedCount);
            },
            error: function() {
                $('#total-announcements').text('--');
                $('#published-announcements').text('--');
            }
        });
    }
    
    function checkRedirectUrl() {
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
            sessionStorage.removeItem('redirectUrl');
            // 延迟跳转，让用户看到欢迎信息
            setTimeout(function() {
                window.location.href = redirectUrl;
            }, 2000);
        }
    }
    
    // 工具函数
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function getTypeDisplayName(type) {
        const typeMap = {
            'ANNOUNCEMENT': '公告',
            'ACTIVITY': '活动'
        };
        return typeMap[type] || type;
    }
});
