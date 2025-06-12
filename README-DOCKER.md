# Spring Boot Docker 部署指南

本指南将帮助您在Ubuntu 20.04 (aarch64)服务器上使用Docker部署Spring Boot应用。

## 🚀 快速开始

### 1. 一键部署（推荐）
```bash
# 给脚本执行权限
chmod +x quick-start.sh

# 运行快速部署脚本
./quick-start.sh
```

### 2. 手动部署
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

## 📋 前置要求

### 服务器环境
- Ubuntu 20.04 (aarch64)
- Docker 20.10+
- Docker Compose 1.29+
- 至少2GB内存
- 至少5GB磁盘空间

### 安装Docker（如果未安装）
```bash
# 更新包索引
sudo apt update

# 安装必要的包
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker仓库
echo "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker
```

## 🔧 配置说明

### 环境变量配置
复制并编辑环境变量文件：
```bash
cp .env.example .env
nano .env
```

主要配置项：
```bash
# 应用配置
APP_NAME=hello
APP_PORT=8080

# MySQL配置
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=hello_db
MYSQL_USER=hello_user
MYSQL_PASSWORD=hello123

# JPA配置
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
```

### 端口配置
- 应用端口: 8080
- MySQL端口: 3306

确保这些端口未被占用：
```bash
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3306
```

## 📁 项目结构
```
.
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # Docker Compose配置
├── .env.example            # 环境变量模板
├── .dockerignore           # Docker忽略文件
├── deploy.sh               # 完整部署脚本
├── quick-start.sh          # 快速启动脚本
├── init-scripts/           # 数据库初始化脚本
│   └── init.sql
└── README-DOCKER.md        # 本文档
```

## 🎯 部署步骤详解

### 1. 上传代码到服务器
```bash
# 在服务器上创建项目目录
mkdir -p ~/my-projects/hello
cd ~/my-projects/hello

# 上传项目文件（使用scp、rsync或git）
# 例如使用git:
git clone <your-repo-url> .
```

### 2. 配置环境
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑配置（可选）
nano .env
```

### 3. 部署应用
```bash
# 方式1: 快速部署
./quick-start.sh

# 方式2: 交互式部署
./deploy.sh
```

## 🔍 验证部署

### 检查服务状态
```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 查看MySQL日志
docker-compose logs -f mysql
```

### 测试应用
```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 测试API
curl http://localhost:8080/api/users

# 测试主页
curl http://localhost:8080
```

## 🛠️ 常用命令

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs

# 查看应用日志
docker-compose logs -f app

# 查看MySQL日志
docker-compose logs -f mysql
```

### 数据库管理
```bash
# 连接到MySQL
docker-compose exec mysql mysql -u hello_user -p hello_db

# 备份数据库
docker-compose exec mysql mysqldump -u root -p hello_db > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p hello_db < backup.sql
```

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo netstat -tlnp | grep :8080
   sudo kill -9 <PID>
   ```

2. **MySQL连接失败**
   ```bash
   # 检查MySQL容器状态
   docker-compose logs mysql
   
   # 重启MySQL服务
   docker-compose restart mysql
   ```

3. **应用启动失败**
   ```bash
   # 查看详细日志
   docker-compose logs app
   
   # 检查配置
   docker-compose exec app env | grep -E "(DB_|MYSQL_)"
   ```

4. **内存不足**
   ```bash
   # 调整JVM内存设置
   echo "JAVA_OPTS=-Xmx256m -Xms128m" >> .env
   docker-compose restart app
   ```

### 清理和重置
```bash
# 停止并删除所有容器
docker-compose down

# 删除所有数据（谨慎使用）
docker-compose down -v

# 清理Docker镜像
docker system prune -a
```

## 🌐 公网访问配置

### 自动配置防火墙（推荐）
```bash
# 给脚本执行权限
chmod +x setup-firewall.sh

# 运行防火墙配置脚本
sudo ./setup-firewall.sh
```

### 手动配置防火墙
```bash
# 重置防火墙规则
sudo ufw --force reset

# 设置默认策略
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许SSH（重要：防止被锁定）
sudo ufw allow ssh

# 允许应用端口
sudo ufw allow 8080/tcp

# 启用防火墙
sudo ufw --force enable

# 检查防火墙状态
sudo ufw status
```

### 公网访问地址
部署成功后，您可以通过以下地址访问：
- **主页**: http://152.53.168.97:8080
- **用户管理**: http://152.53.168.97:8080/user-management.html
- **API接口**: http://152.53.168.97:8080/api/users
- **健康检查**: http://152.53.168.97:8080/actuator/health

## 📊 监控和维护

### 系统监控
```bash
# 查看资源使用情况
docker stats

# 查看磁盘使用
df -h
docker system df
```

### 定期维护
```bash
# 清理未使用的镜像
docker image prune

# 清理未使用的容器
docker container prune

# 备份数据
./deploy.sh  # 选择备份选项
```

## 🆘 获取帮助

如果遇到问题，可以：
1. 查看日志: `docker-compose logs`
2. 检查配置: `cat .env`
3. 验证网络: `docker network ls`
4. 检查端口: `netstat -tlnp`

---

**注意**: 请确保在生产环境中修改默认密码和配置！
