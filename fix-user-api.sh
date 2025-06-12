#!/bin/bash

# 用户API问题修复脚本

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
echo "    用户API问题修复工具"
echo "=================================="

# 1. 检查容器状态
log_info "检查容器状态..."
docker-compose ps

echo ""

# 2. 检查应用是否能访问
log_info "检查应用健康状态..."
if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
    log_info "应用健康检查正常"
    curl -s http://localhost:8080/actuator/health
else
    log_error "应用健康检查失败"
    log_info "查看应用日志..."
    docker-compose logs --tail=20 app
    
    log_info "重启应用容器..."
    docker-compose restart app
    
    log_info "等待应用重启..."
    sleep 30
fi

echo ""

# 3. 检查MySQL连接
log_info "检查MySQL连接..."
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    log_info "MySQL连接正常"
else
    log_error "MySQL连接失败，重启MySQL..."
    docker-compose restart mysql
    sleep 20
fi

echo ""

# 4. 检查数据库和表
log_info "检查数据库和表结构..."
docker-compose exec -T mysql mysql -u root -proot123 -e "USE hello_db; SHOW TABLES;" 2>/dev/null

# 如果表不存在，创建表
TABLE_COUNT=$(docker-compose exec -T mysql mysql -u root -proot123 -e "USE hello_db; SHOW TABLES LIKE 'users';" 2>/dev/null | grep users | wc -l)
if [ "$TABLE_COUNT" -eq 0 ]; then
    log_warn "用户表不存在，正在创建..."
    docker-compose exec -T mysql mysql -u root -proot123 hello_db << 'EOF'
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, phone, description) VALUES 
('admin', 'admin@example.com', '13800138000', '系统管理员'),
('user1', 'user1@example.com', '13800138001', '普通用户1'),
('user2', 'user2@example.com', '13800138002', '普通用户2');
EOF
    log_info "用户表创建完成"
else
    log_info "用户表存在，显示数据："
    docker-compose exec -T mysql mysql -u root -proot123 hello_db -e "SELECT * FROM users;" 2>/dev/null
fi

echo ""

# 5. 确保应用用户权限
log_info "设置应用用户权限..."
docker-compose exec -T mysql mysql -u root -proot123 -e "GRANT ALL PRIVILEGES ON hello_db.* TO 'hello_user'@'%'; FLUSH PRIVILEGES;" 2>/dev/null

echo ""

# 6. 测试API接口
log_info "测试用户API接口..."
API_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/users)
HTTP_CODE="${API_RESPONSE: -3}"
RESPONSE_BODY="${API_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    log_info "API接口正常，返回数据："
    echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
else
    log_error "API接口异常，HTTP状态码: $HTTP_CODE"
    log_error "响应内容: $RESPONSE_BODY"
    
    log_info "查看应用详细日志..."
    docker-compose logs --tail=50 app
fi

echo ""

# 7. 测试跨域访问
log_info "测试跨域访问..."
CORS_RESPONSE=$(curl -s -H "Origin: http://152.53.168.97:8080" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS http://localhost:8080/api/users)

if [ $? -eq 0 ]; then
    log_info "跨域预检请求成功"
else
    log_warn "跨域预检请求可能有问题"
fi

echo ""

# 8. 重启应用以确保配置生效
log_info "重启应用以确保所有配置生效..."
docker-compose restart app

log_info "等待应用完全启动..."
for i in {1..30}; do
    if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_info "应用启动完成"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "应用启动超时"
        docker-compose logs --tail=20 app
        exit 1
    fi
    sleep 2
done

echo ""

# 9. 最终测试
log_info "最终API测试..."
FINAL_TEST=$(curl -s http://localhost:8080/api/users)
if echo "$FINAL_TEST" | grep -q '\['; then
    log_info "✅ 用户API修复成功！"
    echo "用户数据："
    echo "$FINAL_TEST" | python3 -m json.tool 2>/dev/null || echo "$FINAL_TEST"
else
    log_error "❌ 用户API仍有问题"
    echo "响应内容: $FINAL_TEST"
fi

echo ""
echo "🎉 修复完成！"
echo "=================================="
echo "📱 现在可以访问："
echo "   网页: http://152.53.168.97:8080/user-management.html"
echo "   API: http://152.53.168.97:8080/api/users"
echo ""
echo "🔧 如果问题仍然存在："
echo "   1. 查看日志: docker-compose logs app"
echo "   2. 检查网络: curl -v http://localhost:8080/api/users"
echo "   3. 重新部署: docker-compose down -v && docker-compose up -d"
echo "=================================="
