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
        System.out.println("=================================");
        System.out.println("应用启动成功！");
        System.out.println("访问地址: http://localhost:8080");
        System.out.println("功能测试地址: http://localhost:8080/user-management.html");
        System.out.println("API文档: http://localhost:8080/api/users");
        System.out.println("=================================");
    }
}

