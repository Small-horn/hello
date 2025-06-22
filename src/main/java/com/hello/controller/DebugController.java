package com.hello.controller;

import com.hello.entity.Announcement;
import com.hello.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 调试控制器 - 用于排查筛选功能问题
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    @Autowired
    private AnnouncementService announcementService;

    /**
     * 测试基础查询
     */
    @GetMapping("/test-basic")
    public ResponseEntity<Map<String, Object>> testBasic() {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Announcement> announcements = announcementService.getAllAnnouncements(0, 10, null, null);
            result.put("success", true);
            result.put("message", "基础查询成功");
            result.put("totalElements", announcements.getTotalElements());
            result.put("data", announcements);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "基础查询失败: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试状态筛选
     */
    @GetMapping("/test-status")
    public ResponseEntity<Map<String, Object>> testStatus(@RequestParam String status) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Announcement> announcements = announcementService.getAllAnnouncements(0, 10, status, null);
            result.put("success", true);
            result.put("message", "状态筛选成功");
            result.put("status", status);
            result.put("totalElements", announcements.getTotalElements());
            result.put("data", announcements);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "状态筛选失败: " + e.getMessage());
            result.put("status", status);
            result.put("error", e.getClass().getSimpleName());
            result.put("stackTrace", e.getStackTrace());
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试类型筛选
     */
    @GetMapping("/test-type")
    public ResponseEntity<Map<String, Object>> testType(@RequestParam String type) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Announcement> announcements = announcementService.getAllAnnouncements(0, 10, null, type);
            result.put("success", true);
            result.put("message", "类型筛选成功");
            result.put("type", type);
            result.put("totalElements", announcements.getTotalElements());
            result.put("data", announcements);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "类型筛选失败: " + e.getMessage());
            result.put("type", type);
            result.put("error", e.getClass().getSimpleName());
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试组合筛选
     */
    @GetMapping("/test-combined")
    public ResponseEntity<Map<String, Object>> testCombined(
            @RequestParam String status,
            @RequestParam String type) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Announcement> announcements = announcementService.getAllAnnouncements(0, 10, status, type);
            result.put("success", true);
            result.put("message", "组合筛选成功");
            result.put("status", status);
            result.put("type", type);
            result.put("totalElements", announcements.getTotalElements());
            result.put("data", announcements);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "组合筛选失败: " + e.getMessage());
            result.put("status", status);
            result.put("type", type);
            result.put("error", e.getClass().getSimpleName());
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 获取数据库中的所有状态和类型
     */
    @GetMapping("/enum-values")
    public ResponseEntity<Map<String, Object>> getEnumValues() {
        Map<String, Object> result = new HashMap<>();
        
        // 获取所有可能的枚举值
        String[] statuses = {"DRAFT", "PUBLISHED", "CANCELLED", "EXPIRED"};
        String[] types = {"ANNOUNCEMENT", "ACTIVITY"};
        
        result.put("statuses", statuses);
        result.put("types", types);
        result.put("message", "枚举值获取成功");
        
        return ResponseEntity.ok(result);
    }

    /**
     * 验证参数格式
     */
    @GetMapping("/validate-params")
    public ResponseEntity<Map<String, Object>> validateParams(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("receivedStatus", status);
        result.put("receivedType", type);
        
        // 验证状态
        if (status != null && !status.trim().isEmpty()) {
            try {
                Announcement.AnnouncementStatus.valueOf(status.toUpperCase());
                result.put("statusValid", true);
                result.put("statusMessage", "状态参数有效");
            } catch (IllegalArgumentException e) {
                result.put("statusValid", false);
                result.put("statusMessage", "状态参数无效: " + status);
            }
        } else {
            result.put("statusValid", true);
            result.put("statusMessage", "状态参数为空");
        }
        
        // 验证类型
        if (type != null && !type.trim().isEmpty()) {
            try {
                Announcement.AnnouncementType.valueOf(type.toUpperCase());
                result.put("typeValid", true);
                result.put("typeMessage", "类型参数有效");
            } catch (IllegalArgumentException e) {
                result.put("typeValid", false);
                result.put("typeMessage", "类型参数无效: " + type);
            }
        } else {
            result.put("typeValid", true);
            result.put("typeMessage", "类型参数为空");
        }
        
        return ResponseEntity.ok(result);
    }
}
