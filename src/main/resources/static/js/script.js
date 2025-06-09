// DOM 元素加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const contactForm = document.getElementById('contactForm');
    
    // 移动端侧边栏切换功能
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // 监听窗口大小变化，调整侧边栏
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
    
    // 处理联系表单提交（仅在联系页面）
    if (contactForm) {
        // 表单验证函数
        function validateForm() {
            let isValid = true;

            // 清除之前的错误信息
            clearErrors();

            // 验证姓名
            const name = document.getElementById('name').value.trim();
            if (!name) {
                showError('name', '请输入您的姓名');
                isValid = false;
            }

            // 验证联系方式（至少填写一项）
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const wechat = document.getElementById('wechat').value.trim();

            if (!email && !phone && !wechat) {
                showError('contact-methods', '请至少填写一种联系方式');
                isValid = false;
            } else {
                // 验证邮箱格式（如果填写了）
                if (email && !isValidEmail(email)) {
                    showError('email', '请输入有效的邮箱地址');
                    isValid = false;
                }

                // 验证电话格式（如果填写了）
                if (phone && !isValidPhone(phone)) {
                    showError('phone', '请输入有效的电话号码');
                    isValid = false;
                }
            }

            // 验证留言内容
            const message = document.getElementById('message').value.trim();
            if (!message) {
                showError('message', '请输入留言内容');
                isValid = false;
            } else if (message.length < 10) {
                showError('message', '留言内容至少需要10个字符');
                isValid = false;
            }

            return isValid;
        }

        // 显示错误信息
        function showError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + '-error');
            const inputElement = document.getElementById(fieldId);

            if (errorElement) {
                errorElement.textContent = message;
            }

            if (inputElement) {
                inputElement.classList.add('error');
            }
        }

        // 清除错误信息
        function clearErrors() {
            const errorElements = document.querySelectorAll('.error-message');
            const inputElements = document.querySelectorAll('.form-group input, .form-group textarea');

            errorElements.forEach(element => {
                element.textContent = '';
            });

            inputElements.forEach(element => {
                element.classList.remove('error');
            });
        }

        // 验证邮箱格式
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // 验证电话格式
        function isValidPhone(phone) {
            const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
            return phoneRegex.test(phone);
        }

        // 实时验证
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                // 移除错误样式当用户开始输入
                if (input.value.trim()) {
                    input.classList.remove('error');
                    const errorElement = document.getElementById(input.id + '-error');
                    if (errorElement) {
                        errorElement.textContent = '';
                    }
                }
            });
        });

        // 邮箱字段变化时，同步更新 _replyto 字段
        const emailInput = document.getElementById('email');
        const replytoInput = document.getElementById('replyto');
        if (emailInput && replytoInput) {
            emailInput.addEventListener('input', () => {
                replytoInput.value = emailInput.value;
            });
        }

        // 表单提交处理
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            // 禁用提交按钮，防止重复提交
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

            try {
                // 创建 FormData 对象
                const formData = new FormData(contactForm);

                // 发送到 Formspree
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // 提交成功
                    alert('您的消息已成功发送！我会尽快回复您。');
                    contactForm.reset();
                    clearErrors();
                } else {
                    // 提交失败
                    const data = await response.json();
                    if (data.errors) {
                        alert('发送失败：' + data.errors.map(error => error.message).join(', '));
                    } else {
                        alert('发送失败，请稍后重试。');
                    }
                }
            } catch (error) {
                console.error('提交错误:', error);
                alert('网络错误，请检查网络连接后重试。');
            } finally {
                // 恢复提交按钮
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // 技能条动画（仅在技能页面）
    const skillLevels = document.querySelectorAll('.skill-level');
    if (skillLevels.length > 0) {
        // 创建IntersectionObserver监听技能条是否进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 技能条进入视口时，恢复其宽度动画
                    entry.target.style.width = entry.target.style.width;
                    // 取消观察，避免重复动画
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        // 初始化技能条宽度为0，添加过渡动画
        skillLevels.forEach(skill => {
            const originalWidth = skill.style.width;
            skill.style.width = '0';
            
            // 添加过渡效果
            skill.style.transition = 'width 1s ease-in-out';
            
            // 延迟恢复原始宽度，形成动画效果
            setTimeout(() => {
                skill.style.width = originalWidth;
            }, 300);
            
            // 添加到观察列表
            observer.observe(skill);
        });
    }
    
    // 作品集项目交互（仅在作品集页面）
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (portfolioItems.length > 0) {
        portfolioItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 检查点击的是否是"查看详情"按钮
                if (!e.target.classList.contains('btn')) {
                    const overlay = item.querySelector('.portfolio-overlay');
                    if (overlay) {
                        overlay.style.transform = overlay.style.transform === 'translateY(0px)' ?
                            'translateY(100px)' : 'translateY(0px)';
                    }
                }
            });
        });
    }

    // 视频项目不再需要点击交互，因为现在使用悬停效果
});

// 处理视频加载的全局函数
function handleVideoLoad(videoContainerId, loadingElementId) {
    const videoContainer = document.getElementById(videoContainerId);
    const loadingElement = document.getElementById(loadingElementId);

    if (videoContainer && loadingElement) {
        // 添加加载完成的类
        videoContainer.classList.add('loaded');
        // 隐藏加载动画
        loadingElement.style.display = 'none';
    }
}

// 视频加载超时处理
document.addEventListener('DOMContentLoaded', () => {
    // 处理多个视频的加载超时
    const videoContainers = [
        { container: 'demoVideo1', loading: 'videoLoading1' },
        { container: 'demoVideo2', loading: 'videoLoading2' },
        { container: 'demoVideo3', loading: 'videoLoading3' },
        { container: 'demoVideo4', loading: 'videoLoading4' }
    ];

    videoContainers.forEach(video => {
        const videoContainer = document.getElementById(video.container);
        const loadingElement = document.getElementById(video.loading);

        if (videoContainer && loadingElement) {
            // 设置超时，如果10秒后还没加载完成，也隐藏加载动画
            setTimeout(() => {
                if (!videoContainer.classList.contains('loaded')) {
                    videoContainer.classList.add('loaded');
                    loadingElement.style.display = 'none';
                }
            }, 10000);
        }
    });
});