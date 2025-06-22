# 校园公告系统 Docker 部署版本

## 📖 项目概述

基于 Spring Boot 3.5.0 的校园公告-活动发布系统，采用 Docker 容器化部署，支持 ARM64 架构，提供完整的用户管理、公告管理、权限控制等功能。

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Spring Boot    │    │   MySQL 8.0    │
│   (Port 80/443) │◄──►│   (Port 8081)   │◄──►│  (Port 3307)    │
│                 │    │                 │    │                 │
│ - SSL终止       │    │ - REST API      │    │ - 数据持久化    │
│ - 负载均衡      │    │ - 业务逻辑      │    │ - 事务管理      │
│ - 静态资源      │    │ - 权限控制      │    │ - 备份恢复      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 技术栈

### 后端技术
- **Spring Boot**: 3.5.0
- **Java**: 17 (Eclipse Temurin)
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA + Hibernate
- **监控**: Spring Boot Actuator

### 前端技术
- **模板引擎**: Thymeleaf
- **前端框架**: HTML5 + CSS3 + JavaScript
- **UI库**: jQuery 3.6.0, Font Awesome 6.4.0

### 容器化技术
- **容器**: Docker
- **编排**: Docker Compose
- **反向代理**: Nginx 1.25
- **基础镜像**: Alpine Linux (轻量化)

## 📁 项目结构

```
hello/
├── docker/                     # Docker 配置文件
│   ├── mysql/
│   │   ├── conf.d/             # MySQL 配置
│   │   └── init/               # 数据库初始化脚本
│   └── nginx/
│       ├── nginx.conf          # Nginx 主配置
│       ├── conf.d/             # 站点配置
│       └── ssl/                # SSL 证书目录
├── scripts/                    # 部署和维护脚本
│   ├── deploy.sh              # 主部署脚本
│   ├── ssl-setup.sh           # SSL 证书配置
│   └── backup.sh              # 数据备份脚本
├── src/                       # 应用源代码
├── Dockerfile                 # 应用镜像构建文件
├── docker-compose.yml         # 服务编排配置
├── .env.example              # 环境变量模板
└── README_DOCKER.md          # 本文档
```

## 🚀 快速开始

### 1. 环境要求
- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **架构**: ARM64 (支持 x86_64)
- **内存**: 4GB+ (推荐 8GB)
- **存储**: 20GB+ 可用空间
- **Docker**: 20.10.0+
- **Docker Compose**: 1.29.0+

### 2. 快速部署
```bash
# 1. 克隆项目
git clone <repository-url>
cd hello

# 2. 配置环境
cp .env.example .env
# 编辑 .env 文件根据需要修改配置

# 3. 一键部署
chmod +x scripts/deploy.sh
./scripts/deploy.sh --deploy

# 4. 验证部署
./scripts/deploy.sh --test
```

### 3. 访问系统
- **主页**: http://www.wsl66.top
- **管理后台**: http://www.wsl66.top/user-management.html
- **API接口**: http://www.wsl66.top/api/
- **健康检查**: http://www.wsl66.top/actuator/health

## ⚙️ 配置说明

### 环境变量配置
主要配置项在 `.env` 文件中：

```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=campus_root_2024
MYSQL_DATABASE=hello_db_dev
MYSQL_USER=campus_user
MYSQL_PASSWORD=campus_pass_2024

# 应用配置
APP_NAME=campus-announcement-system
SERVER_PORT=8081

# 域名配置
DOMAIN_NAME=www.wsl66.top
SERVER_IP=152.53.168.97
```

### 服务端口配置
- **Nginx**: 80 (HTTP), 443 (HTTPS)
- **应用**: 8081
- **数据库**: 3307 (外部访问)

### 默认用户账户
| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | 123 | 管理员 | 全部权限 |
| teacher1 | 123 | 教师 | 公告管理 |
| student1 | 123 | 学生 | 查看权限 |
| guest1 | 123 | 访客 | 受限访问 |

## 🔒 安全配置

### SSL/TLS 配置
```bash
# 自动配置 Let's Encrypt 证书
./scripts/ssl-setup.sh

# 手动配置证书
# 1. 将证书文件放到 docker/nginx/ssl/
# 2. 重命名为 cert.pem 和 key.pem
# 3. 重启 Nginx 服务
```

### 安全特性
- **非 root 用户**: 容器内使用非特权用户运行
- **网络隔离**: 服务间通过内部网络通信
- **数据加密**: 支持 HTTPS 和数据库连接加密
- **访问控制**: 基于角色的权限管理
- **安全头**: Nginx 配置安全响应头

## 📊 监控和维护

### 健康检查
```bash
# 应用健康检查
curl http://localhost:8081/actuator/health

# 服务状态检查
docker-compose ps

# 资源使用监控
docker stats
```

### 日志管理
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx

# 实时日志
docker-compose logs -f
```

### 数据备份
```bash
# 完整备份
./scripts/backup.sh --backup

# 仅备份数据库
./scripts/backup.sh --database

# 恢复数据
./scripts/backup.sh --restore backups/db_backup_xxx.sql.gz
```

## 🔧 运维操作

### 服务管理
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart app

# 查看服务状态
docker-compose ps

# 扩展服务实例
docker-compose up -d --scale app=2
```

### 更新部署
```bash
# 更新代码
git pull

# 重新构建和部署
./scripts/deploy.sh --build
./scripts/deploy.sh --restart

# 验证更新
./scripts/deploy.sh --test
```

### 故障排除
```bash
# 检查容器日志
docker-compose logs [service-name]

# 进入容器调试
docker-compose exec app bash
docker-compose exec mysql bash

# 重新构建镜像
docker-compose build --no-cache

# 清理系统
docker system prune -f
```

## 📈 性能优化

### JVM 调优
在 `Dockerfile` 中配置 JVM 参数：
```bash
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
```

### 数据库优化
在 `docker/mysql/conf.d/mysql.cnf` 中调整：
- `innodb_buffer_pool_size`: 内存缓冲池大小
- `max_connections`: 最大连接数
- `query_cache_size`: 查询缓存大小

### Nginx 优化
在 `docker/nginx/nginx.conf` 中配置：
- `worker_processes`: 工作进程数
- `worker_connections`: 连接数
- `gzip`: 压缩配置

## 🚨 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看详细错误
docker-compose logs

# 检查配置文件
docker-compose config

# 重新构建
docker-compose build --no-cache
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps mysql

# 测试连接
docker-compose exec mysql mysql -u root -p

# 重启数据库
docker-compose restart mysql
```

#### 3. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :8081

# 修改端口配置
# 编辑 docker-compose.yml 或 .env 文件
```

#### 4. 内存不足
```bash
# 检查内存使用
free -h
docker stats

# 调整 JVM 参数
# 编辑 Dockerfile 中的 JAVA_OPTS
```

## 📚 相关文档

- [详细部署指南](DOCKER_DEPLOYMENT_GUIDE.md)
- [快速开始指南](QUICK_START.md)
- [系统功能文档](CAMPUS_ANNOUNCEMENT_SYSTEM.md)
- [配置说明文档](CONFIGURATION.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 技术支持

- **项目维护**: DevOps Team
- **技术文档**: 查看 `docs/` 目录
- **问题反馈**: 创建 GitHub Issue
- **紧急联系**: admin@university.edu

---

**最后更新**: 2024-06-19  
**版本**: 1.0.0  
**兼容性**: Docker 20.10+, ARM64/x86_64
