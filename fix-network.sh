#!/bin/bash

# 网络问题修复脚本 - 解决Docker构建时的网络连接问题

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
echo "    Docker网络问题修复工具"
echo "=================================="

# 检查网络连接
log_info "检查网络连接..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    log_info "网络连接正常"
else
    log_error "网络连接异常，请检查网络设置"
    exit 1
fi

# 清理Docker缓存
log_info "清理Docker构建缓存..."
docker system prune -f
docker builder prune -f

# 重启Docker服务
log_info "重启Docker服务..."
sudo systemctl restart docker
sleep 5

# 配置Docker镜像加速器（中国大陆用户）
log_info "配置Docker镜像加速器..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "dns": ["8.8.8.8", "114.114.114.114"]
}
EOF

# 重启Docker服务以应用配置
log_info "重启Docker服务以应用新配置..."
sudo systemctl daemon-reload
sudo systemctl restart docker
sleep 10

# 测试Docker是否正常工作
log_info "测试Docker服务..."
if docker info > /dev/null 2>&1; then
    log_info "Docker服务正常"
else
    log_error "Docker服务异常"
    exit 1
fi

echo ""
echo "🎉 网络问题修复完成！"
echo "=================================="
echo "✅ 已完成的操作："
echo "   - 清理Docker缓存"
echo "   - 重启Docker服务"
echo "   - 配置镜像加速器"
echo "   - 配置DNS服务器"
echo ""
echo "🔧 现在可以尝试重新构建："
echo "   ./quick-start.sh"
echo "=================================="
