// 新的用户管理页面JavaScript
$(document).ready(function() {
    // 全局变量
    let currentPage = 0;
    let pageSize = 10;
    let currentRole = '';
    let currentStatus = '';
    let currentKeyword = '';
    let editingId = null;
    
    // 直接初始化（简化权限检查）
    console.log('用户管理页面开始初始化');
    init();
    
    function init() {
        console.log('初始化用户管理页面');
        window.pageInitialized = true;

        // 获取当前用户信息并更新侧边栏头像
        const currentUser = getCurrentUser();
        if (typeof AvatarUtils !== 'undefined') {
            AvatarUtils.updateSidebarAvatar(currentUser);
        }

        // 确保表格容器可见
        $('.table-container').show();
        $('#loading').hide();
        $('#empty-state').hide();

        // 绑定事件
        bindEvents();

        // 加载统计信息
        loadStatistics();

        // 加载数据
        loadUsers();
    }
    
    function bindEvents() {
        // 操作按钮
        $('#add-user-btn').click(() => showUserModal());
        $('#refresh-btn').click(() => {
            clearFilters();
            loadUsers();
        });
        $('#export-btn').click(() => exportUsers());

        // 筛选器
        $('#role-filter, #status-filter').change(() => {
            currentRole = $('#role-filter').val();
            currentStatus = $('#status-filter').val();
            currentPage = 0;
            loadUsers();
        });

        // 搜索
        $('#search-btn').click(performSearch);
        $('#search-input').keypress(function(e) {
            if (e.which === 13) performSearch();
        });

        // 清除筛选
        $('#clear-filters-btn').click(() => {
            clearFilters();
            loadUsers();
        });

        // 实时搜索（输入时延迟搜索）
        let searchTimeout;
        $('#search-input').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500); // 500ms延迟
        });

        // 表单提交
        $('#user-form').submit(handleFormSubmit);

        // 模态框关闭
        $('.modal-close').click(closeModal);
        $('.modal').click(function(e) {
            if (e.target === this) closeModal();
        });
    }

    function clearFilters() {
        currentRole = '';
        currentStatus = '';
        currentKeyword = '';
        currentPage = 0;

        $('#role-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');
    }
    
    function performSearch() {
        currentKeyword = $('#search-input').val().trim();
        currentPage = 0;
        loadUsers();
    }
    
    function loadUsers() {
        showLoading();

        let params = {
            page: currentPage,
            size: pageSize
        };

        // 添加筛选参数
        if (currentRole) params.role = currentRole;
        if (currentStatus) params.status = currentStatus;
        if (currentKeyword) params.keyword = currentKeyword;

        console.log('加载用户，参数:', params);

        $.ajax({
            url: '/api/users',
            method: 'GET',
            data: params,
            success: function(data) {
                hideLoading();
                console.log('用户数据加载成功:', data);
                renderUsersTable(data);
                renderPagination(data);
            },
            error: function(xhr, status, error) {
                hideLoading();
                showMessage('加载用户数据失败，请稍后重试', 'error');
                console.error('加载用户数据失败:', error);
            }
        });
    }
    
    function renderUsersTable(data) {
        console.log('开始渲染用户表格，分页数据:', data);
        const tbody = $('#users-tbody');

        // 确保数据是分页格式
        if (!data || !data.content) {
            console.error('数据格式错误，期望分页数据格式');
            tbody.empty();
            tbody.append('<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #dc3545;">数据加载错误</td></tr>');
            $('.table-container').show();
            return;
        }

        const users = data.content;
        console.log('当前页用户数据:', users);
        console.log('当前页用户数量:', users.length);
        console.log('总用户数量:', data.totalElements);

        if (!users || users.length === 0) {
            console.log('当前页没有用户数据');
            tbody.empty();
            tbody.append('<tr><td colspan="10" style="text-align:center; padding: 2rem;">当前页暂无用户数据</td></tr>');
            $('.table-container').show();
            return;
        }

        console.log(`开始渲染第 ${data.number + 1} 页的 ${users.length} 个用户`);
        tbody.empty();

        users.forEach(function(user, index) {
            console.log(`渲染用户 ${index + 1}:`, user.username);
            const row = createTableRow(user);
            tbody.append(row);
        });

        $('.table-container').show();
        console.log(`用户表格渲染完成 - 第 ${data.number + 1} 页，共 ${data.totalPages} 页`);
    }
    
    function createTableRow(user) {
        const statusClass = user.status.toLowerCase();
        const roleClass = user.role.toLowerCase();
        const avatarPath = AvatarUtils.getUserAvatar(user.id);

        return $(`
            <tr data-id="${user.id}">
                <td>
                    <div class="user-avatar-cell">
                        <img src="${avatarPath}" alt="用户头像" class="user-avatar-small" onerror="this.style.display='none'">
                    </div>
                </td>
                <td>
                    <div class="user-info-cell">
                        <strong>${escapeHtml(user.username)}</strong>
                        ${user.studentId ? `<br><small>ID: ${escapeHtml(user.studentId)}</small>` : ''}
                    </div>
                </td>
                <td>${escapeHtml(user.realName || '-')}</td>
                <td>
                    <span class="role-badge ${roleClass}">
                        <i class="fas fa-${getRoleIcon(user.role)}"></i>
                        ${getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${getStatusDisplayName(user.status)}
                    </span>
                </td>
                <td>${escapeHtml(user.password)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.department || '-')}</td>
                <td>
                    ${user.lastLoginTime ? formatDateTime(user.lastLoginTime) : '从未登录'}
                    ${user.loginCount ? `<br><small>登录${user.loginCount}次</small>` : ''}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        ${user.status === 'ACTIVE' ? 
                            `<button class="action-btn unpublish" onclick="toggleUserStatus(${user.id}, 'INACTIVE')">
                                <i class="fas fa-ban"></i> 禁用
                            </button>` : 
                            `<button class="action-btn publish" onclick="toggleUserStatus(${user.id}, 'ACTIVE')">
                                <i class="fas fa-check"></i> 启用
                            </button>`
                        }
                        <button class="action-btn delete" onclick="deleteUser(${user.id}, '${escapeHtml(user.username)}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </td>
            </tr>
        `);
    }
    
    function renderPagination(data) {
        const container = $('#pagination');
        const totalPages = data.totalPages;
        const currentPageNum = data.number;

        container.empty().show();

        // 每页显示条数选择器
        const pageSizeSelector = $(`
            <div class="page-size-selector">
                <label for="page-size-select">每页显示：</label>
                <select id="page-size-select" class="page-size-select">
                    <option value="5" ${pageSize === 5 ? 'selected' : ''}>5条</option>
                    <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条</option>
                    <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条</option>
                    <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条</option>
                    <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条</option>
                </select>
            </div>
        `);
        container.append(pageSizeSelector);

        // 绑定每页显示条数变化事件
        $('#page-size-select').change(function() {
            pageSize = parseInt($(this).val());
            currentPage = 0; // 重置到第一页
            loadUsers();
        });

        if (totalPages <= 1) {
            // 即使只有一页，也显示分页信息
            const info = $(`
                <span class="pagination-info">
                    共 ${data.totalElements} 条记录
                </span>
            `);
            container.append(info);
            return;
        }

        // 分页控制区域
        const paginationControls = $('<div class="pagination-controls"></div>');

        // 上一页
        const prevBtn = $(`
            <button class="pagination-btn ${currentPageNum === 0 ? 'disabled' : ''}" data-page="${currentPageNum - 1}">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
        `);
        paginationControls.append(prevBtn);

        // 页码
        const startPage = Math.max(0, currentPageNum - 2);
        const endPage = Math.min(totalPages - 1, currentPageNum + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = $(`
                <button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" data-page="${i}">
                    ${i + 1}
                </button>
            `);
            paginationControls.append(pageBtn);
        }

        // 下一页
        const nextBtn = $(`
            <button class="pagination-btn ${currentPageNum === totalPages - 1 ? 'disabled' : ''}" data-page="${currentPageNum + 1}">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `);
        paginationControls.append(nextBtn);

        container.append(paginationControls);

        // 分页信息
        const info = $(`
            <span class="pagination-info">
                第 ${currentPageNum + 1} 页，共 ${totalPages} 页，总计 ${data.totalElements} 条记录
            </span>
        `);
        container.append(info);

        // 绑定分页事件
        container.find('.pagination-btn:not(.disabled)').click(function() {
            const page = parseInt($(this).data('page'));
            if (!isNaN(page) && page !== currentPage) {
                currentPage = page;
                loadUsers();
            }
        });
    }
    
    function showUserModal(user = null) {
        editingId = user ? user.id : null;
        $('#modal-title').text(user ? '编辑用户' : '新建用户');
        
        if (user) {
            // 编辑模式，填充表单
            $('#user-id').val(user.id);
            $('#user-username').val(user.username);
            $('#user-email').val(user.email);
            $('#user-real-name').val(user.realName || '');
            $('#user-phone').val(user.phone);
            $('#user-role').val(user.role);
            $('#user-status').val(user.status);
            $('#user-student-id').val(user.studentId || '');
            $('#user-department').val(user.department || '');
            $('#user-description').val(user.description || '');
            $('#user-password').removeAttr('required').attr('placeholder', '留空则不修改密码');
        } else {
            // 新建模式，重置表单
            $('#user-form')[0].reset();
            $('#user-status').val('ACTIVE');
            $('#user-password').attr('required', 'required').attr('placeholder', '请输入密码');
        }
        
        // 显示模态框并添加动画类
        const modal = $('#user-modal');
        modal.show().addClass('show');

        // 聚焦到第一个输入框
        setTimeout(() => {
            $('#user-username').focus();
        }, 100);
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            username: $('#user-username').val(),
            email: $('#user-email').val(),
            realName: $('#user-real-name').val(),
            phone: $('#user-phone').val(),
            role: $('#user-role').val(),
            status: $('#user-status').val(),
            studentId: $('#user-student-id').val(),
            department: $('#user-department').val(),
            description: $('#user-description').val()
        };
        
        // 如果是新建用户或者密码字段有值，则包含密码
        const password = $('#user-password').val();
        if (!editingId || password) {
            formData.password = password;
        }
        
        const url = editingId ? `/api/users/${editingId}` : '/api/users';
        const method = editingId ? 'PUT' : 'POST';
        
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(data) {
                showMessage(editingId ? '用户更新成功' : '用户创建成功', 'success');
                closeModal();
                loadUsers();
            },
            error: function(xhr, status, error) {
                let errorMessage = '操作失败，请稍后重试';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                showMessage(errorMessage, 'error');
                console.error('用户操作失败:', error);
            }
        });
    }
    
    function closeModal() {
        const modal = $('.modal');
        modal.removeClass('show');

        // 延迟隐藏以播放关闭动画
        setTimeout(() => {
            modal.hide();
        }, 300);
    }
    
    function showLoading() {
        console.log('显示加载状态');
        $('#loading').show();
        $('.table-container').hide();
        $('#empty-state').hide();
    }

    function hideLoading() {
        console.log('隐藏加载状态');
        $('#loading').hide();
        $('.table-container').show();
    }
    
    function showMessage(message, type = 'info') {
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
    
    function showAccessDenied() {
        $('#content').html(`
            <div class="access-denied">
                <div class="access-denied-content">
                    <div class="access-denied-icon">
                        <i class="fas fa-ban"></i>
                    </div>
                    <h1>访问被拒绝</h1>
                    <p>只有管理员才能访问用户管理页面</p>
                    <div class="access-denied-actions">
                        <button onclick="history.back()" class="btn btn-secondary">返回上页</button>
                        <button onclick="window.location.href='dashboard.html'" class="btn btn-primary">返回首页</button>
                    </div>
                </div>
            </div>
        `);
    }
    
    // 工具函数
    function getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

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
    
    function getRoleDisplayName(role) {
        const roleMap = {
            'ADMIN': '管理员',
            'TEACHER': '教师',
            'STUDENT': '学生',
            'GUEST': '游客'
        };
        return roleMap[role] || role;
    }
    
    function getStatusDisplayName(status) {
        const statusMap = {
            'ACTIVE': '正常',
            'INACTIVE': '禁用',
            'PENDING': '待审核',
            'LOCKED': '锁定'
        };
        return statusMap[status] || status;
    }
    
    function getRoleIcon(role) {
        const iconMap = {
            'ADMIN': 'user-shield',
            'TEACHER': 'chalkboard-teacher',
            'STUDENT': 'user-graduate',
            'GUEST': 'user'
        };
        return iconMap[role] || 'user';
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
    
    // 全局函数（供HTML调用）
    window.editUser = function(id) {
        $.ajax({
            url: `/api/users/${id}`,
            method: 'GET',
            success: function(user) {
                showUserModal(user);
            },
            error: function(xhr, status, error) {
                showMessage('加载用户数据失败', 'error');
                console.error('加载用户数据失败:', error);
            }
        });
    };
    
    window.toggleUserStatus = function(id, newStatus) {
        $.ajax({
            url: `/api/users/${id}/status`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: newStatus }),
            success: function() {
                showMessage('用户状态更新成功', 'success');
                loadUsers();
            },
            error: function(xhr, status, error) {
                showMessage('状态更新失败，请稍后重试', 'error');
                console.error('状态更新失败:', error);
            }
        });
    };
    
    window.deleteUser = function(id, username) {
        $('#delete-username').text(username);
        $('#confirm-delete-btn').off('click').on('click', function() {
            $.ajax({
                url: `/api/users/${id}`,
                method: 'DELETE',
                success: function() {
                    showMessage('用户删除成功', 'success');
                    closeModal();
                    loadUsers();
                },
                error: function(xhr, status, error) {
                    showMessage('删除失败，请稍后重试', 'error');
                    console.error('删除失败:', error);
                }
            });
        });
        $('#delete-modal').show();
    };
    
    window.showUserModal = showUserModal;
    window.closeUserModal = closeModal;
    window.closeDeleteModal = closeModal;
    
    function loadStatistics() {
        $.ajax({
            url: '/api/users/statistics',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    displayStatistics(response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('加载统计信息失败:', error);
            }
        });
    }

    function displayStatistics(stats) {
        $('#total-users').text(stats.totalUsers || 0);
        $('#active-users').text(stats.activeUsers || 0);
        $('#recent-login-users').text(stats.recentLoginUsers || 0);
        $('#admin-users').text(stats.roleStats?.ADMIN || 0);

        // 显示统计卡片
        $('#stats-cards').show();
    }

    function exportUsers() {
        showMessage('导出功能开发中...', 'info');
    }
});
