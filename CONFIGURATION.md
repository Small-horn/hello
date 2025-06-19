# 配置说明

## 占位符配置

本项目使用 Spring Boot 的占位符功能来支持灵活的环境配置。配置文件 `application.properties` 中使用了 `${变量名:默认值}` 的语法。

## 配置方式

### 1. 环境变量方式

您可以通过设置环境变量来覆盖默认配置：

```bash
# Windows
set DB_HOST=192.168.1.100
set DB_PASSWORD=mypassword
java -jar hello.jar

# Linux/Mac
export DB_HOST=192.168.1.100
export DB_PASSWORD=mypassword
java -jar hello.jar
```

### 2. 启动参数方式

```bash
java -jar hello.jar --DB_HOST=192.168.1.100 --DB_PASSWORD=mypassword
```

### 3. .env 文件方式

复制 `.env.example` 为 `.env` 文件并修改相应的值：

```bash
cp .env.example .env
# 编辑 .env 文件
```

### 4. IDE 配置方式

在 IDE 中运行时，可以在运行配置中设置环境变量。

## 配置项说明

| 配置项 | 环境变量 | 默认值 | 说明 |
|--------|----------|--------|------|
| 应用名称 | APP_NAME | hello | 应用程序名称 |
| 数据库主机 | DB_HOST | localhost | 数据库服务器地址 |
| 数据库端口 | DB_PORT | 3306 | 数据库端口 |
| 数据库名称 | DB_NAME | hello_db_dev_dev | 数据库名称 |
| 数据库用户名 | DB_USERNAME | root | 数据库用户名 |
| 数据库密码 | DB_PASSWORD | root | 数据库密码 |
| 数据库驱动 | DB_DRIVER | com.mysql.cj.jdbc.Driver | JDBC 驱动类 |
| SSL 连接 | DB_USE_SSL | false | 是否使用 SSL 连接 |
| 时区 | DB_TIMEZONE | UTC | 数据库时区 |
| DDL 策略 | JPA_DDL_AUTO | update | Hibernate DDL 策略 |
| 显示 SQL | JPA_SHOW_SQL | true | 是否显示 SQL 语句 |
| Hibernate 方言 | JPA_DIALECT | org.hibernate.dialect.MySQLDialect | Hibernate 方言 |
| 格式化 SQL | JPA_FORMAT_SQL | true | 是否格式化 SQL |
| 服务器端口 | SERVER_PORT | 8080 | 应用服务器端口 |
| 根日志级别 | LOG_LEVEL_ROOT | INFO | 根日志级别 |
| 应用日志级别 | LOG_LEVEL_APP | DEBUG | 应用日志级别 |

## 环境配置示例

### 开发环境
使用默认配置即可，或者设置：
```
JPA_SHOW_SQL=true
LOG_LEVEL_APP=DEBUG
```

### 测试环境
```
DB_HOST=test-db-server
DB_NAME=hello_test_db
JPA_DDL_AUTO=create-drop
LOG_LEVEL_ROOT=WARN
```

### 生产环境
```
DB_HOST=prod-db-server.example.com
DB_NAME=hello_prod_db
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_USE_SSL=true
JPA_DDL_AUTO=validate
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
SERVER_PORT=80
LOG_LEVEL_ROOT=ERROR
LOG_LEVEL_APP=WARN
```

## 安全注意事项

1. 不要将包含敏感信息的 `.env` 文件提交到版本控制系统
2. 在生产环境中使用强密码
3. 考虑使用配置管理工具或密钥管理服务
4. 定期轮换数据库密码
