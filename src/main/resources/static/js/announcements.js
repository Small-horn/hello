// 公告列表页面JavaScript
$(document).ready(function() {
    // 全局变量
    let currentPage = 0;
    let pageSize = 10;
    let currentType = '';
    let currentImportance = '';
    let currentKeyword = '';
    let currentSort = 'publishTime';
    let currentUser = null;
    
    // 初始化页面
    init();
    
    function init() {
        // 从URL参数获取类型
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');

        if (typeParam === 'activity') {
            currentType = 'ACTIVITY';
            $('#type-filter').val('ACTIVITY');
            $('#page-title-text').text('校园活动');
            $('#section-title-text').text('所有活动');
            updateActiveNavigation('activity');
        }

        // 获取当前用户信息
        currentUser = getCurrentUser();
        console.log('当前用户:', currentUser);

        // 更新侧边栏头像（传入用户对象，使用预计算的头像路径）
        if (typeof AvatarUtils !== 'undefined') {
            AvatarUtils.updateSidebarAvatar(currentUser);
        }

        // 绑定事件
        bindEvents();

        // 加载数据
        loadImportantAnnouncements();
        loadAnnouncements();
    }
    
    function bindEvents() {
        // 筛选器事件
        $('#type-filter').change(function() {
            currentType = $(this).val();
            currentPage = 0;
            loadAnnouncements();
        });
        
        $('#importance-filter').change(function() {
            currentImportance = $(this).val();
            currentPage = 0;
            loadAnnouncements();
        });
        
        $('#sort-select').change(function() {
            currentSort = $(this).val();
            currentPage = 0;
            loadAnnouncements();
        });
        
        // 搜索事件
        $('#search-btn').click(function() {
            performSearch();
        });
        
        $('#search-input').keypress(function(e) {
            if (e.which === 13) {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        currentKeyword = $('#search-input').val().trim();
        currentPage = 0;
        loadAnnouncements();
    }
    
    function loadImportantAnnouncements() {
        $.ajax({
            url: '/api/announcements/important',
            method: 'GET',
            success: function(data) {
                renderImportantAnnouncements(data);
            },
            error: function(xhr, status, error) {
                console.error('加载重要公告失败:', error);
                $('#important-section').hide();
            }
        });
    }
    
    function loadAnnouncements() {
        showLoading();
        
        let url = '/api/announcements/published';
        let params = {
            page: currentPage,
            size: pageSize
        };
        
        // 添加筛选参数
        if (currentType) {
            url = `/api/announcements/published/type/${currentType}`;
        }
        
        if (currentKeyword) {
            url = '/api/announcements/search';
            params.keyword = currentKeyword;
        }
        
        $.ajax({
            url: url,
            method: 'GET',
            data: params,
            success: function(data) {
                hideLoading();
                renderAnnouncements(data);
                renderPagination(data);
            },
            error: function(xhr, status, error) {
                hideLoading();
                showError('加载公告失败，请稍后重试');
                console.error('加载公告失败:', error);
            }
        });
    }
    
    function renderImportantAnnouncements(announcements) {
        const container = $('#important-announcements');
        
        if (!announcements || announcements.length === 0) {
            $('#important-section').hide();
            return;
        }
        
        container.empty();
        
        announcements.slice(0, 3).forEach(function(announcement) {
            const item = $(`
                <div class="important-announcement" data-id="${announcement.id}">
                    <h4>${escapeHtml(announcement.title)}</h4>
                    <p>${escapeHtml(announcement.summary || '')}</p>
                    <div class="meta">
                        <span class="type">${getTypeDisplayName(announcement.type)}</span>
                        <span class="date">${formatDate(announcement.publishTime)}</span>
                        <span class="views"><i class="fas fa-eye"></i> ${announcement.viewCount}</span>
                    </div>
                </div>
            `);
            
            item.click(function() {
                window.location.href = `announcement-detail.html?id=${announcement.id}`;
            });
            
            container.append(item);
        });
        
        $('#important-section').show();
    }
    
    function renderAnnouncements(data) {
        const container = $('#announcements-container');
        const announcements = data.content;
        
        if (!announcements || announcements.length === 0) {
            container.hide();
            $('#empty-state').show();
            return;
        }
        
        container.empty().show();
        $('#empty-state').hide();
        
        announcements.forEach(function(announcement) {
            const card = createAnnouncementCard(announcement);
            container.append(card);
        });
    }
    
    function createAnnouncementCard(announcement) {
        const isImportant = announcement.isImportant;
        const typeClass = announcement.type.toLowerCase();
        const deadlineHtml = announcement.deadlineTime ? 
            `<div class="announcement-deadline">
                <i class="fas fa-clock"></i> 截止：${formatDate(announcement.deadlineTime)}
            </div>` : '';
        
        const card = $(`
            <div class="announcement-card ${isImportant ? 'important' : ''} ${typeClass}" data-id="${announcement.id}">
                <div class="announcement-header">
                    <h3 class="announcement-title">${escapeHtml(announcement.title)}</h3>
                    <div class="announcement-meta">
                        <span class="announcement-type ${typeClass}">
                            ${getTypeDisplayName(announcement.type)}
                        </span>
                        <span class="publish-date">${formatDate(announcement.publishTime)}</span>
                    </div>
                </div>
                <div class="announcement-content">
                    <p class="announcement-summary">${escapeHtml(announcement.summary || '')}</p>
                    <div class="announcement-footer">
                        <div class="announcement-stats">
                            <span><i class="fas fa-eye"></i> ${announcement.viewCount}</span>
                            <span><i class="fas fa-thumbs-up"></i> ${announcement.likeCount || 0}</span>
                            <span><i class="fas fa-comments"></i> ${announcement.commentCount || 0}</span>
                            <span><i class="fas fa-star"></i> ${announcement.favoriteCount || 0}</span>
                            <span><i class="fas fa-user"></i> ${escapeHtml(announcement.publisher || '系统')}</span>
                        </div>
                        <div class="announcement-actions">
                            <button class="action-btn like-btn" data-announcement-id="${announcement.id}" data-liked="false">
                                <i class="fas fa-thumbs-up"></i>
                                <span class="like-text">点赞</span>
                                <span class="like-count">${announcement.likeCount || 0}</span>
                            </button>
                            <button class="action-btn favorite-btn" data-announcement-id="${announcement.id}" data-favorited="false">
                                <i class="fas fa-star"></i>
                                <span class="favorite-text">收藏</span>
                                <span class="favorite-count">${announcement.favoriteCount || 0}</span>
                            </button>
                            <button class="action-btn detail-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-eye"></i>
                                查看详情
                            </button>
                        </div>
                        ${deadlineHtml}
                    </div>
                </div>
            </div>
        `);
        
        // 绑定卡片点击事件（排除按钮区域）
        card.click(function(e) {
            // 如果点击的是按钮或按钮内的元素，不触发卡片点击
            if ($(e.target).closest('.action-btn').length === 0) {
                window.location.href = `announcement-detail.html?id=${announcement.id}`;
            }
        });

        // 绑定按钮事件
        card.find('.like-btn').click(function(e) {
            e.stopPropagation();
            const announcementId = $(this).data('announcement-id');
            toggleLike(announcementId, $(this));
        });

        card.find('.favorite-btn').click(function(e) {
            e.stopPropagation();
            const announcementId = $(this).data('announcement-id');
            toggleFavorite(announcementId, $(this));
        });

        card.find('.detail-btn').click(function(e) {
            e.stopPropagation();
            const announcementId = $(this).data('announcement-id');
            window.location.href = `announcement-detail.html?id=${announcementId}`;
        });

        return card;
    }
    
    function renderPagination(data) {
        const container = $('#pagination');
        const totalPages = data.totalPages;
        const currentPageNum = data.number;
        
        if (totalPages <= 1) {
            container.hide();
            return;
        }
        
        container.empty().show();
        
        // 上一页按钮
        const prevBtn = $(`
            <button class="pagination-btn ${currentPageNum === 0 ? 'disabled' : ''}" data-page="${currentPageNum - 1}">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
        `);
        container.append(prevBtn);
        
        // 页码按钮
        const startPage = Math.max(0, currentPageNum - 2);
        const endPage = Math.min(totalPages - 1, currentPageNum + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = $(`
                <button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" data-page="${i}">
                    ${i + 1}
                </button>
            `);
            container.append(pageBtn);
        }
        
        // 下一页按钮
        const nextBtn = $(`
            <button class="pagination-btn ${currentPageNum === totalPages - 1 ? 'disabled' : ''}" data-page="${currentPageNum + 1}">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `);
        container.append(nextBtn);
        
        // 分页信息
        const info = $(`
            <span class="pagination-info">
                第 ${currentPageNum + 1} 页，共 ${totalPages} 页，总计 ${data.totalElements} 条
            </span>
        `);
        container.append(info);
        
        // 绑定分页事件
        container.find('.pagination-btn:not(.disabled)').click(function() {
            const page = parseInt($(this).data('page'));
            if (!isNaN(page) && page !== currentPage) {
                currentPage = page;
                loadAnnouncements();
                $('html, body').animate({ scrollTop: 0 }, 300);
            }
        });
    }
    
    function showLoading() {
        $('#loading').show();
        $('#announcements-container').hide();
        $('#empty-state').hide();
    }
    
    function hideLoading() {
        $('#loading').hide();
    }
    
    function showError(message) {
        // 可以实现错误提示功能
        console.error(message);
    }
    
    function updateActiveNavigation(type) {
        $('.nav-links a').removeClass('active');
        if (type === 'activity') {
            $('.nav-links a[href="announcements.html?type=activity"]').addClass('active');
        } else {
            $('.nav-links a[href="announcements.html"]').addClass('active');
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
            year: 'numeric',
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

    // 获取当前用户信息
    function getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // 点赞功能
    function toggleLike(announcementId, button) {
        if (!currentUser) {
            showMessage('请先登录', 'warning');
            return;
        }

        $.ajax({
            url: '/api/likes/announcement',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: currentUser.id,
                announcementId: announcementId
            }),
            success: function(data) {
                updateLikeButton(button, data.isLiked, data.likeCount);
                showMessage(data.isLiked ? '点赞成功' : '取消点赞', 'success');
            },
            error: function(xhr, status, error) {
                console.error('点赞操作失败:', error);
                showMessage('操作失败，请稍后重试', 'error');
            }
        });
    }

    // 收藏功能
    function toggleFavorite(announcementId, button) {
        if (!currentUser) {
            showMessage('请先登录', 'warning');
            return;
        }

        $.ajax({
            url: '/api/favorites',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: currentUser.id,
                announcementId: announcementId
            }),
            success: function(data) {
                updateFavoriteButton(button, data.isFavorited, data.favoriteCount);
                showMessage(data.isFavorited ? '收藏成功' : '取消收藏', 'success');
            },
            error: function(xhr, status, error) {
                console.error('收藏操作失败:', error);
                showMessage('操作失败，请稍后重试', 'error');
            }
        });
    }

    // 更新点赞按钮状态
    function updateLikeButton(button, isLiked, likeCount) {
        const likeText = button.find('.like-text');
        const likeCountSpan = button.find('.like-count');

        button.attr('data-liked', isLiked);
        if (isLiked) {
            button.addClass('liked');
        } else {
            button.removeClass('liked');
        }

        likeText.text(isLiked ? '已点赞' : '点赞');
        likeCountSpan.text(likeCount);
    }

    // 更新收藏按钮状态
    function updateFavoriteButton(button, isFavorited, favoriteCount) {
        const favoriteText = button.find('.favorite-text');
        const favoriteCountSpan = button.find('.favorite-count');

        button.attr('data-favorited', isFavorited);
        if (isFavorited) {
            button.addClass('favorited');
        } else {
            button.removeClass('favorited');
        }

        favoriteText.text(isFavorited ? '已收藏' : '收藏');
        favoriteCountSpan.text(favoriteCount);
    }

    // 显示消息提示
    function showMessage(message, type = 'info') {
        const messageHtml = `
            <div class="message ${type}">
                <i class="fas fa-${getMessageIcon(type)}"></i>
                ${message}
            </div>
        `;

        const messageElement = $(messageHtml);
        $('body').append(messageElement);

        // 3秒后自动消失
        setTimeout(function() {
            messageElement.fadeOut(function() {
                messageElement.remove();
            });
        }, 3000);
    }

    function getMessageIcon(type) {
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconMap[type] || 'info-circle';
    }
});
