package com.hello.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 全局异常处理器 - 用于捕获和记录详细错误信息
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResourceFound(NoResourceFoundException e, HttpServletRequest request) {
        // 忽略favicon.ico等静态资源的404错误，不记录日志
        String requestURI = request.getRequestURI();
        if (requestURI.contains("favicon.ico") || requestURI.contains(".ico")) {
            return ResponseEntity.notFound().build();
        }

        logger.warn("静态资源未找到: {}", requestURI);
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e, HttpServletRequest request) {
        // 排除favicon等静态资源错误
        String requestURI = request.getRequestURI();
        if (requestURI.contains("favicon.ico") || requestURI.contains(".ico")) {
            return ResponseEntity.notFound().build();
        }

        logger.error("发生异常: ", e);

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "服务器内部错误: " + e.getMessage());
        response.put("error", e.getClass().getSimpleName());
        response.put("path", requestURI);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        logger.error("运行时异常: ", e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", e.getMessage());
        response.put("error", e.getClass().getSimpleName());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
