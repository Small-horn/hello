-- 更新用户密码为简单密码（仅用于测试）
-- 在生产环境中应该使用加密密码

UPDATE users SET password = '123' WHERE username = 'admin';
UPDATE users SET password = '123' WHERE username = 'teacher1';
UPDATE users SET password = '123' WHERE username = 'teacher2';
UPDATE users SET password = '123' WHERE username = 'student1';
UPDATE users SET password = '123' WHERE username = 'student2';
UPDATE users SET password = '123' WHERE username = 'guest1';

-- 确保所有用户状态为活跃
UPDATE users SET status = 'ACTIVE' WHERE status != 'ACTIVE';

-- 修复loginCount字段为null的问题
UPDATE users SET login_count = 0 WHERE login_count IS NULL;

-- 显示更新后的用户信息
SELECT username, role, status, real_name, department, login_count FROM users;
