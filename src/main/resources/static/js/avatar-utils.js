/**
 * 头像工具函数
 * 为不同用户提供不同的头像图片
 */

// 头像工具对象
window.AvatarUtils = {
    
    /**
     * 根据用户ID获取头像路径
     * @param {number} userId - 用户ID
     * @returns {string} 头像图片路径
     */
    getUserAvatar: function(userId) {
        if (!userId) {
            return 'images/avatar.jpg'; // 默认头像
        }
        
        // 根据用户ID计算头像编号（1-17）
        const avatarNumber = ((userId - 1) % 17) + 1;
        const avatarPath = `images/picture/${String(avatarNumber).padStart(6, '0')}.webp`;
        
        return avatarPath;
    },

    /**
     * 更新页面中指定元素的头像
     * @param {string|jQuery} selector - 元素选择器或jQuery对象
     * @param {number} userId - 用户ID
     */
    updateAvatar: function(selector, userId) {
        const avatarPath = this.getUserAvatar(userId);
        const $element = typeof selector === 'string' ? $(selector) : selector;
        
        if ($element.length > 0) {
            $element.attr('src', avatarPath);
            // 添加错误处理，如果头像加载失败则使用默认头像
            $element.attr('onerror', "this.src='images/avatar.jpg'");
        }
    },

    /**
     * 为评论列表中的所有头像设置正确的图片
     * @param {jQuery} container - 评论容器
     */
    updateCommentAvatars: function(container) {
        const self = this;
        container.find('.comment-user-avatar').each(function() {
            const $avatar = $(this);
            const $commentItem = $avatar.closest('.comment-item, .reply-item');
            const commentId = $commentItem.data('comment-id');
            
            // 从评论数据中获取用户ID（需要在评论HTML中添加data-user-id属性）
            const userId = $commentItem.data('user-id');
            if (userId) {
                self.updateAvatar($avatar, userId);
            }
        });
    },

    /**
     * 初始化页面中的所有头像
     * 扫描页面中带有data-user-id属性的头像元素并设置正确的图片
     */
    initPageAvatars: function() {
        const self = this;
        $('[data-user-id]').each(function() {
            const $element = $(this);
            const userId = $element.data('user-id');
            
            if ($element.is('img')) {
                // 如果是img元素，直接更新src
                self.updateAvatar($element, userId);
            } else {
                // 如果是容器元素，查找其中的img元素
                const $avatar = $element.find('img');
                if ($avatar.length > 0) {
                    self.updateAvatar($avatar, userId);
                }
            }
        });
    },

    /**
     * 为侧边栏用户头像设置图片
     * 优先使用用户对象中预计算的头像路径，提高性能
     * @param {object|number} userOrUserId - 用户对象或用户ID
     */
    updateSidebarAvatar: function(userOrUserId) {
        let avatarPath;

        if (typeof userOrUserId === 'object' && userOrUserId !== null) {
            // 如果传入的是用户对象，优先使用预计算的头像路径
            avatarPath = userOrUserId.avatarPath || this.getUserAvatar(userOrUserId.id);
        } else {
            // 如果传入的是用户ID，使用计算方法
            avatarPath = this.getUserAvatar(userOrUserId);
        }

        const $element = $('#sidebar-avatar');
        if ($element.length > 0) {
            $element.attr('src', avatarPath);
            $element.attr('onerror', "this.src='images/avatar.jpg'");
        }
    },

    /**
     * 为评论输入框头像设置图片
     * @param {number} userId - 当前用户ID
     */
    updateCommentInputAvatar: function(userId) {
        this.updateAvatar('.comment-avatar', userId);
    },

    /**
     * 为回复模态框头像设置图片
     * @param {number} userId - 当前用户ID
     */
    updateReplyModalAvatar: function(userId) {
        this.updateAvatar('.reply-user-avatar img', userId);
    },

    /**
     * 获取头像的预加载列表
     * @returns {Array} 所有头像图片的路径数组
     */
    getAvatarPreloadList: function() {
        const avatars = [];
        for (let i = 1; i <= 17; i++) {
            avatars.push(`images/picture/${String(i).padStart(6, '0')}.webp`);
        }
        return avatars;
    },

    /**
     * 预加载所有头像图片
     * 提高用户体验，避免头像加载延迟
     */
    preloadAvatars: function() {
        const avatars = this.getAvatarPreloadList();
        avatars.forEach(function(src) {
            const img = new Image();
            img.src = src;
        });
    }
};

// 页面加载完成后自动初始化
$(document).ready(function() {
    // 初始化页面中的头像
    AvatarUtils.initPageAvatars();
    
    // 预加载头像图片（可选，提高用户体验）
    AvatarUtils.preloadAvatars();
});
