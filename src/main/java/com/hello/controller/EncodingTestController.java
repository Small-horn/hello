package com.hello.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hello.repository.AnnouncementRepository;
import com.hello.repository.UserRepository;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * 编码测试控制器
 * 用于测试和验证系统的编码配置
 */
@RestController
@RequestMapping("/api/encoding-test")
public class EncodingTestController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 基础编码测试
     */
    @GetMapping("/basic")
    public ResponseEntity<Map<String, Object>> basicEncodingTest() {
        Map<String, Object> result = new HashMap<>();
        
        // 测试各种中文字符
        result.put("简体中文", "校园管理系统");
        result.put("繁体中文", "校園管理系統");
        result.put("特殊符号", "①②③④⑤ ★☆♠♥♦♣");
        result.put("数学符号", "αβγδε ∑∏∫∞");
        result.put("emoji", "😀😃😄😁😆😅😂🤣");
        result.put("混合文本", "Hello 世界 🌍 测试 Test");
        
        // 系统编码信息
        result.put("defaultCharset", StandardCharsets.UTF_8.name());
        result.put("fileEncoding", System.getProperty("file.encoding"));
        result.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(result);
    }

    /**
     * 数据库编码测试
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> databaseEncodingTest() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 统计中文数据
            long chineseAnnouncementCount = announcementRepository.count();
            long chineseUserCount = userRepository.count();
            
            result.put("success", true);
            result.put("announcementCount", chineseAnnouncementCount);
            result.put("userCount", chineseUserCount);
            
            // 获取一些样本数据来检查编码
            if (chineseAnnouncementCount > 0) {
                var announcements = announcementRepository.findAll();
                if (!announcements.isEmpty()) {
                    var firstAnnouncement = announcements.get(0);
                    result.put("sampleAnnouncementTitle", firstAnnouncement.getTitle());
                    result.put("sampleAnnouncementPublisher", firstAnnouncement.getPublisher());
                }
            }
            
            if (chineseUserCount > 0) {
                var users = userRepository.findAll();
                if (!users.isEmpty()) {
                    var firstUser = users.get(0);
                    result.put("sampleUserName", firstUser.getRealName());
                    result.put("sampleUserDepartment", firstUser.getDepartment());
                }
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * POST请求编码测试
     */
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echoTest(@RequestBody Map<String, String> input) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("received", input);
        result.put("echo", "收到您的消息：" + input.getOrDefault("message", "无消息"));
        result.put("timestamp", System.currentTimeMillis());
        
        // 检查接收到的数据是否包含中文
        String message = input.getOrDefault("message", "");
        boolean containsChinese = message.matches(".*[\\u4e00-\\u9fff].*");
        result.put("containsChinese", containsChinese);
        
        if (containsChinese) {
            result.put("chineseCharCount", message.replaceAll("[^\\u4e00-\\u9fff]", "").length());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * 编码诊断信息
     */
    @GetMapping("/diagnosis")
    public ResponseEntity<Map<String, Object>> encodingDiagnosis() {
        Map<String, Object> result = new HashMap<>();
        
        // JVM编码信息
        Map<String, String> jvmInfo = new HashMap<>();
        jvmInfo.put("file.encoding", System.getProperty("file.encoding"));
        jvmInfo.put("sun.jnu.encoding", System.getProperty("sun.jnu.encoding"));
        jvmInfo.put("user.language", System.getProperty("user.language"));
        jvmInfo.put("user.country", System.getProperty("user.country"));
        result.put("jvmEncoding", jvmInfo);
        
        // 环境变量
        Map<String, String> envInfo = new HashMap<>();
        envInfo.put("LANG", System.getenv("LANG"));
        envInfo.put("LC_ALL", System.getenv("LC_ALL"));
        envInfo.put("JAVA_TOOL_OPTIONS", System.getenv("JAVA_TOOL_OPTIONS"));
        result.put("environment", envInfo);
        
        // 字符集测试
        Map<String, Object> charsetTest = new HashMap<>();
        String testString = "测试中文编码 Test Chinese Encoding";
        charsetTest.put("original", testString);
        charsetTest.put("utf8Bytes", testString.getBytes(StandardCharsets.UTF_8).length);
        charsetTest.put("length", testString.length());
        result.put("charsetTest", charsetTest);
        
        return ResponseEntity.ok(result);
    }
}
