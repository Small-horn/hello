# 多阶段构建 Dockerfile for Spring Boot 校园公告系统
# 针对 ARM64 架构优化

# ================================
# 构建阶段
# ================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# 设置工作目录
WORKDIR /app

# 复制 Maven 配置文件
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# 下载依赖（利用 Docker 缓存层）
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests -B

# ================================
# 运行阶段
# ================================
FROM eclipse-temurin:17-jre

# 设置维护者信息
LABEL maintainer="campus-system@university.edu"
LABEL description="Campus Announcement System - Spring Boot Application"
LABEL version="1.0.0"

# 安装必要的包和设置时区
# 对于 Debian/Ubuntu 镜像，使用 apt-get
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tzdata \
    curl \
    # 设置时区。使用 ln -sf 是更标准的做法
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    # 清理 apt 缓存
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
# 使用 Debian/Ubuntu 的语法创建系统用户和组
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser

# 设置工作目录
WORKDIR /app

# 创建日志目录
RUN mkdir -p /app/logs && \
    chown -R appuser:appgroup /app

# 从构建阶段复制 JAR 文件
COPY --from=builder /app/target/hello-*.jar app.jar

# 修改文件权限
RUN chown appuser:appgroup app.jar

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8081

# 设置 JVM 参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=docker"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8081/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
