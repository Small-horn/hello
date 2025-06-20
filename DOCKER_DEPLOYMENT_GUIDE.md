# 校园公告系统 Docker 部署指南

## 📋 目录

- [系统要求](#系统要求)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [SSL 证书配置](#ssl-证书配置)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)
- [备份和恢复](#备份和恢复)

## 🔧 系统要求

### 硬件要求
- **CPU**: 2核心以上
- **内存**: 4GB 以上 (推荐 8GB)
- **存储**: 20GB 以上可用空间
- **网络**: 稳定的互联网连接

### 软件要求
- **操作系统**: Linux (Ubuntu 20.04+, CentOS 7+)
- **Docker**: 20.10.0+
- **Docker Compose**: 1.29.0+
- **Git**: 用于代码管理

### 服务器信息
- **服务器IP**: 152.53.168.97
- **域名**: www.wsl66.top
- **架构**: ARM64

## 🚀 快速部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd hello
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，修改相应配置
nano .env
```

### 3. 一键部署
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh --deploy
```

### 4. 访问系统
- **HTTP**: http://www.wsl66.top
- **HTTPS**: https://www.wsl66.top (需要配置SSL证书)
- **应用直接访问**: http://152.53.168.97:8081

## 📖 详细部署步骤

### 步骤 1: 环境准备

#### 1.1 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 1.2 安装 Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 1.3 验证安装
```bash
docker --version
docker-compose --version
```

### 步骤 2: 项目配置

#### 2.1 环境变量配置
编辑 `.env` 文件：
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=hello_db_dev
MYSQL_USER=campus_user
MYSQL_PASSWORD=your_secure_password

# 应用配置
APP_NAME=campus-announcement-system
SERVER_PORT=8081

# 域名配置
DOMAIN_NAME=www.wsl66.top
SERVER_IP=152.53.168.97
```

#### 2.2 创建必要目录
```bash
mkdir -p docker/nginx/ssl
mkdir -p logs
mkdir -p backups
```

### 步骤 3: 部署服务

#### 3.1 环境检查
```bash
./scripts/deploy.sh --check
```

#### 3.2 构建镜像
```bash
./scripts/deploy.sh --build
```

#### 3.3 启动服务
```bash
./scripts/deploy.sh --deploy
```

#### 3.4 健康检查
```bash
./scripts/deploy.sh --test
```

### 步骤 4: 验证部署

#### 4.1 检查容器状态
```bash
docker-compose ps
```

#### 4.2 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx
```

#### 4.3 测试访问
```bash
# 测试应用健康检查
curl http://localhost:8081/actuator/health

# 测试 Nginx
curl http://localhost/health

# 测试完整访问
curl http://www.wsl66.top
```

## ⚙️ 配置说明

### Docker Compose 服务

#### MySQL 服务
- **端口**: 3307 (外部) -> 3306 (内部)
- **数据卷**: `mysql_data`
- **配置文件**: `docker/mysql/conf.d/mysql.cnf`
- **初始化脚本**: `docker/mysql/init/`

#### 应用服务
- **端口**: 8081
- **健康检查**: `/actuator/health`
- **日志目录**: `logs/`
- **配置文件**: `application-docker.properties`

#### Nginx 服务
- **端口**: 80 (HTTP), 443 (HTTPS)
- **配置文件**: `docker/nginx/nginx.conf`
- **站点配置**: `docker/nginx/conf.d/campus.conf`
- **SSL 证书**: `docker/nginx/ssl/`

### 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `MYSQL_ROOT_PASSWORD` | campus_root_2024 | MySQL root 密码 |
| `MYSQL_DATABASE` | hello_db_dev | 数据库名称 |
| `MYSQL_USER` | campus_user | 应用数据库用户 |
| `MYSQL_PASSWORD` | campus_pass_2024 | 应用数据库密码 |
| `APP_NAME` | campus-announcement-system | 应用名称 |
| `SERVER_PORT` | 8081 | 应用端口 |
| `DOMAIN_NAME` | www.wsl66.top | 域名 |
| `SERVER_IP` | 152.53.168.97 | 服务器IP |

## 🔒 SSL 证书配置

### 自动配置 Let's Encrypt 证书
```bash
chmod +x scripts/ssl-setup.sh
./scripts/ssl-setup.sh
```

### 手动配置证书
1. 将证书文件放置到 `docker/nginx/ssl/` 目录
2. 重命名文件：
   - 证书文件: `cert.pem`
   - 私钥文件: `key.pem`
3. 重启 Nginx 服务：
   ```bash
   docker-compose restart nginx
   ```

### 生成自签名证书（测试用）
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/key.pem \
    -out docker/nginx/ssl/cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=University/CN=www.wsl66.top"
```

## 📊 监控和维护

### 查看服务状态
```bash
# 查看容器状态
docker-compose ps

# 查看资源使用情况
docker stats

# 查看系统信息
docker system df
```

### 日志管理
```bash
# 实时查看日志
docker-compose logs -f

# 查看特定时间的日志
docker-compose logs --since="2024-01-01T00:00:00"

# 限制日志行数
docker-compose logs --tail=100
```

### 性能监控
```bash
# 应用健康检查
curl http://localhost:8081/actuator/health

# 应用指标
curl http://localhost:8081/actuator/metrics

# 数据库连接测试
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
```

### 定期维护任务

#### 1. 数据备份
```bash
# 自动备份
./scripts/backup.sh --backup

# 设置定时备份
crontab -e
# 添加: 0 2 * * * /path/to/project/scripts/backup.sh --backup
```

#### 2. 日志轮转
```bash
# 清理旧日志
docker system prune -f

# 限制日志大小
# 在 docker-compose.yml 中添加:
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

#### 3. 系统更新
```bash
# 更新镜像
docker-compose pull

# 重新构建
./scripts/deploy.sh --build

# 重启服务
./scripts/deploy.sh --restart
```

## 🔧 故障排除

### 常见问题

#### 1. 容器启动失败
**症状**: 容器无法启动或立即退出

**解决方案**:
```bash
# 查看容器日志
docker-compose logs [service-name]

# 检查配置文件
docker-compose config

# 重新构建镜像
docker-compose build --no-cache
```

#### 2. 数据库连接失败
**症状**: 应用无法连接到数据库

**解决方案**:
```bash
# 检查数据库容器状态
docker-compose ps mysql

# 测试数据库连接
docker-compose exec mysql mysql -u root -p

# 检查网络连接
docker network ls
docker network inspect hello_campus-network
```

#### 3. 端口冲突
**症状**: 端口已被占用错误

**解决方案**:
```bash
# 查看端口占用
netstat -tulpn | grep :80
netstat -tulpn | grep :443
netstat -tulpn | grep :8081
netstat -tulpn | grep :3307

# 修改端口配置
# 编辑 docker-compose.yml 中的端口映射
```

#### 4. SSL 证书问题
**症状**: HTTPS 访问失败

**解决方案**:
```bash
# 检查证书文件
ls -la docker/nginx/ssl/

# 验证证书
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# 重新生成证书
./scripts/ssl-setup.sh
```

#### 5. 内存不足
**症状**: 容器被 OOM Killer 终止

**解决方案**:
```bash
# 检查内存使用
free -h
docker stats

# 调整 JVM 参数
# 编辑 Dockerfile 中的 JAVA_OPTS

# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 调试命令

```bash
# 进入容器调试
docker-compose exec app bash
docker-compose exec mysql bash
docker-compose exec nginx sh

# 查看容器详细信息
docker inspect campus-app
docker inspect campus-mysql
docker inspect campus-nginx

# 查看网络配置
docker network inspect hello_campus-network

# 查看卷信息
docker volume ls
docker volume inspect hello_mysql_data
```

## 💾 备份和恢复

### 数据备份

#### 1. 自动备份
```bash
# 完整备份
./scripts/backup.sh --backup

# 仅备份数据库
./scripts/backup.sh --database

# 仅备份日志
./scripts/backup.sh --logs
```

#### 2. 手动备份
```bash
# 备份数据库
docker-compose exec mysql mysqldump -u campus_user -p hello_db_dev > backup.sql

# 备份数据卷
docker run --rm -v hello_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_data.tar.gz -C /data .
```

### 数据恢复

#### 1. 恢复数据库
```bash
# 使用备份脚本恢复
./scripts/backup.sh --restore backups/db_backup_20240101_120000.sql.gz

# 手动恢复
docker-compose exec -T mysql mysql -u root -p < backup.sql
```

#### 2. 恢复数据卷
```bash
# 停止服务
docker-compose down

# 恢复数据卷
docker run --rm -v hello_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_data.tar.gz -C /data

# 重启服务
docker-compose up -d
```

### 备份策略建议

1. **每日自动备份**: 设置 cron 任务每天凌晨备份
2. **保留策略**: 保留最近 7 天的每日备份，最近 4 周的周备份
3. **异地备份**: 将备份文件同步到远程存储
4. **定期测试**: 定期测试备份文件的完整性和可恢复性

## 📞 技术支持

如果遇到问题，请按以下顺序排查：

1. 查看本文档的故障排除部分
2. 检查容器日志: `docker-compose logs`
3. 验证配置文件: `docker-compose config`
4. 检查系统资源: `docker stats`, `free -h`, `df -h`
5. 联系技术支持团队

---

## 🎯 部署检查清单

### 部署前检查
- [ ] 服务器满足硬件要求
- [ ] Docker 和 Docker Compose 已安装
- [ ] 域名 DNS 已正确配置
- [ ] 防火墙端口已开放 (80, 443, 8081, 3307)
- [ ] 环境变量已正确配置

### 部署后验证
- [ ] 所有容器正常运行
- [ ] 数据库连接正常
- [ ] 应用健康检查通过
- [ ] Nginx 反向代理工作正常
- [ ] SSL 证书配置正确 (如果使用 HTTPS)
- [ ] 备份脚本测试通过

### 生产环境优化
- [ ] 修改默认密码
- [ ] 配置日志轮转
- [ ] 设置监控告警
- [ ] 配置自动备份
- [ ] 性能调优
- [ ] 安全加固

## 📋 用户手动操作清单

以下操作需要用户手动完成：

### 1. 服务器准备
- [ ] 登录到服务器 152.53.168.97
- [ ] 安装 Docker 和 Docker Compose
- [ ] 配置防火墙规则
- [ ] 设置域名 DNS 解析

### 2. 项目部署
- [ ] 上传项目文件到服务器
- [ ] 复制并编辑 `.env` 文件
- [ ] 运行部署脚本
- [ ] 验证服务状态

### 3. SSL 证书配置
- [ ] 运行 SSL 配置脚本或手动配置证书
- [ ] 测试 HTTPS 访问
- [ ] 配置证书自动续期

### 4. 监控和维护
- [ ] 设置定时备份任务
- [ ] 配置日志监控
- [ ] 设置性能监控
- [ ] 建立运维流程

---

**最后更新**: 2024-06-19
**版本**: 1.0.0
**维护者**: DevOps Team
