-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS hello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE hello_db;

-- 创建用户表（与User实体类匹配）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT IGNORE INTO users (username, email, phone, description) VALUES
('admin', 'admin@example.com', '13800138000', '系统管理员'),
('user1', 'user1@example.com', '13800138001', '普通用户1'),
('user2', 'user2@example.com', '13800138002', '普通用户2');

-- 授权给应用用户
GRANT ALL PRIVILEGES ON hello_db.* TO 'hello_user'@'%';
FLUSH PRIVILEGES;
