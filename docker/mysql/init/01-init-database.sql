-- 数据库初始化脚本
-- Docker 环境专用

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS hello_db_dev 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE hello_db_dev;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    description VARCHAR(500) COMMENT '描述',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'GUEST') NOT NULL DEFAULT 'GUEST' COMMENT '用户角色',
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'LOCKED') NOT NULL DEFAULT 'PENDING' COMMENT '用户状态',
    real_name VARCHAR(100) COMMENT '真实姓名',
    student_id VARCHAR(50) COMMENT '学号/工号',
    department VARCHAR(100) COMMENT '院系/部门',
    last_login_time DATETIME COMMENT '最后登录时间',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_student_id (student_id),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建公告/活动表
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    type ENUM('ANNOUNCEMENT', 'ACTIVITY') NOT NULL COMMENT '类型：公告/活动',
    status ENUM('DRAFT', 'PUBLISHED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT '状态',
    publish_time DATETIME NOT NULL COMMENT '发布时间',
    deadline_time DATETIME NULL COMMENT '截止时间',
    publisher VARCHAR(100) NULL COMMENT '发布者',
    summary VARCHAR(500) NULL COMMENT '摘要',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    is_important BOOLEAN DEFAULT FALSE COMMENT '是否重要',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_publish_time (publish_time),
    INDEX idx_deadline_time (deadline_time),
    INDEX idx_is_important (is_important)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告/活动表';

-- 插入示例用户数据
INSERT INTO users (username, email, phone, password, role, status, real_name, student_id, department, login_count, created_at, updated_at) VALUES
('admin', 'admin@university.edu', '13800138000', '123', 'ADMIN', 'ACTIVE', '系统管理员', 'A001', '信息中心', 0, NOW(), NOW()),
('teacher1', 'teacher1@university.edu', '13800138001', '123', 'TEACHER', 'ACTIVE', '张教授', 'T001', '计算机学院', 0, NOW(), NOW()),
('teacher2', 'teacher2@university.edu', '13800138002', '123', 'TEACHER', 'ACTIVE', '李老师', 'T002', '数学学院', 0, NOW(), NOW()),
('student1', 'student1@university.edu', '13800138003', '123', 'STUDENT', 'ACTIVE', '王小明', '2021001', '计算机学院', 0, NOW(), NOW()),
('student2', 'student2@university.edu', '13800138004', '123', 'STUDENT', 'ACTIVE', '李小红', '2021002', '数学学院', 0, NOW(), NOW()),
('guest1', 'guest1@example.com', '13800138005', '123', 'GUEST', 'ACTIVE', '访客用户', '', '', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE username=username;

-- 插入示例公告/活动数据
INSERT INTO announcements (title, content, type, status, publish_time, deadline_time, publisher, summary, view_count, is_important, created_at, updated_at) VALUES
('校园网络维护通知', '为了提升校园网络服务质量，信息中心将于本周六（2024年1月20日）晚上22:00-次日6:00进行网络设备维护升级。维护期间，校园网络可能出现短暂中断，请大家提前做好相关准备。如有紧急情况，请联系信息中心值班电话：123-456-7890。感谢大家的理解与配合！', 'ANNOUNCEMENT', 'PUBLISHED', '2024-01-15 09:00:00', '2024-01-21 06:00:00', '信息中心', '校园网络维护通知，1月20日晚22:00-次日6:00进行维护', 156, TRUE, NOW(), NOW()),

('2024年春季学期选课通知', '各位同学：2024年春季学期选课系统将于1月25日上午9:00正式开放。本次选课分为三个阶段：预选阶段（1月25日-1月30日）、正选阶段（2月1日-2月5日）、补退选阶段（2月20日-2月25日）。请同学们及时关注选课系统，合理安排选课计划。选课前请仔细阅读《选课指南》，如有疑问请咨询所在学院教务办公室。', 'ANNOUNCEMENT', 'PUBLISHED', '2024-01-18 14:30:00', '2024-02-25 23:59:59', '教务处', '2024年春季学期选课通知，1月25日开始选课', 89, TRUE, NOW(), NOW()),

('校园文化艺术节报名开始', '一年一度的校园文化艺术节即将拉开帷幕！本届艺术节以"青春绽放，艺术飞扬"为主题，设有歌唱比赛、舞蹈大赛、书画展览、摄影比赛、话剧表演等多个项目。报名时间：即日起至2月10日；比赛时间：3月1日-3月15日；颁奖典礼：3月20日。欢迎全校师生积极参与，展现才华，丰富校园文化生活！', 'ACTIVITY', 'PUBLISHED', '2024-01-20 10:00:00', '2024-02-10 23:59:59', '学生处', '校园文化艺术节报名开始，多个比赛项目等你参与', 234, FALSE, NOW(), NOW()),

('图书馆寒假开放时间调整', '根据学校寒假安排，图书馆开放时间将做如下调整：1月22日-2月18日期间，开放时间为每天8:30-17:30（周日闭馆）；2月19日起恢复正常开放时间8:00-22:00。寒假期间，部分阅览室可能暂停开放，具体安排请关注图书馆官网通知。如有疑问，请致电图书馆服务台：123-456-7891。', 'ANNOUNCEMENT', 'PUBLISHED', '2024-01-19 16:00:00', '2024-02-19 08:00:00', '图书馆', '图书馆寒假开放时间调整通知', 67, FALSE, NOW(), NOW()),

('大学生创新创业大赛启动', '为培养大学生创新精神和创业能力，学校将举办第十届大学生创新创业大赛。大赛分为创新组和创业组，面向全校在校学生开放。报名截止时间：3月1日；初赛时间：3月15日；决赛时间：4月10日。优秀项目将获得资金支持和孵化机会。详细信息请查看大赛官网或咨询创新创业学院。', 'ACTIVITY', 'PUBLISHED', '2024-01-21 11:00:00', '2024-03-01 23:59:59', '创新创业学院', '第十届大学生创新创业大赛启动，欢迎报名参赛', 145, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=title;

-- 创建数据库用户权限
GRANT SELECT, INSERT, UPDATE, DELETE ON hello_db_dev.* TO 'campus_user'@'%';
FLUSH PRIVILEGES;
