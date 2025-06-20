#!/bin/bash

# 部署后编码检查脚本
# 用于检查服务器上的编码配置是否正确

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "========================================"
echo "        编码配置检查脚本"
echo "========================================"

# 1. 检查系统编码
log_info "检查系统编码设置..."
echo "LANG: ${LANG:-未设置}"
echo "LC_ALL: ${LC_ALL:-未设置}"
echo "当前locale:"
locale

# 2. 检查Docker容器编码
log_info "检查Docker容器编码..."

# 检查应用容器编码
if docker ps | grep -q campus-app; then
    log_info "检查应用容器编码..."
    docker exec campus-app locale
    docker exec campus-app env | grep -E "(LANG|LC_ALL|JAVA_TOOL_OPTIONS)"
else
    log_warning "应用容器未运行"
fi

# 检查MySQL容器编码
if docker ps | grep -q campus-mysql; then
    log_info "检查MySQL容器编码..."
    docker exec campus-mysql env | grep -E "(LANG|LC_ALL)"
    
    # 检查MySQL字符集配置
    log_info "检查MySQL字符集配置..."
    docker exec campus-mysql mysql -u root -pcampus_root_2024 -e "SHOW VARIABLES LIKE 'character_set%';"
    docker exec campus-mysql mysql -u root -pcampus_root_2024 -e "SHOW VARIABLES LIKE 'collation%';"
else
    log_warning "MySQL容器未运行"
fi

# 3. 检查应用编码配置
log_info "检查应用编码配置..."

# 测试API编码
if curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
    log_success "应用服务正常运行"
    
    # 测试中文API响应
    log_info "测试中文API响应..."
    response=$(curl -s -H "Content-Type: application/json" http://localhost:8081/api/users?page=0&size=1)
    if echo "$response" | grep -q "用户"; then
        log_success "API返回中文正常"
    else
        log_warning "API返回可能有编码问题"
        echo "响应内容: $response"
    fi
else
    log_error "应用服务无法访问"
fi

# 4. 检查Nginx编码配置
log_info "检查Nginx编码配置..."
if docker ps | grep -q campus-nginx; then
    # 检查Nginx配置中的charset设置
    docker exec campus-nginx grep -r "charset" /etc/nginx/ || log_warning "Nginx配置中未找到charset设置"
    
    # 测试通过Nginx的响应
    if curl -s -H "Accept-Charset: utf-8" https://www.wsl66.top/api/users?page=0&size=1 > /dev/null 2>&1; then
        log_info "测试通过Nginx的中文响应..."
        nginx_response=$(curl -s -H "Accept-Charset: utf-8" https://www.wsl66.top/api/users?page=0&size=1)
        if echo "$nginx_response" | grep -q "用户"; then
            log_success "通过Nginx的中文响应正常"
        else
            log_warning "通过Nginx的响应可能有编码问题"
            echo "Nginx响应内容: $nginx_response"
        fi
    else
        log_warning "无法通过Nginx访问API"
    fi
else
    log_warning "Nginx容器未运行"
fi

# 5. 检查数据库数据编码
log_info "检查数据库数据编码..."
if docker ps | grep -q campus-mysql; then
    # 检查数据库和表的字符集
    log_info "检查数据库字符集..."
    docker exec campus-mysql mysql -u campus_user -pcampus_pass_2024 hello_db_dev -e "
        SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME = 'hello_db_dev';
    "
    
    # 检查表字符集
    log_info "检查表字符集..."
    docker exec campus-mysql mysql -u campus_user -pcampus_pass_2024 hello_db_dev -e "
        SELECT TABLE_NAME, TABLE_COLLATION 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'hello_db_dev';
    "
    
    # 检查是否有中文数据
    log_info "检查中文数据..."
    chinese_data=$(docker exec campus-mysql mysql -u campus_user -pcampus_pass_2024 hello_db_dev -e "
        SELECT COUNT(*) as count FROM announcements WHERE title LIKE '%公告%' OR title LIKE '%活动%';
    " | tail -n 1)
    
    if [ "$chinese_data" -gt 0 ]; then
        log_success "发现 $chinese_data 条包含中文的公告数据"
        
        # 显示一些中文数据样本
        log_info "中文数据样本:"
        docker exec campus-mysql mysql -u campus_user -pcampus_pass_2024 hello_db_dev -e "
            SELECT id, title, publisher FROM announcements 
            WHERE title LIKE '%公告%' OR title LIKE '%活动%' 
            LIMIT 3;
        "
    else
        log_warning "未发现中文数据，可能存在编码问题"
    fi
else
    log_error "MySQL容器未运行，无法检查数据库"
fi

# 6. 生成编码问题诊断报告
log_info "生成编码诊断报告..."

echo ""
echo "========================================"
echo "           诊断报告"
echo "========================================"

# 检查常见编码问题
issues_found=0

# 检查系统编码
if [[ -z "$LANG" ]] || [[ "$LANG" != *"UTF-8"* ]]; then
    log_warning "系统LANG环境变量未设置为UTF-8"
    ((issues_found++))
fi

# 检查容器状态
if ! docker ps | grep -q campus-app; then
    log_error "应用容器未运行"
    ((issues_found++))
fi

if ! docker ps | grep -q campus-mysql; then
    log_error "MySQL容器未运行"
    ((issues_found++))
fi

if ! docker ps | grep -q campus-nginx; then
    log_error "Nginx容器未运行"
    ((issues_found++))
fi

if [ $issues_found -eq 0 ]; then
    log_success "未发现明显的编码配置问题"
else
    log_warning "发现 $issues_found 个潜在问题，请检查上述输出"
fi

echo ""
echo "========================================"
echo "           修复建议"
echo "========================================"

echo "如果发现编码问题，请尝试以下步骤："
echo "1. 重新部署容器: docker-compose down && docker-compose up -d"
echo "2. 检查数据库编码: docker exec campus-mysql mysql -u root -pcampus_root_2024 < scripts/fix-encoding.sql"
echo "3. 清理浏览器缓存并重新访问"
echo "4. 如果问题持续，请检查数据导入时的编码"

echo ""
log_info "编码检查完成"
