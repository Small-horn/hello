#!/bin/bash

# ================================
# 校园公告系统 Docker 部署脚本
# ================================
# 作者: DevOps Team
# 版本: 1.0.0
# 描述: 自动化部署校园公告系统到 Docker 环境

set -e  # 遇到错误立即退出

# ================================
# 颜色定义
# ================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ================================
# 日志函数
# ================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# ================================
# 配置变量
# ================================
PROJECT_NAME="campus-system"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="backups"
LOG_FILE="deploy.log"

# ================================
# 帮助信息
# ================================
show_help() {
    echo "校园公告系统 Docker 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -c, --check         检查环境依赖"
    echo "  -b, --build         构建镜像"
    echo "  -d, --deploy        部署服务"
    echo "  -s, --stop          停止服务"
    echo "  -r, --restart       重启服务"
    echo "  -l, --logs          查看日志"
    echo "  -t, --test          运行健康检查"
    echo "  --backup            备份数据"
    echo "  --restore [file]    恢复数据"
    echo "  --clean             清理未使用的镜像和容器"
    echo ""
    echo "示例:"
    echo "  $0 --check         # 检查环境"
    echo "  $0 --deploy        # 完整部署"
    echo "  $0 --logs app      # 查看应用日志"
}

# ================================
# 环境检查
# ================================
check_environment() {
    log_step "开始环境检查..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    log_success "Docker 已安装: $(docker --version)"
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    log_success "Docker Compose 已安装: $(docker-compose --version)"
    
    # 检查 Docker 服务状态
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
    log_success "Docker 服务正在运行"
    
    # 检查必要文件
    local required_files=("$COMPOSE_FILE" "Dockerfile" "src/main/resources/application.properties")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "必要文件不存在: $file"
            exit 1
        fi
    done
    log_success "所有必要文件存在"
    
    # 检查端口占用
    local ports=(80 443 8081 3307)
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log_warning "端口 $port 已被占用，可能会导致冲突"
        fi
    done
    
    # 检查磁盘空间
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log_warning "可用磁盘空间不足 2GB，建议清理磁盘空间"
    fi
    
    log_success "环境检查完成"
}

# ================================
# 创建环境文件
# ================================
create_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_info "创建环境配置文件..."
        cp .env.example "$ENV_FILE"
        log_success "环境配置文件已创建: $ENV_FILE"
        log_warning "请根据实际环境修改 $ENV_FILE 中的配置"
    else
        log_info "环境配置文件已存在: $ENV_FILE"
    fi
}

# ================================
# 构建镜像
# ================================
build_images() {
    log_step "开始构建 Docker 镜像..."
    
    # 清理旧的构建缓存
    log_info "清理 Maven 构建缓存..."
    if [[ -d "target" ]]; then
        rm -rf target
    fi
    
    # 构建镜像
    log_info "构建应用镜像..."
    docker-compose build --no-cache app
    
    log_success "镜像构建完成"
}

# ================================
# 部署服务
# ================================
deploy_services() {
    log_step "开始部署服务..."
    
    # 创建必要目录
    log_info "创建必要目录..."
    mkdir -p logs backups docker/nginx/ssl
    
    # 生成自签名证书（如果不存在）
    if [[ ! -f "docker/nginx/ssl/cert.pem" ]]; then
        log_info "生成自签名 SSL 证书..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout docker/nginx/ssl/key.pem \
            -out docker/nginx/ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=University/CN=www.wsl66.top" 2>/dev/null || {
            log_warning "无法生成 SSL 证书，请手动配置"
        }
    fi
    
    # 启动服务
    log_info "启动 Docker 服务..."
    docker-compose up -d
    
    log_success "服务部署完成"
}

# ================================
# 健康检查
# ================================
health_check() {
    log_step "开始健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    # 检查数据库
    log_info "检查数据库连接..."
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -pcampus_root_2024 &>/dev/null; then
            log_success "数据库连接正常"
            break
        fi
        log_info "等待数据库启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "数据库连接失败"
        return 1
    fi
    
    # 检查应用
    log_info "检查应用服务..."
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:8081/actuator/health &>/dev/null; then
            log_success "应用服务正常"
            break
        fi
        log_info "等待应用启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "应用服务检查失败"
        return 1
    fi
    
    # 检查 Nginx
    log_info "检查 Nginx 服务..."
    if curl -f http://localhost/health &>/dev/null; then
        log_success "Nginx 服务正常"
    else
        log_warning "Nginx 服务检查失败"
    fi
    
    log_success "健康检查完成"
}

# ================================
# 主函数
# ================================
main() {
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 解析命令行参数
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--check)
            check_environment
            ;;
        -b|--build)
            check_environment
            create_env_file
            build_images
            ;;
        -d|--deploy)
            check_environment
            create_env_file
            build_images
            deploy_services
            sleep 10
            health_check
            ;;
        -s|--stop)
            log_info "停止服务..."
            docker-compose down
            log_success "服务已停止"
            ;;
        -r|--restart)
            log_info "重启服务..."
            docker-compose restart
            sleep 10
            health_check
            ;;
        -l|--logs)
            if [[ -n "${2:-}" ]]; then
                docker-compose logs -f "$2"
            else
                docker-compose logs -f
            fi
            ;;
        -t|--test)
            health_check
            ;;
        --clean)
            log_info "清理未使用的镜像和容器..."
            docker system prune -f
            log_success "清理完成"
            ;;
        *)
            log_error "未知选项: ${1:-}"
            show_help
            exit 1
            ;;
    esac
    
    # 计算执行时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_success "操作完成，耗时: ${duration}秒"
}

# 执行主函数
main "$@"
