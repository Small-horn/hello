// 公告详情页面JavaScript
$(document).ready(function() {
    // 全局变量
    let announcementId = null;
    let announcementData = null;
    let currentUser = null;
    let commentsData = [];
    let currentPage = 0;
    let sortBy = 'time';
    let replyToCommentId = null;
    
    // 初始化页面
    init();
    
    function init() {
        // 从URL参数获取公告ID
        const urlParams = new URLSearchParams(window.location.search);
        announcementId = urlParams.get('id');

        console.log('初始化公告详情页面');
        console.log('URL参数:', window.location.search);
        console.log('公告ID:', announcementId);

        if (!announcementId) {
            console.error('缺少公告ID参数');
            showError('缺少公告ID参数');
            return;
        }

        // 获取当前用户信息
        currentUser = getCurrentUser();
        console.log('当前用户:', currentUser);

        // 更新登录状态显示
        updateLoginStatus();

        // 绑定事件
        bindEvents();

        // 加载公告详情
        loadAnnouncementDetail();
    }
    
    function bindEvents() {
        // 返回按钮
        $('#back-btn').click(function() {
            window.history.back();
        });
        
        // 重试按钮
        $('#retry-btn').click(function() {
            loadAnnouncementDetail();
        });
        
        // 分享按钮
        $('#share-btn').click(function() {
            showShareModal();
        });
        
        // 打印按钮
        $('#print-btn').click(function() {
            window.print();
        });
        
        // 模态框关闭
        $('.modal-close').click(function() {
            closeModal();
        });
        
        // 点击模态框背景关闭
        $('.modal').click(function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // 分享选项
        $('.share-option').click(function() {
            const type = $(this).data('type');
            handleShare(type);
        });
        
        // 复制链接
        $('#copy-url-btn').click(function() {
            copyToClipboard($('#share-url').val());
        });

        // 点赞按钮
        $('#like-btn').click(function() {
            toggleLike();
        });

        // 收藏按钮
        $('#favorite-btn').click(function() {
            toggleFavorite();
        });

        // 快速登录按钮
        $('#quick-login-btn').click(function() {
            showQuickLoginModal();
        });

        // 退出登录按钮
        $('#logout-btn').click(function() {
            logout();
        });

        // 发表评论
        $('#submit-comment-btn').click(function() {
            submitComment();
        });

        // 取消评论
        $('#cancel-comment-btn').click(function() {
            cancelComment();
        });

        // 评论排序
        $('.sort-btn').click(function() {
            const newSortBy = $(this).data('sort');
            if (newSortBy !== sortBy) {
                sortBy = newSortBy;
                $('.sort-btn').removeClass('active');
                $(this).addClass('active');
                currentPage = 0;
                loadComments();
            }
        });

        // 加载更多评论
        $('#load-more-comments').click(function() {
            currentPage++;
            loadComments(true);
        });

        // 回复相关事件
        $('#submit-reply-btn').click(function() {
            submitReply();
        });

        $('#cancel-reply-btn').click(function() {
            closeReplyModal();
        });
    }
    
    function loadAnnouncementDetail() {
        showLoading();
        hideError();
        
        $.ajax({
            url: `/api/announcements/${announcementId}`,
            method: 'GET',
            success: function(data) {
                hideLoading();
                announcementData = data;
                renderAnnouncementDetail(data);
                loadRelatedAnnouncements(data.type);
            },
            error: function(xhr, status, error) {
                hideLoading();
                if (xhr.status === 404) {
                    showError('公告不存在或已被删除');
                } else {
                    showError('加载公告详情失败，请稍后重试');
                }
                console.error('加载公告详情失败:', error);
            }
        });
    }
    
    function renderAnnouncementDetail(announcement) {
        // 设置页面标题
        document.title = `${announcement.title} - 戴永辉`;
        
        // 渲染公告类型
        const typeElement = $('#announcement-type');
        typeElement.text(getTypeDisplayName(announcement.type));
        typeElement.removeClass().addClass(`announcement-type ${announcement.type.toLowerCase()}`);
        
        // 渲染重要标识
        if (announcement.isImportant) {
            $('#important-badge').show();
        }
        
        // 渲染基本信息
        $('#announcement-title').text(announcement.title);
        $('#announcement-publisher').text(announcement.publisher || '系统');
        $('#announcement-publish-time').text(formatDateTime(announcement.publishTime));
        $('#announcement-views').text(announcement.viewCount);
        $('#announcement-likes').text(announcement.likeCount || 0);
        $('#announcement-comments').text(announcement.commentCount || 0);
        $('#announcement-favorites').text(announcement.favoriteCount || 0);
        
        // 渲染截止时间
        if (announcement.deadlineTime) {
            $('#announcement-deadline').text(formatDateTime(announcement.deadlineTime));
            $('#deadline-info').show();
        }
        
        // 渲染内容
        $('#announcement-content').html(announcement.content);
        
        // 渲染底部信息
        $('#announcement-created').text(formatDateTime(announcement.createdAt));
        if (announcement.updatedAt && announcement.updatedAt !== announcement.createdAt) {
            $('#announcement-updated').text(formatDateTime(announcement.updatedAt));
            $('#updated-info').show();
        }
        
        // 显示详情内容
        $('#announcement-detail').show();

        // 加载用户状态（点赞、收藏）
        if (currentUser) {
            loadUserStatus();
        }

        // 加载评论
        loadComments();

        // 显示评论区域
        $('#comments-section').show();
    }
    
    function loadRelatedAnnouncements(type) {
        $.ajax({
            url: `/api/announcements/published/type/${type}`,
            method: 'GET',
            data: {
                page: 0,
                size: 4
            },
            success: function(data) {
                const relatedAnnouncements = data.content.filter(item => item.id != announcementId);
                if (relatedAnnouncements.length > 0) {
                    renderRelatedAnnouncements(relatedAnnouncements.slice(0, 3));
                }
            },
            error: function(xhr, status, error) {
                console.error('加载相关公告失败:', error);
            }
        });
    }
    
    function renderRelatedAnnouncements(announcements) {
        const container = $('#related-announcements');
        container.empty();
        
        announcements.forEach(function(announcement) {
            const item = $(`
                <div class="related-announcement" data-id="${announcement.id}">
                    <h4>${escapeHtml(announcement.title)}</h4>
                    <p>${escapeHtml(announcement.summary || '')}</p>
                    <div class="meta">
                        <span>${getTypeDisplayName(announcement.type)}</span>
                        <span>${formatDate(announcement.publishTime)}</span>
                    </div>
                </div>
            `);
            
            item.click(function() {
                window.location.href = `announcement-detail.html?id=${announcement.id}`;
            });
            
            container.append(item);
        });
        
        $('#related-section').show();
    }
    
    function showShareModal() {
        const currentUrl = window.location.href;
        $('#share-url').val(currentUrl);
        $('#share-modal').show();
    }
    
    function closeModal() {
        $('.modal').hide();
    }
    
    function handleShare(type) {
        const url = window.location.href;
        const title = announcementData ? announcementData.title : '校园公告';
        
        switch (type) {
            case 'copy':
                copyToClipboard(url);
                break;
            case 'email':
                const emailSubject = encodeURIComponent(`分享公告：${title}`);
                const emailBody = encodeURIComponent(`我想与您分享这个公告：\n\n${title}\n\n${url}`);
                window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
                break;
        }
    }
    
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                showMessage('链接已复制到剪贴板', 'success');
            }).catch(function(err) {
                console.error('复制失败:', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }
    
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showMessage('链接已复制到剪贴板', 'success');
        } catch (err) {
            console.error('复制失败:', err);
            showMessage('复制失败，请手动复制链接', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    function showLoading() {
        $('#loading').show();
        $('#announcement-detail').hide();
        $('#error-state').hide();
    }
    
    function hideLoading() {
        $('#loading').hide();
    }
    
    function showError(message) {
        $('#error-message').text(message);
        $('#error-state').show();
        $('#announcement-detail').hide();
    }
    
    function hideError() {
        $('#error-state').hide();
    }
    
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
            day: '2-digit'
        });
    }
    
    function formatDateTime(dateString) {
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

    // 获取当前用户信息 - 与主页保持一致
    function getCurrentUser() {
        // 优先从sessionStorage获取，然后从localStorage获取
        let userStr = sessionStorage.getItem('currentUser');
        if (!userStr) {
            userStr = localStorage.getItem('currentUser');
        }
        return userStr ? JSON.parse(userStr) : null;
    }

    // 加载用户状态（点赞、收藏）
    function loadUserStatus() {
        if (!currentUser) return;

        // 加载点赞状态
        $.ajax({
            url: `/api/likes/announcement/${announcementId}/status`,
            method: 'GET',
            data: { userId: currentUser.id },
            success: function(data) {
                updateLikeButton(data.isLiked, data.likeCount);
            },
            error: function(xhr, status, error) {
                console.error('加载点赞状态失败:', error);
            }
        });

        // 加载收藏状态
        $.ajax({
            url: '/api/favorites/status',
            method: 'GET',
            data: {
                userId: currentUser.id,
                announcementId: announcementId
            },
            success: function(data) {
                updateFavoriteButton(data.isFavorited, data.favoriteCount);
            },
            error: function(xhr, status, error) {
                console.error('加载收藏状态失败:', error);
            }
        });
    }

    // 切换点赞状态
    function toggleLike() {
        console.log('toggleLike called, currentUser:', currentUser);
        console.log('announcementId:', announcementId);

        if (!currentUser) {
            showMessage('请先登录', 'warning');
            console.log('用户未登录，跳转到登录页面');
            // 可以选择跳转到登录页面
            // window.location.href = 'login.html';
            return;
        }

        if (!announcementId) {
            showMessage('公告ID无效', 'error');
            console.error('announcementId is null or undefined');
            return;
        }

        console.log('发送点赞请求:', {
            userId: currentUser.id,
            announcementId: announcementId
        });

        $.ajax({
            url: '/api/likes/announcement',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: currentUser.id,
                announcementId: announcementId
            }),
            success: function(data) {
                console.log('点赞请求成功:', data);
                updateLikeButton(data.isLiked, data.likeCount);
                showMessage(data.isLiked ? '点赞成功' : '取消点赞', 'success');

                // 更新公告数据中的点赞数
                if (announcementData) {
                    announcementData.likeCount = data.likeCount;
                }
            },
            error: function(xhr, status, error) {
                console.error('点赞操作失败:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });

                let errorMessage = '操作失败，请稍后重试';
                if (xhr.status === 400) {
                    errorMessage = '请求参数错误';
                } else if (xhr.status === 401) {
                    errorMessage = '请先登录';
                } else if (xhr.status === 404) {
                    errorMessage = '公告不存在';
                } else if (xhr.status === 500) {
                    errorMessage = '服务器错误，请稍后重试';
                }

                showMessage(errorMessage, 'error');
            }
        });
    }

    // 切换收藏状态
    function toggleFavorite() {
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
                updateFavoriteButton(data.isFavorited, data.favoriteCount);
                showMessage(data.isFavorited ? '收藏成功' : '取消收藏', 'success');
            },
            error: function(xhr, status, error) {
                console.error('收藏操作失败:', error);
                showMessage('操作失败，请稍后重试', 'error');
            }
        });
    }

    // 更新点赞按钮状态
    function updateLikeButton(isLiked, likeCount) {
        console.log('更新点赞按钮状态:', { isLiked, likeCount });

        const likeBtn = $('#like-btn');
        const likeText = likeBtn.find('.like-text');
        const likeCountSpan = likeBtn.find('.like-count');

        if (likeBtn.length === 0) {
            console.error('找不到点赞按钮元素');
            return;
        }

        likeBtn.attr('data-liked', isLiked);
        likeText.text(isLiked ? '已点赞' : '点赞');
        likeCountSpan.text(likeCount);

        // 更新按钮样式
        if (isLiked) {
            likeBtn.addClass('liked');
        } else {
            likeBtn.removeClass('liked');
        }

        // 更新头部统计
        $('#announcement-likes').text(likeCount);

        console.log('点赞按钮状态更新完成');
    }

    // 更新收藏按钮状态
    function updateFavoriteButton(isFavorited, favoriteCount) {
        const favoriteBtn = $('#favorite-btn');
        const favoriteText = favoriteBtn.find('.favorite-text');
        const favoriteCountSpan = favoriteBtn.find('.favorite-count');

        favoriteBtn.attr('data-favorited', isFavorited);
        favoriteText.text(isFavorited ? '已收藏' : '收藏');
        favoriteCountSpan.text(favoriteCount);

        // 更新头部统计
        $('#announcement-favorites').text(favoriteCount);
    }

    // 加载评论列表
    function loadComments(append = false) {
        $.ajax({
            url: `/api/comments/announcement/${announcementId}`,
            method: 'GET',
            data: {
                page: currentPage,
                size: 10,
                sortBy: sortBy
            },
            success: function(data) {
                if (append) {
                    commentsData = commentsData.concat(data.content);
                } else {
                    commentsData = data.content;
                }

                renderComments(commentsData, append);
                updateCommentCount(data.totalElements);

                // 更新加载更多按钮
                if (data.last) {
                    $('.load-more-container').hide();
                } else {
                    $('.load-more-container').show();
                }
            },
            error: function(xhr, status, error) {
                console.error('加载评论失败:', error);
                showMessage('加载评论失败', 'error');
            }
        });
    }

    // 渲染评论列表
    function renderComments(comments, append = false) {
        const container = $('#comments-list');

        if (!append) {
            container.empty();
        }

        comments.forEach(function(comment) {
            const commentHtml = createCommentHtml(comment);
            container.append(commentHtml);

            // 加载回复
            loadReplies(comment.id);
        });

        // 绑定评论事件
        bindCommentEvents();
    }

    // 创建评论HTML
    function createCommentHtml(comment) {
        const timeAgo = getTimeAgo(comment.createdAt);
        const isLiked = currentUser && comment.userLiked; // 假设后端返回用户点赞状态

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-user-info">
                        <img src="images/avatar.jpg" alt="用户头像" class="comment-user-avatar">
                        <span class="comment-username">${escapeHtml(comment.user?.username || '匿名用户')}</span>
                    </div>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-comment-btn ${isLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${comment.likeCount || 0}</span>
                    </button>
                    <button class="comment-action-btn reply-btn" data-comment-id="${comment.id}" data-username="${escapeHtml(comment.user?.username || '匿名用户')}">
                        <i class="fas fa-reply"></i>
                        回复
                    </button>
                </div>
                <div class="comment-replies" id="replies-${comment.id}">
                    <!-- 回复将在这里加载 -->
                </div>
            </div>
        `;
    }

    // 绑定评论相关事件
    function bindCommentEvents() {
        // 点赞评论
        $('.like-comment-btn').off('click').on('click', function() {
            const commentId = $(this).data('comment-id');
            toggleCommentLike(commentId, $(this));
        });

        // 回复评论
        $('.reply-btn').off('click').on('click', function() {
            const commentId = $(this).data('comment-id');
            const username = $(this).data('username');
            showReplyModal(commentId, username);
        });
    }

    // 切换评论点赞
    function toggleCommentLike(commentId, button) {
        if (!currentUser) {
            showMessage('请先登录', 'warning');
            return;
        }

        $.ajax({
            url: '/api/likes/comment',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: currentUser.id,
                commentId: commentId
            }),
            success: function(data) {
                button.toggleClass('liked', data.isLiked);
                button.find('span').text(data.likeCount);
                showMessage(data.isLiked ? '点赞成功' : '取消点赞', 'success');
            },
            error: function(xhr, status, error) {
                console.error('评论点赞失败:', error);
                showMessage('操作失败，请稍后重试', 'error');
            }
        });
    }

    // 加载回复
    function loadReplies(commentId) {
        $.ajax({
            url: `/api/comments/${commentId}/replies`,
            method: 'GET',
            success: function(replies) {
                if (replies.length > 0) {
                    renderReplies(commentId, replies);
                }
            },
            error: function(xhr, status, error) {
                console.error('加载回复失败:', error);
            }
        });
    }

    // 渲染回复
    function renderReplies(commentId, replies) {
        const container = $(`#replies-${commentId}`);
        container.empty();

        replies.forEach(function(reply) {
            const replyHtml = createReplyHtml(reply);
            container.append(replyHtml);
        });
    }

    // 创建回复HTML
    function createReplyHtml(reply) {
        const timeAgo = getTimeAgo(reply.createdAt);
        const isLiked = currentUser && reply.userLiked;

        return `
            <div class="reply-item" data-comment-id="${reply.id}">
                <div class="comment-header">
                    <div class="comment-user-info">
                        <img src="images/avatar.jpg" alt="用户头像" class="comment-user-avatar">
                        <span class="comment-username">${escapeHtml(reply.user?.username || '匿名用户')}</span>
                    </div>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-content">${escapeHtml(reply.content)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-comment-btn ${isLiked ? 'liked' : ''}" data-comment-id="${reply.id}">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${reply.likeCount || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }

    // 发表评论
    function submitComment() {
        if (!currentUser) {
            showMessage('请先登录', 'warning');
            return;
        }

        const content = $('#comment-input').val().trim();
        if (!content) {
            showMessage('请输入评论内容', 'warning');
            return;
        }

        $.ajax({
            url: '/api/comments',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                announcementId: announcementId,
                userId: currentUser.id,
                content: content
            }),
            success: function(comment) {
                $('#comment-input').val('');
                showMessage('评论发表成功', 'success');

                // 重新加载评论
                currentPage = 0;
                loadComments();

                // 更新评论数
                if (announcementData) {
                    announcementData.commentCount = (announcementData.commentCount || 0) + 1;
                    $('#announcement-comments').text(announcementData.commentCount);
                }
            },
            error: function(xhr, status, error) {
                console.error('发表评论失败:', error);
                showMessage('发表评论失败，请稍后重试', 'error');
            }
        });
    }

    // 取消评论
    function cancelComment() {
        $('#comment-input').val('');
    }

    // 显示回复模态框
    function showReplyModal(commentId, username) {
        if (!currentUser) {
            showMessage('请先登录', 'warning');
            return;
        }

        replyToCommentId = commentId;
        $('#reply-to-user').text(username);

        // 获取原评论内容
        const commentElement = $(`.comment-item[data-comment-id="${commentId}"]`);
        const commentContent = commentElement.find('.comment-content').text();
        $('#original-comment-content').text(commentContent);

        $('#reply-modal').show();
        $('#reply-input').focus();
    }

    // 关闭回复模态框
    function closeReplyModal() {
        $('#reply-modal').hide();
        $('#reply-input').val('');
        replyToCommentId = null;
    }

    // 发表回复
    function submitReply() {
        const content = $('#reply-input').val().trim();
        if (!content) {
            showMessage('请输入回复内容', 'warning');
            return;
        }

        $.ajax({
            url: '/api/comments',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                announcementId: announcementId,
                userId: currentUser.id,
                content: content,
                parentId: replyToCommentId
            }),
            success: function(reply) {
                closeReplyModal();
                showMessage('回复发表成功', 'success');

                // 重新加载该评论的回复
                loadReplies(replyToCommentId);

                // 更新评论数
                if (announcementData) {
                    announcementData.commentCount = (announcementData.commentCount || 0) + 1;
                    $('#announcement-comments').text(announcementData.commentCount);
                }
            },
            error: function(xhr, status, error) {
                console.error('发表回复失败:', error);
                showMessage('发表回复失败，请稍后重试', 'error');
            }
        });
    }

    // 更新评论数量
    function updateCommentCount(count) {
        $('#total-comments').text(count);
    }

    // 获取相对时间
    function getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return '刚刚';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}分钟前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}小时前`;
        } else if (diffInSeconds < 2592000) {
            return `${Math.floor(diffInSeconds / 86400)}天前`;
        } else {
            return formatDate(dateString);
        }
    }

    // 更新用户信息显示 - 与主页保持一致
    function updateLoginStatus() {
        const userNameSpan = $('.current-user-name');
        const roleSpan = $('.current-user-role');
        const quickLoginBtn = $('#quick-login-btn');
        const logoutBtn = $('#logout-btn');

        if (currentUser) {
            // 显示用户信息
            userNameSpan.text(currentUser.realName || currentUser.username);

            // 设置角色显示
            const roleDisplayName = getRoleDisplayName(currentUser.role);
            roleSpan.text(roleDisplayName)
                   .removeClass('admin teacher student guest')
                   .addClass(currentUser.role.toLowerCase());

            // 显示退出按钮，隐藏登录按钮
            quickLoginBtn.hide();
            logoutBtn.show();
        } else {
            // 游客状态
            userNameSpan.text('游客');
            roleSpan.text('游客')
                   .removeClass('admin teacher student')
                   .addClass('guest');

            // 显示登录按钮，隐藏退出按钮
            quickLoginBtn.show();
            logoutBtn.hide();
        }
    }

    // 获取角色显示名称
    function getRoleDisplayName(role) {
        const roleMap = {
            'ADMIN': '管理员',
            'TEACHER': '教师',
            'STUDENT': '学生',
            'GUEST': '游客'
        };
        return roleMap[role] || '用户';
    }

    // 显示快速登录模态框
    function showQuickLoginModal() {
        // 简单的快速登录 - 模拟登录student1用户
        const testUser = {
            id: 5,
            username: 'student1',
            realName: '张三',
            role: 'STUDENT',
            roleDisplayName: '学生',
            department: '计算机学院',
            loginCount: 1
        };

        // 同时保存到localStorage和sessionStorage以保持一致性
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        sessionStorage.setItem('currentUser', JSON.stringify(testUser));
        currentUser = testUser;

        updateLoginStatus();
        showMessage('登录成功', 'success');

        // 重新加载用户状态
        if (announcementId) {
            loadUserStatus();
        }
    }

    // 退出登录
    function logout() {
        // 清除所有用户数据
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        currentUser = null;

        updateLoginStatus();
        showMessage('已退出登录', 'info');

        // 重置按钮状态
        updateLikeButton(false, announcementData ? announcementData.likeCount : 0);
        updateFavoriteButton(false, announcementData ? announcementData.favoriteCount : 0);
    }
});
