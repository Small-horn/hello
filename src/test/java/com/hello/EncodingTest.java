package com.hello;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 编码配置测试类
 * 验证项目中的UTF-8编码配置是否正确
 */
@SpringBootTest
@ActiveProfiles("test")
public class EncodingTest {

    @Test
    public void testDefaultCharset() {
        // 测试默认字符集是否为UTF-8
        Charset defaultCharset = Charset.defaultCharset();
        System.out.println("默认字符集: " + defaultCharset.name());
        
        // 在正确配置的环境中，默认字符集应该是UTF-8
        assertTrue(defaultCharset.equals(StandardCharsets.UTF_8) || 
                  defaultCharset.name().toLowerCase().contains("utf-8"),
                  "默认字符集应该是UTF-8，当前是: " + defaultCharset.name());
    }

    @Test
    public void testFileEncoding() {
        // 测试file.encoding系统属性
        String fileEncoding = System.getProperty("file.encoding");
        System.out.println("文件编码: " + fileEncoding);
        
        assertNotNull(fileEncoding, "file.encoding系统属性不应该为null");
        assertTrue(fileEncoding.toLowerCase().contains("utf-8") || 
                  fileEncoding.toLowerCase().contains("utf8"),
                  "文件编码应该是UTF-8，当前是: " + fileEncoding);
    }

    @Test
    public void testChineseCharacterHandling() {
        // 测试中文字符处理
        String chineseText = "校园管理系统 - 测试中文编码";
        String englishText = "Campus Management System - Test Chinese Encoding";
        
        // 测试字符串长度计算是否正确
        assertEquals(13, chineseText.length(), "中文字符串长度计算错误");
        assertEquals(47, englishText.length(), "英文字符串长度计算错误");
        
        // 测试UTF-8编码和解码
        byte[] chineseBytes = chineseText.getBytes(StandardCharsets.UTF_8);
        String decodedChinese = new String(chineseBytes, StandardCharsets.UTF_8);
        assertEquals(chineseText, decodedChinese, "中文字符UTF-8编码解码失败");
        
        // 测试包含特殊字符的文本
        String specialText = "特殊字符测试：①②③④⑤ ★☆♠♥♦♣ αβγδε";
        byte[] specialBytes = specialText.getBytes(StandardCharsets.UTF_8);
        String decodedSpecial = new String(specialBytes, StandardCharsets.UTF_8);
        assertEquals(specialText, decodedSpecial, "特殊字符UTF-8编码解码失败");
        
        System.out.println("中文文本: " + chineseText);
        System.out.println("英文文本: " + englishText);
        System.out.println("特殊字符: " + specialText);
        System.out.println("中文UTF-8字节数: " + chineseBytes.length);
    }

    @Test
    public void testSystemProperties() {
        // 测试相关的系统属性
        System.out.println("=== 编码相关系统属性 ===");
        System.out.println("file.encoding: " + System.getProperty("file.encoding"));
        System.out.println("sun.jnu.encoding: " + System.getProperty("sun.jnu.encoding"));
        System.out.println("user.language: " + System.getProperty("user.language"));
        System.out.println("user.country: " + System.getProperty("user.country"));
        System.out.println("user.timezone: " + System.getProperty("user.timezone"));
        
        // 测试环境变量
        System.out.println("=== 编码相关环境变量 ===");
        System.out.println("LANG: " + System.getenv("LANG"));
        System.out.println("LC_ALL: " + System.getenv("LC_ALL"));
        System.out.println("JAVA_TOOL_OPTIONS: " + System.getenv("JAVA_TOOL_OPTIONS"));
    }

    @Test
    public void testStringComparison() {
        // 测试中文字符串比较
        String text1 = "测试";
        String text2 = "测试";
        String text3 = new String("测试".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
        
        assertEquals(text1, text2, "相同中文字符串应该相等");
        assertEquals(text1, text3, "UTF-8编码解码后的中文字符串应该相等");
        assertTrue(text1.equals(text2), "中文字符串equals比较应该返回true");
        assertEquals(0, text1.compareTo(text2), "中文字符串compareTo应该返回0");
    }

    @Test
    public void testDatabaseRelatedText() {
        // 测试数据库相关的中文文本
        String[] testTexts = {
            "校园公告系统",
            "用户管理",
            "公告管理", 
            "活动发布",
            "系统管理员",
            "计算机学院",
            "数学学院",
            "信息中心",
            "教务处",
            "学生处"
        };
        
        for (String text : testTexts) {
            // 测试每个文本的UTF-8编码
            byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
            String decoded = new String(bytes, StandardCharsets.UTF_8);
            assertEquals(text, decoded, "文本 '" + text + "' UTF-8编码解码失败");
            
            // 确保文本不为空且长度正确
            assertFalse(text.isEmpty(), "文本不应该为空");
            assertTrue(text.length() > 0, "文本长度应该大于0");
        }
        
        System.out.println("所有数据库相关中文文本UTF-8编码测试通过");
    }
}
