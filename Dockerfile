# 使用官方的OpenJDK 17镜像作为基础镜像（支持ARM64架构）
FROM openjdk:17-jdk-slim

# 配置APT使用国内镜像源（提高下载速度和稳定性）
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list

# 安装curl用于健康检查，使用重试机制
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV JAVA_OPTS="${JAVA_OPTS:-}" \
    APP_NAME="${APP_NAME:-hello}" \
    SERVER_PORT="${SERVER_PORT:-8080}" \
    DB_HOST="${DB_HOST:-mysql}" \
    DB_PORT="${DB_PORT:-3306}" \
    DB_NAME="${DB_NAME:-hello_db}" \
    DB_USERNAME="${DB_USERNAME:-root}" \
    DB_PASSWORD="${DB_PASSWORD:-root123}" \
    JPA_DDL_AUTO="${JPA_DDL_AUTO:-update}" \
    JPA_SHOW_SQL="${JPA_SHOW_SQL:-false}" \
    JPA_FORMAT_SQL="${JPA_FORMAT_SQL:-false}"

# 复制Maven包装器和pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 给Maven包装器执行权限
RUN chmod +x ./mvnw

# 下载依赖（利用Docker缓存层）
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用
RUN ./mvnw clean package -DskipTests

# 暴露端口
EXPOSE ${SERVER_PORT}

# 创建非root用户
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# 运行应用
CMD ["sh", "-c", "java $JAVA_OPTS -jar target/hello-*.jar"]
