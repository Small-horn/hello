#!/bin/bash

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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_info "Docker和Docker Compose已安装"
}

# 创建环境变量文件
setup_env() {
    if [ ! -f .env ]; then
        log_info "创建环境变量文件..."
        cp .env.example .env
        log_warn "请编辑 .env 文件以配置您的环境变量"
        read -p "是否现在编辑 .env 文件? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        log_info "环境变量文件已存在"
    fi
}

# 构建和启动服务
deploy() {
    log_info "开始部署应用..."
    
    # 停止现有服务
    log_info "停止现有服务..."
    docker-compose down
    
    # 构建镜像
    log_info "构建Docker镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    log_info "启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    check_services
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    # 检查MySQL
    if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
        log_info "MySQL服务运行正常"
    else
        log_error "MySQL服务启动失败"
    fi
    
    # 检查应用
    if curl -f http://localhost:8080/actuator/health &> /dev/null; then
        log_info "应用服务运行正常"
        log_info "应用访问地址: http://localhost:8080"
    else
        log_warn "应用服务可能还在启动中，请稍后检查"
        log_info "可以使用以下命令查看日志:"
        echo "  docker-compose logs -f app"
    fi
}

# 显示日志
show_logs() {
    log_info "显示应用日志..."
    docker-compose logs -f app
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    docker-compose down
}

# 清理资源
cleanup() {
    log_warn "这将删除所有容器、镜像和数据卷！"
    read -p "确定要继续吗? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        log_info "清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 主菜单
main_menu() {
    echo "=================================="
    echo "    Spring Boot Docker 部署工具"
    echo "=================================="
    echo "1. 检查环境"
    echo "2. 设置环境变量"
    echo "3. 部署应用"
    echo "4. 检查服务状态"
    echo "5. 查看日志"
    echo "6. 停止服务"
    echo "7. 清理资源"
    echo "8. 退出"
    echo "=================================="
    read -p "请选择操作 (1-8): " choice
    
    case $choice in
        1) check_docker ;;
        2) setup_env ;;
        3) deploy ;;
        4) check_services ;;
        5) show_logs ;;
        6) stop_services ;;
        7) cleanup ;;
        8) exit 0 ;;
        *) log_error "无效选择，请重试" ;;
    esac
}

# 如果有参数，直接执行对应操作
if [ $# -gt 0 ]; then
    case $1 in
        "check") check_docker ;;
        "setup") setup_env ;;
        "deploy") deploy ;;
        "status") check_services ;;
        "logs") show_logs ;;
        "stop") stop_services ;;
        "clean") cleanup ;;
        *) log_error "未知参数: $1" ;;
    esac
else
    # 交互式菜单
    while true; do
        main_menu
        echo
    done
fi
