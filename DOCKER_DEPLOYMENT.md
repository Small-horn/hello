# Docker 部署指南

本文档详细说明如何使用 Docker 部署 Hello Spring Boot 应用。

## 前置要求

1. **Docker**: 版本 20.10 或更高
2. **Docker Compose**: 版本 2.0 或更高
3. **操作系统**: Windows 10/11, macOS, 或 Linux

### 安装 Docker

#### Windows
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 启动 Docker Desktop
3. 确保 WSL 2 已启用（推荐）

#### macOS
1. 下载并安装 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. 启动 Docker Desktop

#### Linux (Ubuntu/Debian)
```bash
# 更新包索引
sudo apt-get update

# 安装必要的包
sudo apt-get install ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

## 快速部署

### 方法一：使用部署脚本（推荐）

#### Windows
```cmd
# 在项目根目录下运行
deploy.bat
```

#### Linux/macOS
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署

1. **构建并启动服务**
```bash
docker-compose up --build -d
```

2. **检查服务状态**
```bash
docker-compose ps
```

3. **查看日志**
```bash
# 查看所有服务日志
docker-compose logs

# 查看应用日志
docker-compose logs app

# 查看数据库日志
docker-compose logs mysql
```

## 服务访问

部署成功后，您可以通过以下地址访问服务：

- **主应用**: http://localhost:8080
- **健康检查**: http://localhost:8080/actuator/health
- **MySQL数据库**: localhost:3306
  - 用户名: hello_user
  - 密码: hello_password
  - 数据库: hello_db

## 常用命令

### 启动服务
```bash
docker-compose up -d
```

### 停止服务
```bash
docker-compose down
```

### 重新构建并启动
```bash
docker-compose up --build -d
```

### 查看运行状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f mysql
```

### 进入容器
```bash
# 进入应用容器
docker-compose exec app bash

# 进入数据库容器
docker-compose exec mysql bash
```

### 数据库操作
```bash
# 连接到MySQL数据库
docker-compose exec mysql mysql -u hello_user -p hello_db
```

## 故障排除

### 1. 端口冲突
如果端口 8080 或 3306 已被占用：

**修改 docker-compose.yml 中的端口映射：**
```yaml
services:
  app:
    ports:
      - "8081:8080"  # 将本地端口改为8081
  mysql:
    ports:
      - "3307:3306"  # 将本地端口改为3307
```

### 2. 内存不足
如果构建过程中出现内存不足错误：

**增加 Docker 内存限制：**
- Docker Desktop: Settings → Resources → Memory

### 3. 数据库连接失败
**检查数据库是否正常启动：**
```bash
docker-compose logs mysql
```

**手动测试数据库连接：**
```bash
docker-compose exec mysql mysqladmin ping -h localhost
```

### 4. 应用启动失败
**查看应用日志：**
```bash
docker-compose logs app
```

**常见问题：**
- 数据库未完全启动：等待更长时间或检查数据库健康状态
- 配置错误：检查环境变量设置
- 端口冲突：修改端口映射

## 生产环境部署

### 1. 环境变量配置
创建 `.env` 文件来管理敏感信息：
```env
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_PASSWORD=your_secure_password
SPRING_DATASOURCE_PASSWORD=your_secure_password
```

### 2. 数据持久化
确保数据库数据持久化：
```yaml
volumes:
  mysql_data:
    driver: local
```

### 3. 网络安全
- 移除不必要的端口暴露
- 使用 Docker secrets 管理敏感信息
- 配置防火墙规则

### 4. 监控和日志
- 配置日志收集
- 设置监控告警
- 定期备份数据

## 清理资源

### 停止并删除所有容器
```bash
docker-compose down
```

### 删除数据卷（注意：会丢失数据）
```bash
docker-compose down -v
```

### 清理未使用的镜像
```bash
docker image prune -f
```

### 完全清理（谨慎使用）
```bash
docker system prune -a --volumes
```
