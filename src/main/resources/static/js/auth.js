// 认证相关JavaScript
$(document).ready(function() {
    // 全局变量
    let currentUser = null;
    let isLoggingIn = false;
    
    // 初始化
    init();
    
    function init() {
        // 只在登录页面检查是否已登录
        if (isLoginPage()) {
            checkAuthStatus();
        }

        // 绑定事件
        bindEvents();

        // 初始化密码显示/隐藏功能
        initPasswordToggle();
    }

    function isLoginPage() {
        const currentPage = window.location.pathname;
        return currentPage.endsWith('index.html') || currentPage === '/' || currentPage.endsWith('/');
    }
    
    function bindEvents() {
        // 登录表单提交
        $('#login-form').submit(handleLogin);

        // 快速登录按钮
        $('.quick-btn').click(handleQuickLogin);

        // 密码显示/隐藏 - 使用事件委托确保绑定成功
        $(document).on('click', '#password-toggle', togglePasswordVisibility);

        // 回车键登录
        $('#username, #password').keypress(function(e) {
            if (e.which === 13 && !isLoggingIn) {
                $('#login-form').submit();
            }
        });

        // 忘记密码
        $('.forgot-password').click(function(e) {
            e.preventDefault();
            showMessage('请联系系统管理员重置密码', 'info');
        });
    }

    function initPasswordToggle() {
        // 等待DOM完全加载
        setTimeout(function() {
            const passwordInput = $('#password');
            const toggleBtn = $('#password-toggle');

            console.log('初始化密码切换功能...');
            console.log('密码输入框数量:', passwordInput.length);
            console.log('切换按钮数量:', toggleBtn.length);

            // 确保密码切换按钮存在
            if (toggleBtn.length === 0) {
                console.warn('密码切换按钮未找到');
                return;
            }

            if (passwordInput.length === 0) {
                console.warn('密码输入框未找到');
                return;
            }

            // 清理可能的重复图标
            const existingIcons = toggleBtn.find('i');
            if (existingIcons.length > 1) {
                console.log('发现重复图标，清理中...');
                existingIcons.slice(1).remove(); // 保留第一个，删除其余的
            }

            // 确保只有一个图标
            let icon = toggleBtn.find('i').first();
            if (icon.length === 0) {
                // 如果没有图标，创建一个
                icon = $('<i class="fas fa-eye" id="password-toggle-icon"></i>');
                toggleBtn.append(icon);
                console.log('创建了新的密码切换图标');
            }

            // 确保初始状态正确
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
            toggleBtn.attr('title', '显示密码');

            console.log('密码切换功能已初始化');
            console.log('最终图标数量:', toggleBtn.find('i').length);
            console.log('初始图标类:', icon.attr('class'));

            // 手动绑定点击事件作为备用
            toggleBtn.off('click.passwordToggle').on('click.passwordToggle', function(e) {
                console.log('备用密码切换事件被触发');
                togglePasswordVisibility(e);
            });

        }, 100); // 延迟100ms确保DOM加载完成
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        if (isLoggingIn) return;
        
        const username = $('#username').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');
        
        // 验证输入
        if (!username) {
            showMessage('请输入用户名', 'error');
            $('#username').focus();
            return;
        }
        
        if (!password) {
            showMessage('请输入密码', 'error');
            $('#password').focus();
            return;
        }
        
        // 执行登录
        performLogin(username, password, rememberMe);
    }
    
    function handleQuickLogin() {
        const username = $(this).data('username');
        const password = $(this).data('password');
        
        // 填充表单
        $('#username').val(username);
        $('#password').val(password);
        
        // 执行登录
        performLogin(username, password, false);
    }
    
    function performLogin(username, password, rememberMe) {
        isLoggingIn = true;
        showLoading();
        
        const loginData = {
            username: username,
            password: password
        };
        
        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function(response) {
                hideLoading();
                isLoggingIn = false;
                
                if (response.success) {
                    currentUser = response.user;

                    // 计算并添加用户头像路径
                    if (currentUser && currentUser.id) {
                        const avatarNumber = ((currentUser.id - 1) % 17) + 1;
                        currentUser.avatarPath = `images/picture/${String(avatarNumber).padStart(6, '0')}.webp`;
                    } else {
                        currentUser.avatarPath = 'images/avatar.jpg';
                    }

                    // 保存用户信息到localStorage（如果选择记住我）
                    if (rememberMe) {
                        localStorage.setItem('rememberedUsername', username);
                    } else {
                        localStorage.removeItem('rememberedUsername');
                    }

                    // 保存当前用户信息到sessionStorage（包含头像路径）
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    showMessage('登录成功，正在跳转...', 'success');

                    // 延迟跳转到目标页面
                    setTimeout(function() {
                        // 检查是否有保存的重定向URL
                        const redirectUrl = sessionStorage.getItem('redirectUrl');
                        if (redirectUrl && redirectUrl !== window.location.href) {
                            sessionStorage.removeItem('redirectUrl');
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1200);
                } else {
                    showMessage(response.message || '登录失败', 'error');
                }
            },
            error: function(xhr, status, error) {
                hideLoading();
                isLoggingIn = false;
                
                let errorMessage = '登录失败，请稍后重试';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                showMessage(errorMessage, 'error');
                console.error('登录错误:', error);
            }
        });
    }
    
    function checkAuthStatus() {
        // 检查是否已登录
        $.ajax({
            url: '/api/auth/current',
            method: 'GET',
            success: function(response) {
                if (response.success && response.authenticated) {
                    // 已登录，检查是否有重定向URL
                    const redirectUrl = sessionStorage.getItem('redirectUrl');
                    if (redirectUrl && redirectUrl !== window.location.href) {
                        sessionStorage.removeItem('redirectUrl');
                        window.location.href = redirectUrl;
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    // 未登录，显示登录页面
                    loadRememberedUsername();
                }
            },
            error: function() {
                // 检查失败，显示登录页面
                loadRememberedUsername();
            }
        });
    }
    
    function loadRememberedUsername() {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            $('#username').val(rememberedUsername);
            $('#remember-me').prop('checked', true);
            $('#password').focus();
        } else {
            $('#username').focus();
        }
    }
    
    function showLoading() {
        $('#login-btn').prop('disabled', true);
        $('.btn-text').text('登录中...');
        $('.btn-loading').show();
    }
    
    function hideLoading() {
        $('#login-btn').prop('disabled', false);
        $('.btn-text').text('登录');
        $('.btn-loading').hide();
    }
    
    function showMessage(message, type = 'info') {
        const messageHtml = `
            <div class="message ${type}">
                <i class="fas fa-${getMessageIcon(type)}"></i>
                ${message}
            </div>
        `;
        
        const messageContainer = $('#message-container');
        messageContainer.html(messageHtml);
        
        // 3秒后自动消失
        setTimeout(function() {
            messageContainer.find('.message').fadeOut(function() {
                $(this).remove();
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
    
    function togglePasswordVisibility(e) {
        e.preventDefault();
        e.stopPropagation();

        const passwordInput = $('#password');
        const toggleBtn = $('#password-toggle');

        // 确保只操作第一个图标
        const icon = toggleBtn.find('i').first();

        console.log('密码切换按钮被点击');
        console.log('当前密码输入框类型:', passwordInput.attr('type'));
        console.log('图标数量:', toggleBtn.find('i').length);

        if (passwordInput.attr('type') === 'password') {
            // 显示密码
            passwordInput.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
            toggleBtn.attr('title', '隐藏密码');
            console.log('密码已显示');
        } else {
            // 隐藏密码
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
            toggleBtn.attr('title', '显示密码');
            console.log('密码已隐藏');
        }
    }
    
    // 全局认证工具函数
    window.AuthUtils = {
        // 初始化函数
        init: function() {
            console.log('AuthUtils.init() 被调用');
            initPasswordToggle();
        },

        // 获取当前用户
        getCurrentUser: function() {
            const userStr = sessionStorage.getItem('currentUser');
            return userStr ? JSON.parse(userStr) : null;
        },
        
        // 检查是否已登录
        isAuthenticated: function() {
            return this.getCurrentUser() !== null;
        },
        
        // 检查用户角色
        hasRole: function(role) {
            const user = this.getCurrentUser();
            return user && user.role === role;
        },
        
        // 检查是否为管理员
        isAdmin: function() {
            return this.hasRole('ADMIN');
        },
        
        // 检查是否为教师
        isTeacher: function() {
            return this.hasRole('TEACHER');
        },
        
        // 检查是否为学生
        isStudent: function() {
            return this.hasRole('STUDENT');
        },
        
        // 检查是否为游客
        isGuest: function() {
            return this.hasRole('GUEST');
        },
        
        // 注销
        logout: function(showConfirm = true) {
            // 如果需要显示确认对话框
            if (showConfirm) {
                if (!confirm('确定要注销登录吗？')) {
                    return;
                }
            }

            // 显示注销中状态
            const logoutBtn = $('.logout-btn');
            const originalText = logoutBtn.html();
            logoutBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> 注销中...');

            $.ajax({
                url: '/api/auth/logout',
                method: 'POST',
                timeout: 10000, // 10秒超时
                success: function(response) {
                    // 清除本地存储
                    sessionStorage.removeItem('currentUser');
                    localStorage.removeItem('rememberedUsername');

                    // 显示成功消息
                    if (typeof showMessage === 'function') {
                        showMessage('注销成功，正在跳转...', 'success');
                    }

                    // 延迟跳转，让用户看到成功消息
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1000);
                },
                error: function(xhr, status, error) {
                    console.warn('注销API调用失败，但仍将清除本地数据:', error);

                    // 即使注销失败也清除本地数据并跳转
                    sessionStorage.removeItem('currentUser');
                    localStorage.removeItem('rememberedUsername');

                    // 显示警告消息
                    if (typeof showMessage === 'function') {
                        showMessage('注销完成，正在跳转...', 'warning');
                    }

                    // 延迟跳转
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1000);
                },
                complete: function() {
                    // 恢复按钮状态（如果还在当前页面）
                    if (logoutBtn.length) {
                        logoutBtn.prop('disabled', false).html(originalText);
                    }
                }
            });
        },
        
        // 检查页面访问权限
        checkPageAccess: function(page, callback) {
            $.ajax({
                url: '/api/auth/check-page-access',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ page: page }),
                success: function(response) {
                    callback(response.canAccess);
                },
                error: function() {
                    callback(false);
                }
            });
        }
    };
});
