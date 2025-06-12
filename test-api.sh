#!/bin/bash

# API测试脚本

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

# API基础URL
API_BASE="http://localhost:8080"

echo "=================================="
echo "    API接口测试工具"
echo "=================================="

# 测试健康检查
log_info "测试健康检查接口..."
if curl -f -s "$API_BASE/actuator/health" > /dev/null; then
    log_info "健康检查接口正常"
    curl -s "$API_BASE/actuator/health" | python3 -m json.tool 2>/dev/null || curl -s "$API_BASE/actuator/health"
else
    log_error "健康检查接口失败"
    echo "请检查应用是否正常启动"
    exit 1
fi

echo ""

# 测试获取所有用户
log_info "测试获取所有用户接口..."
USERS_RESPONSE=$(curl -s "$API_BASE/api/users")
if [ $? -eq 0 ]; then
    log_info "获取用户列表成功"
    echo "$USERS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$USERS_RESPONSE"
else
    log_error "获取用户列表失败"
fi

echo ""

# 测试创建用户
log_info "测试创建用户接口..."
NEW_USER_DATA='{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138999",
    "description": "测试用户"
}'

CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/api/users" \
    -H "Content-Type: application/json" \
    -d "$NEW_USER_DATA")

if [ $? -eq 0 ]; then
    log_info "创建用户接口响应:"
    echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
else
    log_error "创建用户接口失败"
fi

echo ""

# 测试用户名检查
log_info "测试用户名检查接口..."
CHECK_RESPONSE=$(curl -s "$API_BASE/api/users/check-username?username=admin")
if [ $? -eq 0 ]; then
    log_info "用户名检查接口响应:"
    echo "$CHECK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHECK_RESPONSE"
else
    log_error "用户名检查接口失败"
fi

echo ""

# 测试搜索用户
log_info "测试搜索用户接口..."
SEARCH_RESPONSE=$(curl -s "$API_BASE/api/users/search?username=admin")
if [ $? -eq 0 ]; then
    log_info "搜索用户接口响应:"
    echo "$SEARCH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEARCH_RESPONSE"
else
    log_error "搜索用户接口失败"
fi

echo ""
echo "🎉 API测试完成！"
echo "=================================="
echo "📱 可以通过以下方式访问："
echo "   浏览器: http://152.53.168.97:8080/user-management.html"
echo "   API文档: http://152.53.168.97:8080/api/users"
echo "=================================="
