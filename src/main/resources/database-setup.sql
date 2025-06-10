-- 数据库初始化脚本
-- 请在MySQL中执行以下SQL语句

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS hello_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE hello_db;

-- 3. 创建用户表（Spring Boot会自动创建，这里仅作参考）
-- CREATE TABLE IF NOT EXISTS users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     phone VARCHAR(20) NOT NULL,
--     description TEXT,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- 4. 插入示例数据
INSERT INTO users (username, email, phone, description, created_at, updated_at) VALUES
('admin', 'admin@example.com', '13800138000', '系统管理员', NOW(), NOW()),
('user1', 'user1@example.com', '13800138001', '普通用户1', NOW(), NOW()),
('user2', 'user2@example.com', '13800138002', '普通用户2', NOW(), NOW())
ON DUPLICATE KEY UPDATE username=username;

-- 5. 查看表结构
-- DESCRIBE users;

-- 6. 查看数据
-- SELECT * FROM users;
