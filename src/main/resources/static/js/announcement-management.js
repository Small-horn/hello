// 公告管理页面JavaScript
$(document).ready(function() {
    // 全局变量
    let currentPage = 0;
    let pageSize = 10;
    let currentStatus = '';
    let currentType = '';
    let currentKeyword = '';
    let quillEditor = null;
    let editingId = null;
    let isInitialized = false;
    let currentUser = null; // 存储当前用户信息

    console.log('公告管理页面开始加载...');

    // 等待DOM完全加载后再检查权限
    setTimeout(() => {
        console.log('开始权限检查和初始化...');
        checkPermissionAndInit();
    }, 500);

    function checkPermissionAndInit() {
        console.log('开始简化的初始化流程...');

        // 简化权限检查，直接初始化页面
        $.ajax({
            url: '/api/auth/current',
            method: 'GET',
            timeout: 3000,
            success: function(response) {
                console.log('权限检查响应:', response);
                currentUser = response.success && response.authenticated ? response.user : null;
                init(currentUser);

                if (!currentUser) {
                    showMessage('未登录，功能受限', 'warning');
                } else if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
                    showMessage('权限不足，只能查看数据', 'warning');
                }
            },
            error: function(xhr, status, error) {
                console.log('权限检查失败，直接初始化页面:', error);
                init(null);
                showMessage('权限检查失败，功能受限', 'warning');
            }
        });
    }

    function init(user) {
        if (isInitialized) return;
        isInitialized = true;

        console.log('开始初始化页面，用户:', user);

        // 更新侧边栏头像（传入用户对象，使用预计算的头像路径）
        if (typeof AvatarUtils !== 'undefined') {
            AvatarUtils.updateSidebarAvatar(user);
        }

        // 检查必要的DOM元素
        const tbody = $('#announcements-tbody');
        const table = $('#announcements-table');
        const loading = $('#loading');

        console.log('DOM元素检查:');
        console.log('- tbody:', tbody.length);
        console.log('- table:', table.length);
        console.log('- loading:', loading.length);

        if (tbody.length === 0) {
            console.error('找不到表格tbody元素，初始化失败');
            showMessage('页面初始化失败：找不到表格元素', 'error');
            return;
        }

        // 初始化富文本编辑器（仅在有编辑权限时）
        if (user && (user.role === 'ADMIN' || user.role === 'TEACHER')) {
            try {
                initQuillEditor();
            } catch (e) {
                console.warn('富文本编辑器初始化失败:', e);
            }
        } else {
            console.log('无编辑权限，跳过富文本编辑器初始化');
        }

        // 绑定事件
        bindEvents(user);

        // 直接加载数据，不添加测试数据
        console.log('开始加载公告数据...');
        loadAnnouncements();
    }

    // 删除了未使用的测试数据函数、重定向函数和访问拒绝函数
    
    function initQuillEditor() {
        quillEditor = new Quill('#editor-container', {
            theme: 'snow',
            placeholder: '请输入公告内容...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }
    
    function bindEvents(user) {
        // 基础功能：刷新和筛选（所有用户都可以使用）
        $('#refresh-btn').click(() => loadAnnouncements());

        // 筛选器
        $('#status-filter, #type-filter').change(() => {
            currentStatus = $('#status-filter').val();
            currentType = $('#type-filter').val();
            currentPage = 0;
            loadAnnouncements();
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

            // 操作按钮
            $('#add-announcement-btn').click(() => showAnnouncementModal('ANNOUNCEMENT'));
            $('#add-activity-btn').click(() => showAnnouncementModal('ACTIVITY'));

            // 表单提交
            $('#announcement-form').submit(handleFormSubmit);

            // 保存草稿
            $('#save-draft-btn').click(() => saveAnnouncement('DRAFT'));

            // 模态框关闭
            $('.modal-close').click(closeModal);
            $('.modal').click(function(e) {
                if (e.target === this) closeModal();
            });
        } else {
            console.log('无编辑权限，隐藏编辑按钮');
            // 隐藏编辑相关的按钮
            $('#add-announcement-btn, #add-activity-btn').hide();
        }
    }
    
    function performSearch() {
        currentKeyword = $('#search-input').val().trim();
        currentPage = 0;
        loadAnnouncements();
    }

    // 清除搜索
    function clearSearch() {
        currentKeyword = '';
        $('#search-input').val('');
        currentPage = 0;
        loadAnnouncements();
    }

    // 清除所有筛选条件
    function clearAllFilters() {
        currentStatus = '';
        currentType = '';
        currentKeyword = '';
        currentPage = 0;

        // 重置表单元素
        $('#status-filter').val('');
        $('#type-filter').val('');
        $('#search-input').val('');

        loadAnnouncements();
    }

    // 验证筛选参数
    function validateFilterParams() {
        // 验证状态参数
        if (currentStatus && !['DRAFT', 'PUBLISHED', 'CANCELLED', 'EXPIRED'].includes(currentStatus)) {
            console.error('无效的状态参数:', currentStatus);
            return false;
        }

        // 验证类型参数
        if (currentType && !['ANNOUNCEMENT', 'ACTIVITY'].includes(currentType)) {
            console.error('无效的类型参数:', currentType);
            return false;
        }

        return true;
    }

    // 导出清除筛选函数供HTML调用
    window.clearAllFilters = clearAllFilters;
    
    function loadAnnouncements() {
        console.log('开始加载公告数据...');
        showLoading();
        updateFilterStatus(); // 更新筛选状态显示

        // 验证筛选参数
        if (!validateFilterParams()) {
            hideLoading();
            showMessage('筛选参数无效，请检查输入', 'error');
            return;
        }

        let url = '/api/announcements';
        let params = {
            page: currentPage,
            size: pageSize
        };

        // 添加筛选参数
        if (currentStatus) {
            params.status = currentStatus;
            console.log('添加状态筛选:', currentStatus);
        }
        if (currentType) {
            params.type = currentType;
            console.log('添加类型筛选:', currentType);
        }

        // 如果有搜索关键词，优先使用搜索接口
        if (currentKeyword) {
            url = '/api/announcements/search';
            params.keyword = currentKeyword;

            // 尝试在前端进行筛选（如果搜索接口不支持筛选）
            console.log('使用搜索接口，关键词:', currentKeyword);
            console.log('将在前端进行状态和类型筛选');
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

                // 如果是搜索结果且有筛选条件，在前端进行筛选
                if (currentKeyword && (currentStatus || currentType)) {
                    data = filterSearchResults(data);
                }

                renderAnnouncementsTable(data);
                renderPagination(data);
            },
            error: function(xhr, status, error) {
                console.error('数据加载失败详情:');
                console.error('- Status:', status);
                console.error('- Error:', error);
                console.error('- Response:', xhr.responseText);
                console.error('- Status Code:', xhr.status);
                console.error('- Request URL:', url);
                console.error('- Request Params:', params);

                hideLoading();

                let errorMessage = '加载数据失败';
                if (xhr.status === 500) {
                    errorMessage = '服务器内部错误，请检查筛选条件是否正确';
                } else if (xhr.status === 404) {
                    errorMessage = '请求的接口不存在';
                } else if (xhr.status === 403) {
                    errorMessage = '没有权限访问该数据';
                }

                showMessage(errorMessage, 'error');

                // 如果是筛选导致的错误，尝试回退到无筛选状态
                if (xhr.status === 500 && (currentStatus || currentType)) {
                    console.log('尝试回退到无筛选状态...');
                    setTimeout(() => {
                        clearAllFilters();
                    }, 2000);
                    return;
                }

                // 显示空状态
                $('#announcements-tbody').empty();
                $('#empty-state').show();
                $('.table-container').hide();
            }
        });
    }

    // 对搜索结果进行前端筛选
    function filterSearchResults(data) {
        if (!data.content || data.content.length === 0) {
            return data;
        }

        let filteredContent = data.content;

        // 状态筛选
        if (currentStatus) {
            filteredContent = filteredContent.filter(item => item.status === currentStatus);
        }

        // 类型筛选
        if (currentType) {
            filteredContent = filteredContent.filter(item => item.type === currentType);
        }

        console.log(`前端筛选：原始 ${data.content.length} 条，筛选后 ${filteredContent.length} 条`);

        // 返回筛选后的数据结构
        return {
            ...data,
            content: filteredContent,
            totalElements: filteredContent.length,
            totalPages: Math.ceil(filteredContent.length / pageSize),
            numberOfElements: filteredContent.length
        };
    }

    // 更新筛选状态显示
    function updateFilterStatus() {
        const filterInfo = [];

        if (currentStatus) {
            filterInfo.push(`状态: ${getStatusDisplayName(currentStatus)}`);
        }
        if (currentType) {
            filterInfo.push(`类型: ${getTypeDisplayName(currentType)}`);
        }
        if (currentKeyword) {
            filterInfo.push(`搜索: "${currentKeyword}"`);
        }

        const filterStatusEl = $('#filter-status');
        if (filterInfo.length > 0) {
            if (filterStatusEl.length === 0) {
                // 创建筛选状态显示元素
                const statusHtml = `
                    <div id="filter-status" class="filter-status">
                        <span class="filter-label">当前筛选：</span>
                        <span class="filter-items">${filterInfo.join(' | ')}</span>
                        <button class="clear-filters-btn" onclick="clearAllFilters()">
                            <i class="fas fa-times"></i> 清除筛选
                        </button>
                    </div>
                `;
                $('.management-filter').after(statusHtml);
            } else {
                filterStatusEl.find('.filter-items').text(filterInfo.join(' | '));
                filterStatusEl.show();
            }
        } else {
            filterStatusEl.hide();
        }
    }
    
    function renderAnnouncementsTable(data) {
        console.log('开始渲染公告表格，数据:', data);

        const tbody = $('#announcements-tbody');
        const announcements = data.content;

        console.log('表格tbody元素:', tbody.length);
        console.log('公告数据数量:', announcements ? announcements.length : 0);

        if (!announcements || announcements.length === 0) {
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

        announcements.forEach(function(announcement, index) {
            console.log(`渲染第 ${index + 1} 条数据:`, announcement.title);
            const row = createTableRow(announcement);
            tbody.append(row);
        });

        console.log('表格渲染完成');
    }
    
    function createTableRow(announcement) {
        const statusClass = announcement.status.toLowerCase();
        const typeClass = announcement.type.toLowerCase();
        
        return $(`
            <tr data-id="${announcement.id}">
                <td>
                    <div class="title-cell">
                        ${announcement.isImportant ? '<i class="fas fa-star" style="color: #dc3545; margin-right: 5px;"></i>' : ''}
                        ${escapeHtml(announcement.title)}
                    </div>
                </td>
                <td>
                    <span class="type-badge ${typeClass}">
                        ${getTypeDisplayName(announcement.type)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${getStatusDisplayName(announcement.status)}
                    </span>
                </td>
                <td>${escapeHtml(announcement.publisher || '系统')}</td>
                <td>${formatDateTime(announcement.publishTime)}</td>
                <td>${announcement.viewCount}</td>
                <td>
                    <div class="action-buttons">
                        ${getActionButtons(announcement)}
                    </div>
                </td>
            </tr>
        `);
    }

    // 根据用户权限生成操作按钮
    function getActionButtons(announcement) {
        // 如果用户没有编辑权限，只显示查看按钮
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER')) {
            return `
                <button class="action-btn view" onclick="viewAnnouncement(${announcement.id})">
                    <i class="fas fa-eye"></i> 查看
                </button>
            `;
        }

        // 有编辑权限，显示完整的操作按钮
        return `
            <button class="action-btn edit" onclick="editAnnouncement(${announcement.id})">
                <i class="fas fa-edit"></i> 编辑
            </button>
            ${(announcement.status === 'DRAFT' || announcement.status === 'CANCELLED') ?
                `<button class="action-btn publish" onclick="publishAnnouncement(${announcement.id})">
                    <i class="fas fa-upload"></i> 发布
                </button>` :
                `<button class="action-btn unpublish" onclick="unpublishAnnouncement(${announcement.id})">
                    <i class="fas fa-download"></i> 取消发布
                </button>`
            }
            <button class="action-btn delete" onclick="deleteAnnouncement(${announcement.id}, '${escapeHtml(announcement.title)}')">
                <i class="fas fa-trash"></i> 删除
            </button>
        `;
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
        
        // 绑定分页事件
        container.find('.pagination-btn:not(.disabled)').click(function() {
            const page = parseInt($(this).data('page'));
            if (!isNaN(page) && page !== currentPage) {
                currentPage = page;
                loadAnnouncements();
            }
        });
    }
    
    function showAnnouncementModal(type = 'ANNOUNCEMENT') {
        // 检查权限
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER')) {
            showMessage('您没有权限创建公告', 'error');
            return;
        }

        editingId = null;
        $('#modal-title').text(type === 'ACTIVITY' ? '新建活动' : '新建公告');
        $('#announcement-form')[0].reset();
        $('#announcement-type').val(type);
        $('#announcement-status').val('DRAFT');

        // 只有在富文本编辑器存在时才设置内容
        if (quillEditor) {
            quillEditor.setContents([]);
        }

        // 设置默认发布时间为当前时间
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        $('#publish-time').val(localDateTime);

        $('#announcement-modal').show();
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const status = $('#announcement-status').val();
        saveAnnouncement(status);
    }
    
    function saveAnnouncement(status) {
        // 检查权限
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER')) {
            showMessage('您没有权限保存公告', 'error');
            return;
        }

        // 获取富文本编辑器内容
        const content = quillEditor ? quillEditor.root.innerHTML : $('#announcement-content').val();
        $('#announcement-content').val(content);

        // 设置状态
        $('#announcement-status').val(status);
        
        const formData = {
            title: $('#announcement-title').val(),
            content: content,
            type: $('#announcement-type').val(),
            status: status,
            publisher: $('#announcement-publisher').val(),
            publishTime: $('#publish-time').val(),
            deadlineTime: $('#deadline-time').val() || null,
            summary: $('#announcement-summary').val(),
            isImportant: $('#is-important').is(':checked')
        };
        
        const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
        const method = editingId ? 'PUT' : 'POST';
        
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(data) {
                showMessage(editingId ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadAnnouncements();
            },
            error: function(xhr, status, error) {
                showMessage('保存失败，请稍后重试', 'error');
                console.error('保存失败:', error);
            }
        });
    }
    
    function closeModal() {
        $('.modal').hide();
    }
    
    function showLoading() {
        $('#loading').show();
        $('.table-container').hide();
        $('#empty-state').hide();
    }
    
    function hideLoading() {
        $('#loading').hide();
    }
    
    function showMessage(message, type = 'info') {
        // 优先使用全局的showMessage函数
        if (typeof window.showMessage === 'function') {
            window.showMessage(message, type);
            return;
        }

        // 备用的本地消息显示
        const messageHtml = `
            <div class="message ${type}">
                <i class="fas fa-${getMessageIcon(type)}"></i>
                ${message}
            </div>
        `;

        const messageElement = $(messageHtml);
        $('#message-container').append(messageElement);

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
    
    function getStatusDisplayName(status) {
        const statusMap = {
            'DRAFT': '草稿',
            'PUBLISHED': '已发布',
            'EXPIRED': '已过期',
            'CANCELLED': '已取消'
        };
        return statusMap[status] || status;
    }
    
    // 全局函数（供HTML调用）
    window.editAnnouncement = function(id) {
        editingId = id;

        $.ajax({
            url: `/api/announcements/${id}`,
            method: 'GET',
            success: function(data) {
                $('#modal-title').text('编辑' + getTypeDisplayName(data.type));
                $('#announcement-id').val(data.id);
                $('#announcement-title').val(data.title);
                $('#announcement-type').val(data.type);
                $('#announcement-status').val(data.status);
                $('#announcement-publisher').val(data.publisher || '');
                $('#announcement-summary').val(data.summary || '');
                $('#is-important').prop('checked', data.isImportant);

                // 设置时间
                if (data.publishTime) {
                    const publishTime = new Date(data.publishTime);
                    const localDateTime = new Date(publishTime.getTime() - publishTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    $('#publish-time').val(localDateTime);
                }

                if (data.deadlineTime) {
                    const deadlineTime = new Date(data.deadlineTime);
                    const localDateTime = new Date(deadlineTime.getTime() - deadlineTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    $('#deadline-time').val(localDateTime);
                }

                // 设置富文本内容
                quillEditor.root.innerHTML = data.content;

                $('#announcement-modal').show();
            },
            error: function(xhr, status, error) {
                showMessage('加载公告数据失败', 'error');
                console.error('加载公告数据失败:', error);
            }
        });
    };

    window.publishAnnouncement = function(id) {
        $.ajax({
            url: `/api/announcements/${id}/publish`,
            method: 'PUT',
            success: function(data) {
                showMessage('发布成功', 'success');
                loadAnnouncements();
            },
            error: function(xhr, status, error) {
                showMessage('发布失败，请稍后重试', 'error');
                console.error('发布失败:', error);
            }
        });
    };

    window.unpublishAnnouncement = function(id) {
        $.ajax({
            url: `/api/announcements/${id}/unpublish`,
            method: 'PUT',
            success: function(data) {
                showMessage('取消发布成功', 'success');
                loadAnnouncements();
            },
            error: function(xhr, status, error) {
                showMessage('取消发布失败，请稍后重试', 'error');
                console.error('取消发布失败:', error);
            }
        });
    };

    window.deleteAnnouncement = function(id, title) {
        $('#delete-title').text(title);
        $('#confirm-delete-btn').off('click').on('click', function() {
            $.ajax({
                url: `/api/announcements/${id}`,
                method: 'DELETE',
                success: function() {
                    showMessage('删除成功', 'success');
                    closeModal();
                    loadAnnouncements();
                },
                error: function(xhr, status, error) {
                    showMessage('删除失败，请稍后重试', 'error');
                    console.error('删除失败:', error);
                }
            });
        });
        $('#delete-modal').show();
    };

    // 查看公告（只读模式）
    window.viewAnnouncement = function(id) {
        window.location.href = `announcement-detail.html?id=${id}`;
    };

    window.showAnnouncementModal = showAnnouncementModal;
    window.closeAnnouncementModal = closeModal;
    window.closeDeleteModal = closeModal;
});
