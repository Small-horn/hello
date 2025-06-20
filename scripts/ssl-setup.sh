#!/bin/bash

# ================================
# SSL 证书配置脚本
# ================================
# 用于配置 Let's Encrypt SSL 证书

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 配置变量
DOMAIN="www.wsl66.top"
EMAIL="admin@university.edu"
WEBROOT="/var/www/certbot"
SSL_DIR="docker/nginx/ssl"

# 检查 certbot 是否安装
check_certbot() {
    if ! command -v certbot &> /dev/null; then
        log_error "Certbot 未安装"
        log_info "在 Ubuntu/Debian 上安装: sudo apt-get install certbot"
        log_info "在 CentOS/RHEL 上安装: sudo yum install certbot"
        exit 1
    fi
    log_success "Certbot 已安装"
}

# 创建 webroot 目录
create_webroot() {
    log_info "创建 webroot 目录..."
    sudo mkdir -p "$WEBROOT"
    sudo chown -R www-data:www-data "$WEBROOT" 2>/dev/null || sudo chown -R nginx:nginx "$WEBROOT" 2>/dev/null || true
    log_success "Webroot 目录创建完成: $WEBROOT"
}

# 获取 SSL 证书
obtain_certificate() {
    log_info "获取 Let's Encrypt SSL 证书..."
    
    # 停止 nginx 容器以释放 80 端口
    docker-compose stop nginx 2>/dev/null || true
    
    # 使用 standalone 模式获取证书
    sudo certbot certonly \
        --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --domains "$DOMAIN" \
        --non-interactive
    
    if [[ $? -eq 0 ]]; then
        log_success "SSL 证书获取成功"
    else
        log_error "SSL 证书获取失败"
        exit 1
    fi
}

# 复制证书到 nginx 目录
copy_certificates() {
    log_info "复制证书到 nginx 目录..."
    
    mkdir -p "$SSL_DIR"
    
    # 复制证书文件
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"
    
    # 修改权限
    sudo chown $(whoami):$(whoami) "$SSL_DIR"/*.pem
    sudo chmod 644 "$SSL_DIR/cert.pem"
    sudo chmod 600 "$SSL_DIR/key.pem"
    
    log_success "证书复制完成"
}

# 设置自动续期
setup_auto_renewal() {
    log_info "设置证书自动续期..."
    
    # 创建续期脚本
    cat > renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL 证书自动续期脚本

# 续期证书
certbot renew --quiet

# 如果证书更新了，重新复制并重启 nginx
if [[ $? -eq 0 ]]; then
    cp /etc/letsencrypt/live/www.wsl66.top/fullchain.pem docker/nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/www.wsl66.top/privkey.pem docker/nginx/ssl/key.pem
    docker-compose restart nginx
fi
EOF
    
    chmod +x renew-ssl.sh
    
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/renew-ssl.sh") | crontab -
    
    log_success "自动续期设置完成"
}

# 验证证书
verify_certificate() {
    log_info "验证 SSL 证书..."
    
    # 启动 nginx
    docker-compose up -d nginx
    
    # 等待 nginx 启动
    sleep 5
    
    # 测试 HTTPS 连接
    if curl -k -s "https://$DOMAIN" > /dev/null; then
        log_success "HTTPS 连接测试成功"
    else
        log_warning "HTTPS 连接测试失败，请检查配置"
    fi
    
    # 检查证书有效期
    local expiry_date=$(openssl x509 -in "$SSL_DIR/cert.pem" -noout -enddate | cut -d= -f2)
    log_info "证书有效期至: $expiry_date"
}

# 主函数
main() {
    echo "================================"
    echo "SSL 证书配置脚本"
    echo "域名: $DOMAIN"
    echo "邮箱: $EMAIL"
    echo "================================"
    
    read -p "是否继续配置 SSL 证书? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "操作已取消"
        exit 0
    fi
    
    check_certbot
    create_webroot
    obtain_certificate
    copy_certificates
    setup_auto_renewal
    verify_certificate
    
    log_success "SSL 证书配置完成!"
    log_info "现在可以通过 https://$DOMAIN 访问网站"
}

# 显示帮助
show_help() {
    echo "SSL 证书配置脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help      显示帮助信息"
    echo "  --domain DOMAIN 设置域名 (默认: www.wsl66.top)"
    echo "  --email EMAIL   设置邮箱 (默认: admin@university.edu)"
    echo ""
    echo "示例:"
    echo "  $0                                    # 使用默认配置"
    echo "  $0 --domain example.com --email admin@example.com"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行主函数
main
