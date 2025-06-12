#!/bin/bash

# 中文乱码修复脚本

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
echo "    中文乱码修复工具"
echo "=================================="

# 1. 停止应用服务
log_info "停止应用服务..."
docker-compose stop app

# 2. 重新配置MySQL字符编码
log_info "重新配置MySQL字符编码..."
docker-compose exec -T mysql mysql -u root -proot123 << 'EOF'
-- 设置全局字符编码
SET GLOBAL character_set_server = utf8mb4;
SET GLOBAL collation_server = utf8mb4_unicode_ci;

-- 修改数据库字符编码
ALTER DATABASE hello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符编码
USE hello_db;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 显示当前字符编码设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
EOF

# 3. 清理并重新插入中文测试数据
log_info "清理并重新插入中文测试数据..."
docker-compose exec -T mysql mysql -u root -proot123 hello_db << 'EOF'
-- 删除现有数据
DELETE FROM users;

-- 重新插入带中文的测试数据
INSERT INTO users (username, email, phone, description) VALUES 
('管理员', 'admin@example.com', '13800138000', '系统管理员账户'),
('张三', 'zhangsan@example.com', '13800138001', '普通用户张三'),
('李四', 'lisi@example.com', '13800138002', '普通用户李四'),
('王五', 'wangwu@example.com', '13800138003', '测试用户王五');

-- 查看插入的数据
SELECT * FROM users;
EOF

# 4. 重新构建应用
log_info "重新构建应用..."
docker-compose build app

# 5. 启动应用
log_info "启动应用..."
docker-compose up -d app

# 6. 等待应用启动
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

# 7. 测试中文数据
log_info "测试中文数据..."
echo "=== API响应 ==="
curl -s http://localhost:8080/api/users | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/api/users

echo ""
echo "=== 数据库中的数据 ==="
docker-compose exec -T mysql mysql -u root -proot123 hello_db -e "SELECT * FROM users;" 2>/dev/null

# 8. 测试创建中文用户
log_info "测试创建中文用户..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/users \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d '{
        "username": "测试用户",
        "email": "test@example.com",
        "phone": "13900139000",
        "description": "这是一个中文测试用户"
    }')

echo "创建用户响应:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"

echo ""
echo "🎉 中文编码修复完成！"
echo "=================================="
echo "📱 测试地址："
echo "   网页: http://152.53.168.97:8080/user-management.html"
echo "   API: http://152.53.168.97:8080/api/users"
echo ""
echo "🔧 验证中文显示："
echo "   1. 打开网页查看用户列表"
echo "   2. 尝试添加包含中文的用户"
echo "   3. 检查数据库: docker-compose exec mysql mysql -u root -proot123 hello_db"
echo "=================================="
