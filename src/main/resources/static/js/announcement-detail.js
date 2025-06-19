// 公告详情页面JavaScript
$(document).ready(function() {
    // 全局变量
    let announcementId = null;
    let announcementData = null;
    
    // 初始化页面
    init();
    
    function init() {
        // 从URL参数获取公告ID
        const urlParams = new URLSearchParams(window.location.search);
        announcementId = urlParams.get('id');
        
        if (!announcementId) {
            showError('缺少公告ID参数');
            return;
        }
        
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
});
