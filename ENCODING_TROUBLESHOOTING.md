# 编码问题排查和修复指南

## 问题现象
部分中文字符显示为乱码，而不是所有中文都乱码。

## 常见原因分析

### 1. 数据来源编码不一致
- **原因**: 不同时间导入的数据使用了不同的编码
- **表现**: 部分数据正常，部分数据乱码
- **解决**: 需要识别和修复乱码数据

### 2. 数据库连接编码配置
- **原因**: 应用连接数据库时编码设置不正确
- **表现**: 新插入的数据乱码，旧数据正常
- **解决**: 修复连接字符串编码参数

### 3. HTTP传输编码问题
- **原因**: Nginx或应用服务器编码配置不正确
- **表现**: API返回的中文乱码
- **解决**: 配置HTTP响应编码

## 排查步骤

### 第一步：运行编码检查脚本
```bash
./scripts/check-encoding.sh
```

### 第二步：测试编码API
访问编码测试接口：
```bash
# 基础编码测试
curl -s https://www.wsl66.top/api/encoding-test/basic | jq

# 数据库编码测试
curl -s https://www.wsl66.top/api/encoding-test/database | jq

# 编码诊断
curl -s https://www.wsl66.top/api/encoding-test/diagnosis | jq
```

### 第三步：检查数据库编码
```bash
# 连接到MySQL容器
docker exec -it campus-mysql mysql -u root -pcampus_root_2024

# 执行编码检查SQL
source /scripts/fix-encoding.sql
```

### 第四步：检查容器编码环境
```bash
# 检查应用容器编码
docker exec campus-app locale
docker exec campus-app env | grep -E "(LANG|LC_ALL|JAVA_TOOL_OPTIONS)"

# 检查MySQL容器编码
docker exec campus-mysql env | grep -E "(LANG|LC_ALL)"
```

## 修复方案

### 方案1：重新部署（推荐）
如果是新部署的系统，建议重新部署：
```bash
# 停止服务
docker-compose down

# 清理数据（注意：会删除所有数据）
docker volume rm hello_mysql_data

# 重新部署
./scripts/deploy.sh -d
```

### 方案2：修复现有数据
如果系统已有重要数据，需要谨慎修复：

#### 2.1 备份数据
```bash
# 备份数据库
docker exec campus-mysql mysqldump -u root -pcampus_root_2024 hello_db_dev > backup.sql
```

#### 2.2 修复数据库编码
```bash
# 执行修复脚本
docker exec campus-mysql mysql -u root -pcampus_root_2024 < scripts/fix-encoding.sql
```

#### 2.3 修复乱码数据
```sql
-- 连接到数据库
docker exec -it campus-mysql mysql -u root -pcampus_root_2024 hello_db_dev

-- 查找乱码数据
SELECT id, title FROM announcements WHERE title REGEXP '[^\x00-\x7F\u4e00-\u9fff]';

-- 修复乱码数据（示例，需要根据实际情况调整）
UPDATE announcements 
SET title = CONVERT(CAST(CONVERT(title USING latin1) AS BINARY) USING utf8mb4)
WHERE title REGEXP '[^\x00-\x7F\u4e00-\u9fff]';
```

### 方案3：重启服务
有时简单的重启就能解决问题：
```bash
# 重启所有服务
docker-compose restart

# 等待服务启动
sleep 30

# 检查编码
./scripts/check-encoding.sh
```

## 预防措施

### 1. 数据导入时确保编码正确
- 导入CSV文件时使用UTF-8编码
- 使用数据库工具时设置正确的字符集
- 避免在不同编码环境间复制粘贴数据

### 2. 定期检查编码配置
- 部署后运行编码检查脚本
- 监控API响应中的中文字符
- 定期备份数据库

### 3. 统一开发环境编码
- IDE设置为UTF-8编码
- 数据库客户端使用UTF-8连接
- 操作系统locale设置为UTF-8

## 常见错误和解决方案

### 错误1：API返回乱码
**现象**: 通过API获取的中文数据显示为乱码
**解决**: 
1. 检查Nginx配置中的charset设置
2. 检查应用的HTTP编码配置
3. 重启Nginx服务

### 错误2：数据库中文乱码
**现象**: 直接查询数据库发现中文乱码
**解决**:
1. 检查数据库字符集配置
2. 检查表和列的字符集
3. 修复连接编码参数

### 错误3：部分数据乱码
**现象**: 同一表中部分数据正常，部分乱码
**解决**:
1. 识别乱码数据的来源
2. 使用字符集转换修复数据
3. 统一数据导入流程

## 联系支持

如果以上方法都无法解决问题，请：
1. 运行完整的编码检查脚本
2. 收集相关日志信息
3. 记录具体的乱码现象
4. 提供数据样本（脱敏后）

## 相关文件
- `scripts/check-encoding.sh` - 编码检查脚本
- `scripts/fix-encoding.sql` - 数据库编码修复脚本
- `ENCODING_OPTIMIZATION_SUMMARY.md` - 编码优化总结
- `/api/encoding-test/*` - 编码测试API接口
