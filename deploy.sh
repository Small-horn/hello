#!/bin/bash

# Docker部署脚本
echo "开始部署 Hello Spring Boot 应用..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 停止并删除现有容器
echo "停止现有容器..."
docker-compose down

# 清理旧的镜像（可选）
echo "清理旧的镜像..."
docker image prune -f

# 构建并启动服务
echo "构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "等待服务启动..."
sleep 30

# 检查服务状态
echo "检查服务状态..."
docker-compose ps

# 检查应用健康状态
echo "检查应用健康状态..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health &> /dev/null; then
        echo "✅ 应用启动成功！"
        echo "🌐 应用访问地址: http://localhost:8080"
        echo "📊 健康检查地址: http://localhost:8080/actuator/health"
        break
    else
        echo "等待应用启动... ($i/10)"
        sleep 10
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ 应用启动失败，请检查日志"
        echo "查看应用日志: docker-compose logs app"
        echo "查看数据库日志: docker-compose logs mysql"
    fi
done

echo "部署完成！"
