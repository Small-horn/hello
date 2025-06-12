#!/bin/bash

# 快速启动脚本 - 一键部署Spring Boot应用

set -e  # 遇到错误立即退出

echo "=================================="
echo "  Spring Boot Docker 快速部署"
echo "=================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker服务"
    exit 1
fi

echo "✅ Docker服务正常"

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "✅ 环境变量文件已创建"
else
    echo "✅ 环境变量文件已存在"
fi

# 给脚本执行权限
chmod +x deploy.sh

echo "🚀 开始构建和部署..."

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down > /dev/null 2>&1 || true

# 构建并启动服务
echo "🔨 构建Docker镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo "✅ MySQL服务运行正常"
else
    echo "❌ MySQL服务启动失败"
    echo "📋 查看MySQL日志:"
    docker-compose logs mysql
    exit 1
fi

# 检查应用
echo "⏳ 等待应用启动..."
for i in {1..30}; do
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ 应用服务运行正常"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 应用服务启动超时"
        echo "📋 查看应用日志:"
        docker-compose logs app
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 部署成功！"
echo "=================================="
echo "📱 本地访问地址:"
echo "   主页: http://localhost:8080"
echo "   用户管理: http://localhost:8080/user-management.html"
echo "   API接口: http://localhost:8080/api/users"
echo "   健康检查: http://localhost:8080/actuator/health"
echo ""
echo "🌐 公网访问地址:"
echo "   主页: http://152.53.168.97:8080"
echo "   用户管理: http://152.53.168.97:8080/user-management.html"
echo "   API接口: http://152.53.168.97:8080/api/users"
echo "   健康检查: http://152.53.168.97:8080/actuator/health"
echo ""
echo "🗄️  数据库连接信息:"
echo "   主机: localhost"
echo "   端口: 3306"
echo "   数据库: hello_db"
echo "   用户名: hello_user"
echo "   密码: hello123"
echo ""
echo "🔧 常用命令:"
echo "   查看日志: docker-compose logs -f app"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo "   完整管理: ./deploy.sh"
echo "=================================="
