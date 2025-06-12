#!/bin/bash

# 完全重新部署脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=================================="
echo "    完全重新部署应用"
echo "=================================="

# 1. 停止并清理所有容器和卷
log_info "停止并清理所有容器和卷..."
docker-compose down -v
docker system prune -f

# 2. 重新构建应用镜像
log_info "重新构建应用镜像..."
docker-compose build --no-cache app

# 3. 启动MySQL服务
log_info "启动MySQL服务..."
docker-compose up -d mysql

# 4. 等待MySQL启动
log_info "等待MySQL启动..."
for i in {1..30}; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        log_info "MySQL启动完成"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "MySQL启动超时"
        exit 1
    fi
    sleep 2
done

# 5. 启动应用服务
log_info "启动应用服务..."
docker-compose up -d app

# 6. 等待应用启动
log_info "等待应用启动..."
for i in {1..60}; do
    if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_info "应用启动完成"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "应用启动超时"
        log_info "查看应用日志:"
        docker-compose logs --tail=50 app
        exit 1
    fi
    sleep 2
done

# 7. 检查服务状态
log_info "检查服务状态..."
docker-compose ps

# 8. 测试数据库连接
log_info "测试数据库连接..."
docker-compose exec -T mysql mysql -u hello_user -phello123 hello_db -e "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null

# 9. 测试API接口
log_info "测试API接口..."
API_RESPONSE=$(curl -s http://localhost:8080/api/users)
echo "API响应: $API_RESPONSE"

if echo "$API_RESPONSE" | grep -q '\['; then
    log_info "✅ API测试成功！"
else
    log_error "❌ API测试失败"
    log_info "查看详细日志:"
    docker-compose logs --tail=30 app
fi

# 10. 测试跨域访问
log_info "测试跨域访问..."
CORS_RESPONSE=$(curl -s -H "Origin: http://152.53.168.97:8080" http://localhost:8080/api/users)
echo "跨域响应: $CORS_RESPONSE"

echo ""
echo "🎉 重新部署完成！"
echo "=================================="
echo "📱 访问地址："
echo "   本地: http://localhost:8080/user-management.html"
echo "   公网: http://152.53.168.97:8080/user-management.html"
echo "   API: http://152.53.168.97:8080/api/users"
echo ""
echo "🔧 如果仍有问题："
echo "   查看日志: docker-compose logs app"
echo "   进入容器: docker-compose exec app bash"
echo "   重启应用: docker-compose restart app"
echo "=================================="
