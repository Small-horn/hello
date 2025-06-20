package com.hello.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

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
    public String hello() {
        return "Hello World from Spring Boot!";
    }
}
