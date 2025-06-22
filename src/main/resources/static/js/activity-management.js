// 活动管理页面JavaScript
$(document).ready(function() {
    // 全局变量
    let currentPage = 0;
    let pageSize = 10;
    let currentStatus = '';
    let currentKeyword = '';
    let editingId = null;
    let isInitialized = false;
    let currentUser = null;

    console.log('活动管理页面开始加载...');

    // 等待DOM完全加载后再检查权限
    setTimeout(() => {
        console.log('开始权限检查和初始化...');
        checkPermissionAndInit();
    }, 500);

    function checkPermissionAndInit() {
        console.log('开始权限检查...');

        $.ajax({
            url: '/api/auth/current',
            method: 'GET',
            timeout: 3000,
            success: function(response) {
                console.log('权限检查响应:', response);
                currentUser = response.success && response.authenticated ? response.user : null;
                init(currentUser);

                if (!currentUser) {
                    showMessage('未登录，请先登录', 'error');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }

                // 检查是否有发布活动的权限
                if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
                    showMessage('只有管理员和教师可以发布活动', 'warning');
                    $('#add-activity-btn').hide();
                }
            },
            error: function(xhr, status, error) {
                console.log('权限检查失败:', error);
                showMessage('权限检查失败，请重新登录', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }

    function init(user) {
        if (isInitialized) return;
        isInitialized = true;

        console.log('开始初始化页面，用户:', user);

        // 更新侧边栏头像
        if (typeof AvatarUtils !== 'undefined') {
            AvatarUtils.updateSidebarAvatar(user);
        }

        // 检查必要的DOM元素
        const tbody = $('#activities-tbody');
        if (tbody.length === 0) {
            console.error('找不到表格tbody元素，初始化失败');
            showMessage('页面初始化失败：找不到表格元素', 'error');
            return;
        }

        // 设置当前用户信息
        currentUser = user;

        // 绑定事件
        bindEvents(user);

        // 加载活动数据
        console.log('开始加载活动数据...');
        loadActivities();
    }

    function bindEvents(user) {
        // 基础功能：刷新和筛选
        $('#refresh-btn').click(() => loadActivities());

        // 筛选器
        $('#status-filter').change(() => {
            currentStatus = $('#status-filter').val();
            currentPage = 0;
            loadActivities();
        });

        // 搜索
        $('#search-btn').click(performSearch);
        $('#search-input').keypress(function(e) {
            if (e.which === 13) performSearch();
        });

        // 清除搜索
        $('#clear-search-btn').click(clearSearch);

        // 编辑功能（仅管理员和教师可用）
        if (user && (user.role === 'ADMIN' || user.role === 'TEACHER')) {
            console.log('绑定编辑功能事件');

            // 新建活动按钮
            $('#add-activity-btn').click(() => {
                console.log('新建活动按钮被点击');
                showActivityModal();
            });

            // 表单提交
            $('#activity-form').submit(handleFormSubmit);

            // 保存草稿
            $('#save-draft-btn').click(() => saveActivity('DRAFT'));

            // 模态框关闭
            $('.modal-close').click(closeModal);
            $('.modal').click(function(e) {
                if (e.target === this) closeModal();
            });
        }
    }

    function performSearch() {
        currentKeyword = $('#search-input').val().trim();
        currentPage = 0;
        loadActivities();
    }

    function clearSearch() {
        currentKeyword = '';
        $('#search-input').val('');
        currentPage = 0;
        loadActivities();
    }

    function loadActivities() {
        console.log('开始加载活动数据...');
        showLoading();

        let url = '/api/announcements';
        let params = {
            page: currentPage,
            size: pageSize,
            type: 'ACTIVITY' // 只加载活动类型
        };

        // 如果当前用户不是管理员，只加载自己发布的活动
        if (currentUser && currentUser.role !== 'ADMIN') {
            params.publisher = currentUser.username;
        }

        // 添加筛选参数
        if (currentStatus) {
            params.status = currentStatus;
        }

        // 如果有搜索关键词，使用搜索接口
        if (currentKeyword) {
            url = '/api/announcements/search';
            params.keyword = currentKeyword;
        }

        console.log('请求URL:', url);
        console.log('请求参数:', params);

        $.ajax({
            url: url,
            method: 'GET',
            data: params,
            success: function(data) {
                console.log('数据加载成功:', data);
                hideLoading();

                // 过滤出活动类型的数据
                if (data.content) {
                    data.content = data.content.filter(item => item.type === 'ACTIVITY');
                    data.totalElements = data.content.length;
                    data.totalPages = Math.ceil(data.content.length / pageSize);
                }

                renderActivitiesTable(data);
                renderPagination(data);
                updateStatistics(data);
            },
            error: function(xhr, status, error) {
                console.error('数据加载失败:', error);
                hideLoading();
                showMessage('加载活动数据失败', 'error');
                
                // 显示空状态
                $('#activities-tbody').empty();
                $('#empty-state').show();
                $('.table-container').hide();
            }
        });
    }

    function updateStatistics(data) {
        if (!data.content) return;

        const total = data.content.length;
        const published = data.content.filter(item => item.status === 'PUBLISHED').length;
        const draft = data.content.filter(item => item.status === 'DRAFT').length;

        $('#total-activities strong').text(total);
        $('#published-activities strong').text(published);
        $('#draft-activities strong').text(draft);
    }

    function renderActivitiesTable(data) {
        console.log('开始渲染活动表格，数据:', data);

        const tbody = $('#activities-tbody');
        const activities = data.content;

        if (!activities || activities.length === 0) {
            console.log('没有数据，显示空状态');
            tbody.empty();
            $('#empty-state').show();
            $('.table-container').hide();
            return;
        }

        console.log('有数据，开始渲染表格');
        tbody.empty();
        $('#empty-state').hide();
        $('.table-container').show();

        activities.forEach(function(activity, index) {
            console.log(`渲染第 ${index + 1} 条数据:`, activity.title);
            const row = createTableRow(activity);
            tbody.append(row);
        });

        console.log('表格渲染完成');
    }

    function createTableRow(activity) {
        const statusClass = activity.status.toLowerCase();
        
        return $(`
            <tr data-id="${activity.id}">
                <td>
                    <div class="title-cell">
                        ${activity.isImportant ? '<i class="fas fa-star" style="color: #dc3545; margin-right: 5px;"></i>' : ''}
                        ${escapeHtml(activity.title)}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${getStatusDisplayName(activity.status)}
                    </span>
                </td>
                <td>${formatDateTime(activity.publishTime)}</td>
                <td>${activity.deadlineTime ? formatDateTime(activity.deadlineTime) : '无限制'}</td>
                <td>${activity.viewCount}</td>
                <td>${activity.likeCount}</td>
                <td>
                    <div class="action-buttons">
                        ${getActionButtons(activity)}
                    </div>
                </td>
            </tr>
        `);
    }

    function getActionButtons(activity) {
        return `
            <button class="action-btn edit" onclick="editActivity(${activity.id})">
                <i class="fas fa-edit"></i> 编辑
            </button>
            ${(activity.status === 'DRAFT' || activity.status === 'CANCELLED') ?
                `<button class="action-btn publish" onclick="publishActivity(${activity.id})">
                    <i class="fas fa-upload"></i> 发布
                </button>` :
                `<button class="action-btn unpublish" onclick="unpublishActivity(${activity.id})">
                    <i class="fas fa-download"></i> 取消发布
                </button>`
            }
            <button class="action-btn delete" onclick="deleteActivity(${activity.id}, '${escapeHtml(activity.title)}')">
                <i class="fas fa-trash"></i> 删除
            </button>
        `;
    }

    // 导出函数供HTML调用
    window.showActivityModal = showActivityModal;
    window.editActivity = editActivity;
    window.publishActivity = publishActivity;
    window.unpublishActivity = unpublishActivity;
    window.deleteActivity = deleteActivity;
    window.closeActivityModal = closeActivityModal;
    window.closeDeleteModal = closeDeleteModal;

    // 工具函数
    function showLoading() {
        $('#loading').show();
    }

    function hideLoading() {
        $('#loading').hide();
    }

    function showMessage(message, type = 'info') {
        // 实现消息显示逻辑
        console.log(`${type.toUpperCase()}: ${message}`);

        // 创建消息元素
        const messageContainer = $('#message-container');
        const messageElement = $(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${getMessageIcon(type)}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);

        messageContainer.append(messageElement);

        // 自动隐藏消息
        setTimeout(() => {
            messageElement.fadeOut(() => {
                messageElement.remove();
            });
        }, 5000);
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

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, function(match) {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
    }

    function formatDateTime(dateTime) {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return date.toLocaleString('zh-CN');
    }

    function getStatusDisplayName(status) {
        const statusMap = {
            'DRAFT': '草稿',
            'PUBLISHED': '已发布',
            'EXPIRED': '已过期',
            'CANCELLED': '已取消'
        };
        return statusMap[status] || status;
    }

    // 模态框相关函数
    function showActivityModal(activityData = null) {
        console.log('显示活动模态框');

        const modal = $('#activity-modal');
        const form = $('#activity-form')[0];

        // 重置表单
        form.reset();
        editingId = null;

        if (activityData) {
            // 编辑模式
            $('#modal-title').text('编辑活动');
            editingId = activityData.id;

            // 填充表单数据
            $('#activity-id').val(activityData.id);
            $('#activity-title').val(activityData.title);
            $('#activity-publisher').val(activityData.publisher);
            $('#activity-status').val(activityData.status);
            $('#activity-summary').val(activityData.summary);
            $('#activity-content').val(activityData.content);
            $('#is-important').prop('checked', activityData.isImportant);

            // 处理时间字段
            if (activityData.publishTime) {
                $('#publish-time').val(formatDateTimeForInput(activityData.publishTime));
            }
            if (activityData.deadlineTime) {
                $('#deadline-time').val(formatDateTimeForInput(activityData.deadlineTime));
            }
        } else {
            // 新建模式
            $('#modal-title').text('新建活动');
            $('#activity-publisher').val(currentUser ? currentUser.username : '');
            $('#publish-time').val(formatDateTimeForInput(new Date()));
        }

        modal.show();
    }

    function closeActivityModal() {
        $('#activity-modal').hide();
        editingId = null;
    }

    function closeDeleteModal() {
        $('#delete-modal').hide();
    }

    function closeModal() {
        $('.modal').hide();
        editingId = null;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        console.log('表单提交');

        const status = $('#activity-status').val();
        saveActivity(status);
    }

    function saveActivity(status) {
        console.log('保存活动，状态:', status);

        const formData = {
            title: $('#activity-title').val().trim(),
            content: $('#activity-content').val().trim(),
            type: 'ACTIVITY', // 固定为活动类型
            status: status,
            publisher: $('#activity-publisher').val().trim(),
            summary: $('#activity-summary').val().trim(),
            isImportant: $('#is-important').is(':checked'),
            publishTime: $('#publish-time').val(),
            deadlineTime: $('#deadline-time').val() || null
        };

        // 验证必填字段
        if (!formData.title) {
            showMessage('请输入活动标题', 'error');
            return;
        }
        if (!formData.content) {
            showMessage('请输入活动内容', 'error');
            return;
        }

        const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
        const method = editingId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                console.log('保存成功:', response);
                showMessage(editingId ? '活动更新成功' : '活动创建成功', 'success');
                closeActivityModal();
                loadActivities();
            },
            error: function(xhr, status, error) {
                console.error('保存失败:', error);
                showMessage('保存失败: ' + (xhr.responseJSON?.message || error), 'error');
            }
        });
    }

    function editActivity(id) {
        console.log('编辑活动:', id);

        $.ajax({
            url: `/api/announcements/${id}`,
            method: 'GET',
            success: function(activity) {
                console.log('获取活动数据成功:', activity);
                showActivityModal(activity);
            },
            error: function(xhr, status, error) {
                console.error('获取活动数据失败:', error);
                showMessage('获取活动数据失败', 'error');
            }
        });
    }

    function publishActivity(id) {
        console.log('发布活动:', id);

        $.ajax({
            url: `/api/announcements/${id}/publish`,
            method: 'PUT',
            success: function(response) {
                console.log('发布成功:', response);
                showMessage('活动发布成功', 'success');
                loadActivities();
            },
            error: function(xhr, status, error) {
                console.error('发布失败:', error);
                showMessage('发布失败: ' + (xhr.responseJSON?.message || error), 'error');
            }
        });
    }

    function unpublishActivity(id) {
        console.log('取消发布活动:', id);

        $.ajax({
            url: `/api/announcements/${id}/unpublish`,
            method: 'PUT',
            success: function(response) {
                console.log('取消发布成功:', response);
                showMessage('活动已取消发布', 'success');
                loadActivities();
            },
            error: function(xhr, status, error) {
                console.error('取消发布失败:', error);
                showMessage('取消发布失败: ' + (xhr.responseJSON?.message || error), 'error');
            }
        });
    }

    function deleteActivity(id, title) {
        console.log('删除活动:', id, title);

        $('#delete-title').text(title);
        $('#delete-modal').show();

        $('#confirm-delete-btn').off('click').on('click', function() {
            $.ajax({
                url: `/api/announcements/${id}`,
                method: 'DELETE',
                success: function(response) {
                    console.log('删除成功:', response);
                    showMessage('活动删除成功', 'success');
                    closeDeleteModal();
                    loadActivities();
                },
                error: function(xhr, status, error) {
                    console.error('删除失败:', error);
                    showMessage('删除失败: ' + (xhr.responseJSON?.message || error), 'error');
                }
            });
        });
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

        // 上一页
        const prevBtn = $(`
            <button class="pagination-btn ${currentPageNum === 0 ? 'disabled' : ''}" data-page="${currentPageNum - 1}">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
        `);
        container.append(prevBtn);

        // 页码
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

        // 下一页
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

        // 绑定分页点击事件
        container.find('.pagination-btn:not(.disabled)').click(function() {
            const page = $(this).data('page');
            if (page !== undefined && page !== currentPageNum) {
                currentPage = page;
                loadActivities();
            }
        });
    }

    function formatDateTimeForInput(dateTime) {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
});
