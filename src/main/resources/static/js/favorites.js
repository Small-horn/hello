/**
 * 我的收藏页面JavaScript功能
 */

$(document).ready(function() {
    let currentUser = null;
    let currentPage = 0;
    let pageSize = 12;
    let totalPages = 0;
    let totalElements = 0;
    let currentFilter = '';
    let currentSort = 'createdAt';

    console.log('favorites.js 开始加载');

    // 等待权限检查完成后初始化
    $(document).on('pageInitialized', function(event, user) {
        console.log('收到页面初始化事件，用户:', user);
        if (user) {
            currentUser = user;
            console.log('用户已登录:', currentUser.username);
            init();
        } else {
            console.log('用户未登录，页面应该已经被重定向');
        }
    });

    function init() {
        console.log('初始化收藏页面，当前用户:', currentUser);

        // 更新侧边栏头像（传入用户对象，使用预计算的头像路径）
        if (typeof AvatarUtils !== 'undefined') {
            AvatarUtils.updateSidebarAvatar(currentUser);
        }

        // 绑定事件
        bindEvents();

        // 加载收藏数据
        loadFavorites();

        // 加载统计数据
        loadStats();
    }

    function bindEvents() {
        // 筛选控制
        $('#type-filter').change(function() {
            currentFilter = $(this).val();
            currentPage = 0;
            loadFavorites();
        });

        // 排序控制
        $('#sort-select').change(function() {
            currentSort = $(this).val();
            currentPage = 0;
            loadFavorites();
        });

        // 分页控制
        $('#prev-page').click(function() {
            if (currentPage > 0) {
                currentPage--;
                loadFavorites();
            }
        });

        $('#next-page').click(function() {
            if (currentPage < totalPages - 1) {
                currentPage++;
                loadFavorites();
            }
        });

        // 退出登录按钮
        $('#logout-btn').click(function() {
            if (typeof window.AuthUtils !== 'undefined') {
                AuthUtils.logout();
            } else {
                // 如果AuthUtils不可用，直接清除数据并跳转
                sessionStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }

    // 加载收藏列表
    function loadFavorites() {
        showLoading();

        const params = {
            page: currentPage,
            size: pageSize,
            sort: currentSort
        };

        if (currentFilter) {
            params.type = currentFilter;
        }

        $.ajax({
            url: '/api/favorites/user/' + currentUser.id + '/announcements/details',
            method: 'GET',
            data: params,
            success: function(data) {
                hideLoading();
                renderFavorites(data.content);
                updatePagination(data);
            },
            error: function(xhr, status, error) {
                hideLoading();
                console.error('加载收藏列表失败:', error);
                showMessage('加载收藏列表失败，请稍后重试', 'error');
                showEmptyState();
            }
        });
    }

    // 加载统计数据
    function loadStats() {
        $.ajax({
            url: '/api/favorites/user/' + currentUser.id + '/stats',
            method: 'GET',
            success: function(data) {
                $('#total-favorites').text(data.total || 0);
                $('#announcement-favorites').text(data.announcements || 0);
                $('#activity-favorites').text(data.activities || 0);
            },
            error: function(xhr, status, error) {
                console.error('加载统计数据失败:', error);
            }
        });
    }

    // 渲染收藏列表
    function renderFavorites(favorites) {
        const container = $('#favorites-grid');
        container.empty();

        if (!favorites || favorites.length === 0) {
            showEmptyState();
            return;
        }

        hideEmptyState();

        favorites.forEach(function(favorite) {
            const announcement = favorite.announcement;
            if (!announcement) return;

            const card = createFavoriteCard(favorite, announcement);
            container.append(card);
        });

        // 显示分页容器
        $('#pagination-container').show();
    }

    // 创建收藏卡片
    function createFavoriteCard(favorite, announcement) {
        const isImportant = announcement.isImportant;
        const typeClass = announcement.type === 'ACTIVITY' ? 'activity' : 'announcement';
        
        const card = $(`
            <div class="favorite-card ${isImportant ? 'important' : ''} ${typeClass}" data-id="${announcement.id}">
                <div class="favorite-time">
                    收藏于 ${formatDate(favorite.createdAt)}
                </div>
                <div class="favorite-header">
                    <h3 class="favorite-title">${escapeHtml(announcement.title)}</h3>
                    <div class="favorite-meta">
                        <span class="favorite-type ${typeClass}">
                            ${getTypeDisplayName(announcement.type)}
                        </span>
                        <span class="publish-date">${formatDate(announcement.publishTime)}</span>
                    </div>
                </div>
                <div class="favorite-content">
                    <p class="favorite-summary">${escapeHtml(announcement.summary || '')}</p>
                    <div class="favorite-footer">
                        <div class="favorite-stats">
                            <span><i class="fas fa-eye"></i> ${announcement.viewCount}</span>
                            <span><i class="fas fa-thumbs-up"></i> ${announcement.likeCount || 0}</span>
                            <span><i class="fas fa-comments"></i> ${announcement.commentCount || 0}</span>
                            <span><i class="fas fa-star"></i> ${announcement.favoriteCount || 0}</span>
                        </div>
                        <div class="favorite-actions">
                            <button class="action-btn remove-favorite-btn" data-announcement-id="${announcement.id}" data-favorite-id="${favorite.id}">
                                <i class="fas fa-star"></i>
                                取消收藏
                            </button>
                            <button class="action-btn detail-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-eye"></i>
                                查看详情
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // 绑定卡片点击事件（排除按钮区域）
        card.click(function(e) {
            if ($(e.target).closest('.action-btn').length === 0) {
                window.location.href = `announcement-detail.html?id=${announcement.id}`;
            }
        });

        // 绑定取消收藏按钮事件
        card.find('.remove-favorite-btn').click(function(e) {
            e.stopPropagation();
            const announcementId = $(this).data('announcement-id');
            removeFavorite(announcementId, $(this));
        });

        // 绑定查看详情按钮事件
        card.find('.detail-btn').click(function(e) {
            e.stopPropagation();
            const announcementId = $(this).data('announcement-id');
            window.location.href = `announcement-detail.html?id=${announcementId}`;
        });

        return card;
    }

    // 取消收藏
    function removeFavorite(announcementId, button) {
        if (!confirm('确定要取消收藏这个内容吗？')) {
            return;
        }

        $.ajax({
            url: '/api/favorites',
            method: 'DELETE',
            data: {
                userId: currentUser.id,
                announcementId: announcementId
            },
            success: function(data) {
                showMessage('取消收藏成功', 'success');
                // 重新加载当前页面数据
                loadFavorites();
                loadStats();
            },
            error: function(xhr, status, error) {
                console.error('取消收藏失败:', error);
                showMessage('取消收藏失败，请稍后重试', 'error');
            }
        });
    }

    // 更新分页信息
    function updatePagination(pageData) {
        totalPages = pageData.totalPages;
        totalElements = pageData.totalElements;
        currentPage = pageData.number;

        // 更新分页信息文本
        const start = currentPage * pageSize + 1;
        const end = Math.min((currentPage + 1) * pageSize, totalElements);
        $('#pagination-info-text').text(`显示第 ${start}-${end} 条，共 ${totalElements} 条记录`);

        // 更新分页按钮状态
        $('#prev-page').prop('disabled', currentPage === 0);
        $('#next-page').prop('disabled', currentPage >= totalPages - 1);

        // 生成页码按钮
        generatePageNumbers();
    }

    // 生成页码按钮
    function generatePageNumbers() {
        const container = $('#page-numbers');
        container.empty();

        if (totalPages <= 1) return;

        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = $(`
                <button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i + 1}
                </button>
            `);

            pageBtn.click(function() {
                const page = $(this).data('page');
                if (page !== currentPage) {
                    currentPage = page;
                    loadFavorites();
                }
            });

            container.append(pageBtn);
        }
    }

    // 显示加载状态
    function showLoading() {
        $('#loading').show();
        $('#favorites-grid').hide();
        $('#empty-state').hide();
        $('#pagination-container').hide();
    }

    // 隐藏加载状态
    function hideLoading() {
        $('#loading').hide();
        $('#favorites-grid').show();
    }

    // 显示空状态
    function showEmptyState() {
        $('#favorites-grid').hide();
        $('#empty-state').show();
        $('#pagination-container').hide();
    }

    // 隐藏空状态
    function hideEmptyState() {
        $('#empty-state').hide();
    }

    // 工具函数
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getTypeDisplayName(type) {
        switch (type) {
            case 'ANNOUNCEMENT':
                return '公告';
            case 'ACTIVITY':
                return '活动';
            default:
                return '未知';
        }
    }

    function showMessage(message, type = 'info') {
        // 这里可以使用现有的消息提示系统
        console.log(`${type}: ${message}`);
        
        // 简单的消息提示实现
        const messageContainer = $('#message-container');
        const messageElement = $(`
            <div class="message message-${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `);
        
        messageContainer.append(messageElement);
        
        setTimeout(() => {
            messageElement.fadeOut(() => {
                messageElement.remove();
            });
        }, 3000);
    }
});
