# 校园公告/活动发布系统

## 项目概述

基于现有的Spring Boot个人作品集网站，新增了完整的校园公告和活动发布系统。该系统保留了原有的侧边栏导航结构和设计风格，提供了公告管理、活动发布、内容展示等功能。

## 功能特性

### 🎯 核心功能
- **公告管理**: 创建、编辑、发布、删除公告
- **活动发布**: 专门的活动信息发布和管理
- **内容展示**: 美观的卡片式布局展示公告和活动
- **分类筛选**: 按类型、状态、重要性筛选内容
- **搜索功能**: 支持标题和内容的关键词搜索
- **富文本编辑**: 支持富文本内容编辑和格式化

### 📱 用户体验
- **响应式设计**: 完美适配桌面端和移动端
- **统一导航**: 保留原有侧边栏结构，无缝集成新功能
- **直观操作**: 简洁明了的用户界面和操作流程
- **实时反馈**: 操作状态提示和加载动画
- **分页浏览**: 高效的分页加载机制

### 🔧 技术特性
- **RESTful API**: 完整的后端API接口
- **数据持久化**: MySQL数据库存储
- **前后端分离**: jQuery + Ajax实现动态交互
- **状态管理**: 草稿、发布、过期、取消等状态管理
- **权限控制**: 基础的内容管理权限

## 系统架构

### 后端架构
```
src/main/java/com/hello/
├── entity/
│   └── Announcement.java          # 公告实体类
├── repository/
│   └── AnnouncementRepository.java # 数据访问层
├── service/
│   └── AnnouncementService.java    # 业务逻辑层
└── controller/
    └── AnnouncementController.java # 控制器层
```

### 前端架构
```
src/main/resources/static/
├── announcements.html              # 公告列表页面
├── announcement-detail.html        # 公告详情页面
├── announcement-management.html    # 公告管理页面
├── css/
│   └── styles.css                 # 样式文件（已扩展）
└── js/
    ├── announcements.js           # 公告列表交互
    ├── announcement-detail.js     # 详情页面交互
    └── announcement-management.js # 管理页面交互
```

### 数据库设计
```sql
announcements 表结构:
- id: 主键ID
- title: 标题
- content: 内容（富文本）
- type: 类型（ANNOUNCEMENT/ACTIVITY）
- status: 状态（DRAFT/PUBLISHED/EXPIRED/CANCELLED）
- publish_time: 发布时间
- deadline_time: 截止时间
- publisher: 发布者
- summary: 摘要
- view_count: 浏览次数
- is_important: 是否重要
- created_at: 创建时间
- updated_at: 更新时间
```

## API接口

### 公告管理接口
- `GET /api/announcements` - 获取所有公告（分页）
- `GET /api/announcements/published` - 获取已发布公告
- `GET /api/announcements/published/type/{type}` - 按类型获取公告
- `GET /api/announcements/{id}` - 获取公告详情
- `POST /api/announcements` - 创建公告
- `PUT /api/announcements/{id}` - 更新公告
- `DELETE /api/announcements/{id}` - 删除公告
- `PUT /api/announcements/{id}/publish` - 发布公告
- `PUT /api/announcements/{id}/unpublish` - 取消发布

### 查询接口
- `GET /api/announcements/search` - 搜索公告
- `GET /api/announcements/important` - 获取重要公告
- `GET /api/announcements/recent` - 获取最近公告
- `GET /api/announcements/popular` - 获取热门公告
- `GET /api/announcements/expiring` - 获取即将过期公告
- `GET /api/announcements/statistics` - 获取统计信息

## 页面功能

### 1. 公告列表页面 (`announcements.html`)
- 展示所有已发布的公告和活动
- 支持按类型筛选（公告/活动）
- 支持按重要性筛选
- 关键词搜索功能
- 卡片式布局展示
- 分页浏览
- 重要公告置顶显示

### 2. 公告详情页面 (`announcement-detail.html`)
- 完整的公告内容展示
- 发布信息和统计数据
- 分享和打印功能
- 相关公告推荐
- 浏览量自动统计

### 3. 公告管理页面 (`announcement-management.html`)
- 公告和活动的创建、编辑、删除
- 富文本编辑器支持
- 状态管理（草稿、发布、取消发布）
- 批量操作功能
- 数据筛选和搜索
- 表格式管理界面

## 设计特色

### 🎨 视觉设计
- **一致性**: 与原有网站设计风格完全一致
- **现代化**: 采用卡片式设计和现代UI元素
- **可读性**: 优化的字体和间距设计
- **色彩搭配**: 统一的色彩方案和主题色

### 🚀 交互体验
- **流畅动画**: 悬停效果和过渡动画
- **即时反馈**: 操作状态和加载提示
- **键盘支持**: 支持键盘快捷操作
- **无障碍**: 考虑可访问性的设计

### 📱 响应式适配
- **移动优先**: 优先考虑移动端体验
- **断点设计**: 多个屏幕尺寸的适配
- **触摸友好**: 适合触摸操作的按钮和控件

## 使用说明

### 启动系统
1. 确保MySQL数据库运行
2. 执行数据库初始化脚本 `database-setup.sql`
3. 启动Spring Boot应用
4. 访问 `http://localhost:8080`

### 功能使用
1. **查看公告**: 点击侧边栏"校园公告"或"活动发布"
2. **管理公告**: 点击"公告管理"进入管理界面
3. **创建内容**: 使用"新建公告"或"新建活动"按钮
4. **编辑内容**: 在管理界面点击"编辑"按钮
5. **发布管理**: 使用"发布"/"取消发布"功能

## 技术栈

- **后端**: Spring Boot 3.5.0, Spring Data JPA, MySQL
- **前端**: HTML5, CSS3, JavaScript (ES6), jQuery 3.6.0
- **UI组件**: Font Awesome 6.4.0, Quill.js富文本编辑器
- **构建工具**: Maven
- **数据库**: MySQL 8.0+

## 扩展建议

### 功能扩展
- [ ] 用户权限管理系统
- [ ] 评论和互动功能
- [ ] 邮件通知系统
- [ ] 文件附件上传
- [ ] 数据导出功能
- [ ] 多语言支持

### 技术优化
- [ ] 缓存机制优化
- [ ] 搜索引擎集成
- [ ] 性能监控
- [ ] 安全加固
- [ ] API文档生成
- [ ] 单元测试覆盖

## 总结

该校园公告/活动发布系统成功地在现有个人作品集网站基础上，增加了完整的内容管理功能。系统保持了原有的设计风格和用户体验，同时提供了现代化的公告管理能力。通过合理的架构设计和用户友好的界面，为校园信息发布提供了一个高效、美观的解决方案。
