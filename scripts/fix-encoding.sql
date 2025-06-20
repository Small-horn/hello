-- 数据库编码修复脚本
-- 用于修复部分中文乱码问题

-- 1. 检查当前数据库编码
SELECT 
    SCHEMA_NAME as '数据库名',
    DEFAULT_CHARACTER_SET_NAME as '字符集',
    DEFAULT_COLLATION_NAME as '排序规则'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'hello_db_dev';

-- 2. 检查表的编码
SELECT 
    TABLE_NAME as '表名',
    TABLE_COLLATION as '排序规则'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'hello_db_dev';

-- 3. 检查列的编码
SELECT 
    TABLE_NAME as '表名',
    COLUMN_NAME as '列名',
    CHARACTER_SET_NAME as '字符集',
    COLLATION_NAME as '排序规则'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'hello_db_dev' 
AND CHARACTER_SET_NAME IS NOT NULL;

-- 4. 修复数据库编码（如果需要）
-- ALTER DATABASE hello_db_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. 修复表编码（如果需要）
-- ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE announcements CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. 检查是否有乱码数据
-- 查找可能的乱码数据（包含特殊字符的记录）
SELECT id, title, '标题可能有乱码' as 问题类型
FROM announcements 
WHERE title REGEXP '[^\x00-\x7F\u4e00-\u9fff]'
LIMIT 10;

SELECT id, content, '内容可能有乱码' as 问题类型
FROM announcements 
WHERE content REGEXP '[^\x00-\x7F\u4e00-\u9fff]'
LIMIT 10;

SELECT id, real_name, '姓名可能有乱码' as 问题类型
FROM users 
WHERE real_name REGEXP '[^\x00-\x7F\u4e00-\u9fff]'
LIMIT 10;

-- 7. 显示当前连接的编码设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 8. 设置当前会话编码（确保查询使用正确编码）
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 9. 如果发现乱码数据，可以尝试修复（谨慎使用）
-- 注意：以下语句会修改数据，请先备份！

-- 示例：修复标题乱码（需要根据实际情况调整）
-- UPDATE announcements 
-- SET title = CONVERT(CAST(CONVERT(title USING latin1) AS BINARY) USING utf8mb4)
-- WHERE title REGEXP '[^\x00-\x7F\u4e00-\u9fff]';

-- 示例：修复内容乱码（需要根据实际情况调整）
-- UPDATE announcements 
-- SET content = CONVERT(CAST(CONVERT(content USING latin1) AS BINARY) USING utf8mb4)
-- WHERE content REGEXP '[^\x00-\x7F\u4e00-\u9fff]';

-- 10. 验证修复结果
-- 查看修复后的数据
SELECT id, title, LEFT(content, 100) as content_preview
FROM announcements 
ORDER BY id 
LIMIT 5;

SELECT id, username, real_name, department
FROM users 
ORDER BY id 
LIMIT 5;
