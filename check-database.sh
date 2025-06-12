#!/bin/bash

# 数据库连接检查脚本

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
echo "    数据库连接检查工具"
echo "=================================="

# 检查MySQL容器是否运行
log_info "检查MySQL容器状态..."
if docker-compose ps mysql | grep -q "Up"; then
    log_info "MySQL容器正在运行"
else
    log_error "MySQL容器未运行"
    echo "请先启动服务: docker-compose up -d mysql"
    exit 1
fi

# 检查MySQL连接
log_info "检查MySQL连接..."
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
    log_info "MySQL服务连接正常"
else
    log_error "MySQL服务连接失败"
    exit 1
fi

# 检查数据库是否存在
log_info "检查数据库是否存在..."
DB_EXISTS=$(docker-compose exec -T mysql mysql -u root -proot123 -e "SHOW DATABASES LIKE 'hello_db';" | grep hello_db | wc -l)
if [ "$DB_EXISTS" -gt 0 ]; then
    log_info "数据库 hello_db 存在"
else
    log_warn "数据库 hello_db 不存在，正在创建..."
    docker-compose exec -T mysql mysql -u root -proot123 -e "CREATE DATABASE IF NOT EXISTS hello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

# 检查用户表是否存在
log_info "检查用户表结构..."
TABLE_EXISTS=$(docker-compose exec -T mysql mysql -u root -proot123 hello_db -e "SHOW TABLES LIKE 'users';" | grep users | wc -l)
if [ "$TABLE_EXISTS" -gt 0 ]; then
    log_info "用户表存在，显示表结构:"
    docker-compose exec -T mysql mysql -u root -proot123 hello_db -e "DESCRIBE users;"
    
    log_info "显示用户数据:"
    docker-compose exec -T mysql mysql -u root -proot123 hello_db -e "SELECT * FROM users;"
else
    log_warn "用户表不存在，正在创建..."
    docker-compose exec -T mysql mysql -u root -proot123 hello_db << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, email, phone, description) VALUES 
('admin', 'admin@example.com', '13800138000', '系统管理员'),
('user1', 'user1@example.com', '13800138001', '普通用户1'),
('user2', 'user2@example.com', '13800138002', '普通用户2');
EOF
    log_info "用户表创建完成"
fi

# 检查应用用户权限
log_info "检查应用用户权限..."
docker-compose exec -T mysql mysql -u root -proot123 -e "GRANT ALL PRIVILEGES ON hello_db.* TO 'hello_user'@'%'; FLUSH PRIVILEGES;"

# 测试应用用户连接
log_info "测试应用用户连接..."
if docker-compose exec -T mysql mysql -u hello_user -phello123 hello_db -e "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    log_info "应用用户连接正常"
    USER_COUNT=$(docker-compose exec -T mysql mysql -u hello_user -phello123 hello_db -e "SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
    log_info "当前用户数量: $USER_COUNT"
else
    log_error "应用用户连接失败"
fi

# 检查应用容器日志
log_info "检查应用容器日志（最后20行）..."
if docker-compose ps app | grep -q "Up"; then
    echo "--- 应用日志 ---"
    docker-compose logs --tail=20 app
else
    log_warn "应用容器未运行"
fi

echo ""
echo "🎉 数据库检查完成！"
echo "=================================="
echo "📊 数据库状态总结："
echo "   - MySQL容器: 运行中"
echo "   - 数据库: hello_db 存在"
echo "   - 用户表: users 存在"
echo "   - 应用用户: hello_user 可连接"
echo ""
echo "🔧 如果仍有问题，请检查："
echo "   1. 应用日志: docker-compose logs app"
echo "   2. 重启应用: docker-compose restart app"
echo "   3. 访问API: curl http://localhost:8080/api/users"
echo "=================================="
