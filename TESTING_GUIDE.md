# 互动功能测试指南

## 测试环境准备

### 1. 数据库准备
确保数据库已经执行了最新的初始化脚本：
```sql
-- 执行 src/main/resources/database-setup.sql
-- 或者使用Docker部署时会自动执行
```

### 2. 测试账户
系统提供了以下测试账户：
```
管理员: admin / 123
教师1: teacher1 / 123  
教师2: teacher2 / 123
学生1: student1 / 123
学生2: student2 / 123
访客: guest1 / 123
```

## 功能测试步骤

### 1. 点赞功能测试

#### 测试公告点赞
1. 登录任意测试账户
2. 进入公告详情页面（如：`announcement-detail.html?id=1`）
3. 点击"点赞"按钮
4. 验证：
   - 按钮状态变为"已点赞"
   - 点赞数量增加1
   - 头部统计信息同步更新
5. 再次点击取消点赞
6. 验证：
   - 按钮状态变为"点赞"
   - 点赞数量减少1

#### 测试评论点赞
1. 在有评论的公告详情页
2. 点击评论下方的点赞按钮
3. 验证点赞状态和数量变化

### 2. 收藏功能测试

#### 测试公告收藏
1. 登录测试账户
2. 进入公告详情页面
3. 点击"收藏"按钮
4. 验证：
   - 按钮状态变为"已收藏"
   - 收藏数量增加1
   - 头部统计信息更新
5. 再次点击取消收藏
6. 验证状态和数量变化

### 3. 评论功能测试

#### 测试发表评论
1. 登录测试账户
2. 进入公告详情页面
3. 在评论输入框中输入测试内容
4. 点击"发表评论"按钮
5. 验证：
   - 评论成功发表
   - 评论列表中显示新评论
   - 评论数量增加
   - 输入框清空

#### 测试评论排序
1. 在有多条评论的页面
2. 点击"最热"排序按钮
3. 验证评论按点赞数排序
4. 点击"最新"排序按钮
5. 验证评论按时间排序

### 4. 回复功能测试

#### 测试评论回复
1. 登录测试账户
2. 点击某条评论的"回复"按钮
3. 在弹出的模态框中输入回复内容
4. 点击"发表回复"按钮
5. 验证：
   - 回复成功发表
   - 回复显示在原评论下方
   - 原评论的回复数量增加
   - 模态框关闭

## API接口测试

### 使用Postman或curl测试

#### 1. 点赞公告
```bash
curl -X POST http://localhost:8080/api/likes/announcement \
  -H "Content-Type: application/json" \
  -d '{"userId": 4, "announcementId": 1}'
```

#### 2. 收藏公告
```bash
curl -X POST http://localhost:8080/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"userId": 4, "announcementId": 1}'
```

#### 3. 发表评论
```bash
curl -X POST http://localhost:8080/api/comments \
  -H "Content-Type: application/json" \
  -d '{"announcementId": 1, "userId": 4, "content": "这是一条测试评论"}'
```

#### 4. 获取评论列表
```bash
curl "http://localhost:8080/api/comments/announcement/1?page=0&size=10&sortBy=time"
```

## 错误场景测试

### 1. 未登录用户测试
1. 清除localStorage中的用户信息
2. 尝试点赞、收藏、评论操作
3. 验证显示"请先登录"提示

### 2. 空内容测试
1. 尝试发表空评论
2. 验证显示"请输入评论内容"提示

### 3. 网络错误测试
1. 断开网络连接
2. 尝试各种操作
3. 验证显示相应错误提示

## 性能测试

### 1. 大量数据测试
1. 创建大量评论数据
2. 测试分页加载性能
3. 测试排序功能性能

### 2. 并发测试
1. 多个用户同时操作
2. 验证数据一致性
3. 检查是否有竞态条件

## 浏览器兼容性测试

### 测试浏览器
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

### 移动端测试
- iOS Safari
- Android Chrome
- 微信内置浏览器

## 数据验证

### 数据库检查
1. 检查comments表数据
```sql
SELECT * FROM comments ORDER BY created_at DESC LIMIT 10;
```

2. 检查likes表数据
```sql
SELECT * FROM likes ORDER BY created_at DESC LIMIT 10;
```

3. 检查favorites表数据
```sql
SELECT * FROM favorites ORDER BY created_at DESC LIMIT 10;
```

4. 检查统计数据一致性
```sql
SELECT 
    a.id,
    a.like_count,
    a.comment_count,
    a.favorite_count,
    (SELECT COUNT(*) FROM likes WHERE target_type = 'ANNOUNCEMENT' AND target_id = a.id) as actual_likes,
    (SELECT COUNT(*) FROM comments WHERE announcement_id = a.id AND is_deleted = FALSE) as actual_comments,
    (SELECT COUNT(*) FROM favorites WHERE announcement_id = a.id) as actual_favorites
FROM announcements a;
```

## 常见问题排查

### 1. 功能不响应
- 检查浏览器控制台错误
- 检查网络请求状态
- 验证用户登录状态

### 2. 数据不同步
- 检查数据库连接
- 验证事务是否正确提交
- 检查缓存是否需要清理

### 3. 样式显示异常
- 检查CSS文件是否正确加载
- 验证浏览器兼容性
- 检查响应式布局

## 测试报告模板

### 测试结果记录
```
测试项目: [功能名称]
测试时间: [日期时间]
测试环境: [浏览器/设备]
测试结果: [通过/失败]
问题描述: [如有问题，详细描述]
修复建议: [修复方案]
```

## 自动化测试建议

### 单元测试
- Service层方法测试
- Repository层查询测试
- Controller层接口测试

### 集成测试
- 完整业务流程测试
- 数据库事务测试
- API接口集成测试

### 前端测试
- JavaScript函数测试
- 用户交互测试
- 页面渲染测试

通过以上测试步骤，可以全面验证互动功能的正确性和稳定性。建议在每次代码更新后都执行完整的测试流程，确保功能正常运行。
