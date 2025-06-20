/**
 * 用户管理JavaScript文件
 * 演示jQuery与Spring Boot后端API的交互
 */

// API基础URL
const API_BASE_URL = '/api/users';

// 页面加载完成后执行
$(document).ready(function() {
    loadUsers();
    
    // 绑定表单提交事件
    $('#user-form').on('submit', function(e) {
        e.preventDefault();
        submitUser();
    });
});

/**
 * 加载所有用户
 */
function loadUsers() {
    showLoading(true);
    
    $.ajax({
        url: API_BASE_URL,
        method: 'GET',
        success: function(users) {
            displayUsers(users);
            showLoading(false);
        },
        error: function(xhr, status, error) {
            showMessage('加载用户列表失败: ' + error, 'error');
            showLoading(false);
        }
    });
}

/**
 * 显示用户列表
 */
function displayUsers(users) {
    const tbody = $('#users-tbody');
    tbody.empty();
    
    if (users.length === 0) {
        tbody.append('<tr><td colspan="7" style="text-align:center;">暂无用户数据</td></tr>');
        return;
    }
    
    users.forEach(function(user) {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.description || '无'}</td>
                <td>${formatDateTime(user.createdAt)}</td>
                <td>
                    <button class="btn" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

/**
 * 提交用户表单（添加或更新）
 */
function submitUser() {
    const userId = $('#user-id').val();
    const userData = {
        username: $('#username').val().trim(),
        email: $('#email').val().trim(),
        phone: $('#phone').val().trim(),
        description: $('#description').val().trim()
    };
    
    // 简单验证
    if (!userData.username || !userData.email || !userData.phone) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    const isEdit = userId !== '';
    const url = isEdit ? `${API_BASE_URL}/${userId}` : API_BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            if (response.success) {
                showMessage(response.message, 'success');
                resetForm();
                loadUsers();
            } else {
                showMessage(response.message, 'error');
            }
        },
        error: function(xhr, status, error) {
            let errorMessage = '操作失败';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            showMessage(errorMessage, 'error');
        }
    });
}

/**
 * 编辑用户
 */
function editUser(userId) {
    $.ajax({
        url: `${API_BASE_URL}/${userId}`,
        method: 'GET',
        success: function(user) {
            $('#user-id').val(user.id);
            $('#username').val(user.username);
            $('#email').val(user.email);
            $('#phone').val(user.phone);
            $('#description').val(user.description || '');
            
            $('#submit-btn').text('更新用户');
            $('#cancel-btn').show();
            
            // 滚动到表单
            $('html, body').animate({
                scrollTop: $('.form-container').offset().top - 100
            }, 500);
        },
        error: function(xhr, status, error) {
            showMessage('获取用户信息失败: ' + error, 'error');
        }
    });
}

/**
 * 删除用户
 */
function deleteUser(userId) {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复！')) {
        return;
    }
    
    $.ajax({
        url: `${API_BASE_URL}/${userId}`,
        method: 'DELETE',
        success: function(response) {
            if (response.success) {
                showMessage(response.message, 'success');
                loadUsers();
            } else {
                showMessage(response.message, 'error');
            }
        },
        error: function(xhr, status, error) {
            let errorMessage = '删除失败';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            showMessage(errorMessage, 'error');
        }
    });
}

/**
 * 重置表单
 */
function resetForm() {
    $('#user-form')[0].reset();
    $('#user-id').val('');
    $('#submit-btn').text('添加用户');
    $('#cancel-btn').hide();
}

/**
 * 显示消息
 */
function showMessage(message, type) {
    const messageContainer = $('#message-container');
    const messageDiv = `<div class="message ${type}">${message}</div>`;
    
    messageContainer.html(messageDiv);
    
    // 3秒后自动隐藏消息
    setTimeout(function() {
        messageContainer.empty();
    }, 3000);
}

/**
 * 显示/隐藏加载状态
 */
function showLoading(show) {
    if (show) {
        $('#loading').show();
        $('#users-table').hide();
    } else {
        $('#loading').hide();
        $('#users-table').show();
    }
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '无';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
