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

## 用户权限管理系统

### 🔐 权限架构

#### 用户角色
- **管理员 (ADMIN)**: 拥有所有权限，可以管理用户、公告、系统设置
- **教师 (TEACHER)**: 可以发布和管理公告/活动，查看用户信息
- **学生 (STUDENT)**: 可以查看公告/活动，访问个人信息页面
- **游客 (GUEST)**: 只能查看公开的公告/活动信息

#### 权限控制
- **页面级权限**: 根据用户角色控制页面访问
- **功能级权限**: 根据权限显示/隐藏特定功能
- **数据级权限**: 控制用户可以访问的数据范围

### 🔑 认证流程

1. **登录验证**: 用户名密码验证，支持快速登录
2. **会话管理**: 基于Session的会话管理
3. **权限检查**: 每个页面自动进行权限验证
4. **自动跳转**: 登录后自动跳转到目标页面

### 📱 登录系统特性

- **美观界面**: 使用校园背景图片的现代化登录界面
- **快速登录**: 提供不同角色的快速登录按钮
- **记住我**: 支持记住用户名功能
- **响应式**: 完美适配移动端设备
- **安全性**: 密码显示/隐藏，输入验证

## 测试账户

系统预置了以下测试账户（所有密码都是：**123**）：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | 123 | 管理员 | 系统管理员，拥有所有权限 |
| teacher1 | 123 | 教师 | 计算机学院教师，可管理公告 |
| student1 | 123 | 学生 | 计算机学院学生，可查看公告 |
| guest1 | 123 | 游客 | 访客用户，权限受限 |

## 部署说明

### 环境要求
- Java 17+
- MySQL 8.0+
- Maven 3.6+

### 部署步骤
1. **数据库初始化**:
   ```sql
   -- 创建数据库
   CREATE DATABASE campus_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- 执行初始化脚本
   source src/main/resources/database-setup.sql;
   ```

2. **配置文件**:
   ```properties
   # application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/campus_system
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **启动应用**:
   ```bash
   mvn clean package
   java -jar target/hello-0.0.1-SNAPSHOT.jar
   ```

4. **访问系统**:
   - 登录页面: http://localhost:8080
   - 使用预置账户登录测试

## 安全考虑

### 已实现的安全措施
- **会话管理**: 基于Session的用户会话
- **权限验证**: 页面和API级别的权限检查
- **输入验证**: 前端和后端双重验证
- **XSS防护**: HTML内容转义处理

### 生产环境建议
- **密码加密**: 使用BCrypt等强加密算法
- **HTTPS**: 启用SSL/TLS加密传输
- **CSRF防护**: 添加CSRF令牌验证
- **SQL注入防护**: 使用参数化查询
- **会话安全**: 设置安全的会话配置

## 总结

该校园公告/活动发布系统成功地在现有个人作品集网站基础上，增加了完整的内容管理功能和用户权限管理系统。系统具有以下特点：

### ✨ 主要成就
1. **完整的权限体系**: 四级用户角色，细粒度权限控制
2. **现代化界面**: 美观的登录页面和响应式设计
3. **功能完备**: 公告管理、用户管理、权限控制一应俱全
4. **用户体验**: 流畅的交互和直观的操作界面
5. **技术先进**: Spring Boot + jQuery的现代化技术栈

### 🚀 技术亮点
- **前后端分离**: RESTful API设计
- **权限守卫**: 自动化的页面权限检查
- **会话管理**: 安全的用户认证机制
- **响应式设计**: 完美的移动端适配
- **模块化架构**: 清晰的代码结构和职责分离

通过合理的架构设计和用户友好的界面，为校园信息发布和用户管理提供了一个高效、安全、美观的解决方案。系统具有良好的扩展性，可以根据实际需求进行功能扩展和定制。
