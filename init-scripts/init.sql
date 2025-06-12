-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS hello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE hello_db;

-- 创建用户表示例（可根据实际需求修改）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT IGNORE INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', 'admin123'),
('user1', 'user1@example.com', 'user123');

-- 授权给应用用户
GRANT ALL PRIVILEGES ON hello_db.* TO 'hello_user'@'%';
FLUSH PRIVILEGES;
