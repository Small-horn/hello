# 校园公告系统 - 快速部署指南

## 🚀 5分钟快速部署

### 前提条件
- Linux 服务器 (ARM64 架构)
- 已安装 Docker 和 Docker Compose
- 域名已解析到服务器 IP

### 快速部署步骤

#### 1. 下载项目
```bash
# 如果是从 Git 仓库
git clone <repository-url>
cd hello

# 或者直接上传项目文件到服务器
```

#### 2. 配置环境
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件（可选，使用默认配置也可以）
nano .env
```

#### 3. 一键部署
```bash
# 给脚本执行权限
chmod +x scripts/deploy.sh

# 执行部署
./scripts/deploy.sh --deploy
```

#### 4. 验证部署
```bash
# 检查服务状态
docker-compose ps

# 测试访问
curl http://localhost:8081/actuator/health
curl http://www.wsl66.top
```

## 🔧 默认配置

### 服务端口
- **应用服务**: 8081
- **数据库**: 3307 (外部访问)
- **Nginx**: 80 (HTTP), 443 (HTTPS)

### 默认账户
| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | 123 | 管理员 | 系统管理员 |
| teacher1 | 123 | 教师 | 教师账户 |
| student1 | 123 | 学生 | 学生账户 |

### 访问地址
- **主页**: http://www.wsl66.top
- **管理后台**: http://www.wsl66.top/user-management.html
- **API 文档**: http://www.wsl66.top/api/users
- **健康检查**: http://www.wsl66.top/actuator/health

## 🔒 SSL 证书配置（可选）

### 自动配置 Let's Encrypt
```bash
chmod +x scripts/ssl-setup.sh
./scripts/ssl-setup.sh
```

### 手动配置
1. 将证书文件放到 `docker/nginx/ssl/` 目录
2. 重命名为 `cert.pem` 和 `key.pem`
3. 重启 Nginx: `docker-compose restart nginx`

## 📊 常用命令

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 数据备份
```bash
# 完整备份
./scripts/backup.sh --backup

# 恢复数据
./scripts/backup.sh --restore backups/db_backup_xxx.sql.gz
```

### 故障排除
```bash
# 检查容器日志
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx

# 重新构建
./scripts/deploy.sh --build

# 健康检查
./scripts/deploy.sh --test
```

## ⚠️ 注意事项

1. **端口冲突**: 确保 8081、3307、80、443 端口未被占用
2. **防火墙**: 开放必要端口的防火墙规则
3. **域名解析**: 确保域名正确解析到服务器 IP
4. **资源要求**: 至少 4GB 内存，20GB 存储空间
5. **权限问题**: 确保当前用户有 Docker 操作权限

## 🆘 快速故障排除

### 问题 1: 容器启动失败
```bash
# 查看详细错误
docker-compose logs

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 问题 2: 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps mysql

# 重启数据库
docker-compose restart mysql

# 等待数据库完全启动
sleep 30
```

### 问题 3: 无法访问网站
```bash
# 检查 Nginx 状态
docker-compose ps nginx

# 检查端口监听
netstat -tulpn | grep :80

# 重启 Nginx
docker-compose restart nginx
```

### 问题 4: 应用无响应
```bash
# 检查应用日志
docker-compose logs app

# 检查健康状态
curl http://localhost:8081/actuator/health

# 重启应用
docker-compose restart app
```

## 📞 获取帮助

如果遇到问题：

1. 查看详细部署文档: `DOCKER_DEPLOYMENT_GUIDE.md`
2. 检查容器日志: `docker-compose logs`
3. 运行健康检查: `./scripts/deploy.sh --test`
4. 联系技术支持团队

---

**部署完成后，请访问 http://www.wsl66.top 开始使用系统！**
