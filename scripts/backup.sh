#!/bin/bash

# ================================
# 数据备份脚本
# ================================
# 用于备份 MySQL 数据库和应用数据

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 配置变量
BACKUP_DIR="backups"
DB_NAME="hello_db_dev"
DB_USER="campus_user"
DB_PASS="campus_pass_2024"
CONTAINER_NAME="campus-mysql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log_info "备份目录: $BACKUP_DIR"
}

# 备份数据库
backup_database() {
    log_info "开始备份数据库..."
    
    local backup_file="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    
    # 使用 docker exec 执行 mysqldump
    docker exec "$CONTAINER_NAME" mysqldump \
        -u "$DB_USER" \
        -p"$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        --databases "$DB_NAME" > "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        log_success "数据库备份完成: $backup_file"
        
        # 压缩备份文件
        gzip "$backup_file"
        log_success "备份文件已压缩: $backup_file.gz"
    else
        log_error "数据库备份失败"
        exit 1
    fi
}

# 备份应用日志
backup_logs() {
    log_info "备份应用日志..."
    
    local log_backup_dir="$BACKUP_DIR/logs_$TIMESTAMP"
    mkdir -p "$log_backup_dir"
    
    # 复制容器内的日志
    docker cp campus-app:/app/logs "$log_backup_dir/" 2>/dev/null || true
    
    # 复制 nginx 日志
    docker cp campus-nginx:/var/log/nginx "$log_backup_dir/" 2>/dev/null || true
    
    # 压缩日志备份
    tar -czf "$BACKUP_DIR/logs_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "logs_$TIMESTAMP"
    rm -rf "$log_backup_dir"
    
    log_success "日志备份完成: $BACKUP_DIR/logs_$TIMESTAMP.tar.gz"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份文件..."
    
    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "logs_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    log_success "旧备份清理完成"
}

# 恢复数据库
restore_database() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        log_error "请指定备份文件"
        exit 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    log_info "开始恢复数据库: $backup_file"
    
    # 确认操作
    read -p "确认要恢复数据库吗? 这将覆盖现有数据 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "操作已取消"
        exit 0
    fi
    
    # 解压备份文件（如果是压缩的）
    local sql_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        sql_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$sql_file"
    fi
    
    # 恢复数据库
    docker exec -i "$CONTAINER_NAME" mysql \
        -u root \
        -pcampus_root_2024 < "$sql_file"
    
    if [[ $? -eq 0 ]]; then
        log_success "数据库恢复完成"
    else
        log_error "数据库恢复失败"
        exit 1
    fi
    
    # 清理临时文件
    if [[ "$backup_file" == *.gz ]]; then
        rm -f "$sql_file"
    fi
}

# 显示备份列表
list_backups() {
    log_info "可用的备份文件:"
    echo ""
    
    if [[ -d "$BACKUP_DIR" ]]; then
        ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || log_info "没有找到数据库备份文件"
        echo ""
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || log_info "没有找到日志备份文件"
    else
        log_info "备份目录不存在"
    fi
}

# 显示帮助
show_help() {
    echo "数据备份脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -b, --backup            执行完整备份"
    echo "  -d, --database          仅备份数据库"
    echo "  -l, --logs              仅备份日志"
    echo "  -r, --restore FILE      恢复数据库"
    echo "  --list                  列出备份文件"
    echo "  --cleanup               清理旧备份"
    echo ""
    echo "示例:"
    echo "  $0 --backup                           # 完整备份"
    echo "  $0 --restore backups/db_backup_20240101_120000.sql.gz"
}

# 主函数
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--backup)
            create_backup_dir
            backup_database
            backup_logs
            cleanup_old_backups
            ;;
        -d|--database)
            create_backup_dir
            backup_database
            ;;
        -l|--logs)
            create_backup_dir
            backup_logs
            ;;
        -r|--restore)
            restore_database "$2"
            ;;
        --list)
            list_backups
            ;;
        --cleanup)
            cleanup_old_backups
            ;;
        *)
            log_error "未知选项: ${1:-}"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
