#!/bin/bash

# 修复健康检查脚本

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
echo "    修复健康检查问题"
echo "=================================="

# 1. 重新构建应用
log_info "重新构建应用..."
docker-compose build app

# 2. 重启应用容器
log_info "重启应用容器..."
docker-compose restart app

# 3. 等待应用启动
log_info "等待应用启动..."
for i in {1..30}; do
    if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_info "应用启动完成"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "应用启动超时"
        exit 1
    fi
    sleep 2
done

# 4. 检查健康状态
log_info "检查健康状态..."
sleep 10  # 等待健康检查生效

# 5. 显示容器状态
log_info "显示容器状态..."
docker-compose ps

# 6. 测试API
log_info "测试API..."
API_RESPONSE=$(curl -s http://localhost:8080/api/users)
if echo "$API_RESPONSE" | grep -q '\['; then
    log_info "✅ API正常工作"
    echo "用户数据: $API_RESPONSE"
else
    log_warn "API响应: $API_RESPONSE"
fi

# 7. 测试favicon
log_info "测试favicon处理..."
FAVICON_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/favicon.ico)
if [ "$FAVICON_RESPONSE" = "204" ]; then
    log_info "✅ favicon处理正常"
else
    log_warn "favicon响应码: $FAVICON_RESPONSE"
fi

echo ""
echo "🎉 修复完成！"
echo "=================================="
echo "📱 访问地址："
echo "   网页: http://152.53.168.97:8080/user-management.html"
echo "   API: http://152.53.168.97:8080/api/users"
echo "   健康检查: http://152.53.168.97:8080/actuator/health"
echo "=================================="
