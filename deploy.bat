@echo off
chcp 65001 >nul

echo 开始部署 Hello Spring Boot 应用...

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker Compose是否安装
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 停止并删除现有容器
echo 停止现有容器...
docker-compose down

REM 清理旧的镜像（可选）
echo 清理旧的镜像...
docker image prune -f

REM 构建并启动服务
echo 构建并启动服务...
docker-compose up --build -d

REM 等待服务启动
echo 等待服务启动...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo 检查服务状态...
docker-compose ps

REM 检查应用健康状态
echo 检查应用健康状态...
set /a count=0
:healthcheck
set /a count+=1
curl -f http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 应用启动成功！
    echo 🌐 应用访问地址: http://localhost:8080
    echo 📊 健康检查地址: http://localhost:8080/actuator/health
    goto :success
)

if %count% lss 10 (
    echo 等待应用启动... (%count%/10)
    timeout /t 10 /nobreak >nul
    goto :healthcheck
)

echo ❌ 应用启动失败，请检查日志
echo 查看应用日志: docker-compose logs app
echo 查看数据库日志: docker-compose logs mysql

:success
echo 部署完成！
pause
