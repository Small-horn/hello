#!/bin/bash

# 服务器防火墙配置脚本 - 为公网访问配置防火墙规则

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
echo "    服务器防火墙配置工具"
echo "=================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用root权限运行此脚本"
    echo "使用: sudo $0"
    exit 1
fi

# 检查UFW是否安装
if ! command -v ufw &> /dev/null; then
    log_info "安装UFW防火墙..."
    apt update
    apt install -y ufw
fi

log_info "配置防火墙规则..."

# 设置默认策略
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# 允许SSH连接（重要：防止被锁定）
ufw allow ssh
ufw allow 22/tcp

# 允许HTTP和HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许应用端口（8080）
log_info "开放应用端口 8080..."
ufw allow 8080/tcp

# 可选：允许MySQL端口（仅在需要外部数据库连接时）
read -p "是否需要允许外部MySQL连接？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warn "开放MySQL端口 3306（注意安全风险）..."
    ufw allow 3306/tcp
else
    log_info "MySQL端口保持内部访问"
fi

# 启用防火墙
log_info "启用防火墙..."
ufw --force enable

# 显示防火墙状态
echo ""
log_info "防火墙配置完成！当前规则："
ufw status numbered

echo ""
echo "=================================="
echo "🔥 防火墙配置完成"
echo "=================================="
echo "✅ 已开放端口："
echo "   - 22 (SSH)"
echo "   - 80 (HTTP)"
echo "   - 443 (HTTPS)"
echo "   - 8080 (应用)"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   - 3306 (MySQL)"
fi
echo ""
echo "🌐 您的应用现在可以通过以下地址访问："
echo "   http://152.53.168.97:8080"
echo ""
echo "🔧 管理命令："
echo "   查看状态: sudo ufw status"
echo "   禁用防火墙: sudo ufw disable"
echo "   重新启用: sudo ufw enable"
echo "=================================="
