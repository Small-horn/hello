package com.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 主应用类
 */
@SpringBootApplication
public class HelloApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);

        String serverHost = System.getenv("SERVER_HOST");
        String serverPort = System.getenv("SERVER_PORT");

        if (serverHost == null) serverHost = "localhost";
        if (serverPort == null) serverPort = "8080";

        System.out.println("=================================");
        System.out.println("应用启动成功！");
        System.out.println("本地访问地址: http://localhost:" + serverPort);
        if (!"localhost".equals(serverHost)) {
            System.out.println("公网访问地址: http://" + serverHost + ":" + serverPort);
        }
        System.out.println("用户管理页面: http://" + serverHost + ":" + serverPort + "/user-management.html");
        System.out.println("API接口: http://" + serverHost + ":" + serverPort + "/api/users");
        System.out.println("健康检查: http://" + serverHost + ":" + serverPort + "/actuator/health");
        System.out.println("=================================");
    }
}

