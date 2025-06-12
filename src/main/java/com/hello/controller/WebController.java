package com.hello.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Web页面控制器
 */
@Controller
public class WebController {

    /**
     * 首页
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }

    /**
     * Hello API - 保留原有功能
     */
    @GetMapping("/hello")
    @ResponseBody
    public String hello() {
        return "Hello World from Spring Boot!";
    }

    /**
     * 处理favicon.ico请求，避免404错误
     */
    @GetMapping("/favicon.ico")
    @ResponseBody
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
