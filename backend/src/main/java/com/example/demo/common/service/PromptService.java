package com.example.demo.common.service;

import org.springframework.stereotype.Service;

// @subject : 코드 분석 프롬프트
@Service
public class PromptService {

    public String buildCodeAnalysisPrompt(String language) {
        StringBuilder prompt = new StringBuilder();
        
        // 분석 프레임워크 정의
        prompt.append("{\n");
        prompt.append("  \"task\": \"developer_trait_analysis\",\n");
        prompt.append("  \"description\": \"Analyze developer traits based on their code to determine their development style and preferences\",\n");
        prompt.append("  \"note\": \"Please make sure to respond to this request strictly in the following JSON format. Do not say anything outside of the specified format.\",\n");
        
        // 개발자 특성 정의
        prompt.append("  \"trait_definitions\": {\n");
        prompt.append("    \"development_style\": {\n");
        prompt.append("      \"B\": {\n");
        prompt.append("        \"name\": \"Builder\",\n");
        prompt.append("        \"description\": \"Prefers quick implementation and practicality\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Simple, straightforward solutions\",\n");
        prompt.append("          \"Minimal abstractions\",\n");
        prompt.append("          \"Focus on working code over perfect architecture\",\n");
        prompt.append("          \"Pragmatic approach to problem-solving\",\n");
        prompt.append("          \"Direct implementation without over-engineering\"\n");
        prompt.append("        ]\n");
        prompt.append("      },\n");
        prompt.append("      \"A\": {\n");
        prompt.append("        \"name\": \"Architect\",\n");
        prompt.append("        \"description\": \"Pursues systematic and perfect design\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Well-structured code with clear separation of concerns\",\n");
        prompt.append("          \"Use of design patterns\",\n");
        prompt.append("          \"Comprehensive error handling\",\n");
        prompt.append("          \"Detailed documentation\",\n");
        prompt.append("          \"Scalable and maintainable architecture\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    },\n");
        prompt.append("    \"developer_preference\": {\n");
        prompt.append("      \"R\": {\n");
        prompt.append("        \"name\": \"Refiner\",\n");
        prompt.append("        \"description\": \"Prefers improving and optimizing existing code\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Code refactoring patterns\",\n");
        prompt.append("          \"Performance optimizations\",\n");
        prompt.append("          \"Code cleanup and simplification\",\n");
        prompt.append("          \"Improving readability\",\n");
        prompt.append("          \"Fixing technical debt\"\n");
        prompt.append("        ]\n");
        prompt.append("      },\n");
        prompt.append("      \"I\": {\n");
        prompt.append("        \"name\": \"Innovator\",\n");
        prompt.append("        \"description\": \"Enjoys exploring new technologies and approaches\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Use of cutting-edge technologies\",\n");
        prompt.append("          \"Experimental approaches\",\n");
        prompt.append("          \"Integration of new libraries/frameworks\",\n");
        prompt.append("          \"Creative problem-solving\",\n");
        prompt.append("          \"Early adoption of new features\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    }\n");
        prompt.append("  },\n");
        
        // 분석 지침
        prompt.append("  \"analysis_instructions\": {\n");
        prompt.append("    \"steps\": [\n");
        prompt.append("      \"Examine code structure and organization\",\n");
        prompt.append("      \"Identify design patterns and architectural choices\",\n");
        prompt.append("      \"Analyze technology choices and dependencies\",\n");
        prompt.append("      \"Evaluate code style and documentation\",\n");
        prompt.append("      \"Assess problem-solving approaches\"\n");
        prompt.append("    ],\n");
        prompt.append("    \"scoring_guidelines\": {\n");
        prompt.append("      \"development_style_score\": {\n");
        prompt.append("        \"range\": [-50, 50],\n");
        prompt.append("        \"interpretation\": {\n");
        prompt.append("          \"-50 to -21\": \"Strong Builder (B) tendency\",\n");
        prompt.append("          \"-20 to -1\": \"Moderate Builder (B) tendency\",\n");
        prompt.append("          \"0\": \"Balanced between Builder and Architect\",\n");
        prompt.append("          \"1 to 20\": \"Moderate Architect (A) tendency\",\n");
        prompt.append("          \"21 to 50\": \"Strong Architect (A) tendency\"\n");
        prompt.append("        }\n");
        prompt.append("      },\n");
        prompt.append("      \"developer_preference_score\": {\n");
        prompt.append("        \"range\": [-50, 50],\n");
        prompt.append("        \"interpretation\": {\n");
        prompt.append("          \"-50 to -21\": \"Strong Innovator (I) tendency\",\n");
        prompt.append("          \"-20 to -1\": \"Moderate Innovator (I) tendency\",\n");
        prompt.append("          \"0\": \"Balanced between Refiner and Innovator\",\n");
        prompt.append("          \"1 to 20\": \"Moderate Refiner (R) tendency\",\n");
        prompt.append("          \"21 to 50\": \"Strong Refiner (R) tendency\"\n");
        prompt.append("        }\n");
        prompt.append("      },\n");
        prompt.append("      \"confidence_score\": {\n");
        prompt.append("        \"range\": [0, 100],\n");
        prompt.append("        \"factors\": [\n");
        prompt.append("          \"Amount of code analyzed\",\n");
        prompt.append("          \"Variety of code patterns observed\",\n");
        prompt.append("          \"Consistency of traits across different code sections\",\n");
        prompt.append("          \"Clarity of trait indicators\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    }\n");
        prompt.append("  },\n");
        
        // 출력 형식
        prompt.append("  \"output_format\": {\n");
        prompt.append("    \"type_code\": \"string (BR, BI, AR, AI)\",\n");
        prompt.append("    \"development_style_score\": \"integer (-50 to 50)\",\n");
        prompt.append("    \"developer_preference_score\": \"integer (-50 to 50)\",\n");
        prompt.append("    \"confidence_score\": \"integer (0 to 100)\",\n");
        prompt.append("    \"comment\": \"string (Korean language preferred)\",\n");
        prompt.append("    \"language\": \"string (detected programming language)\",\n");
        prompt.append("    \"detailed_analysis\": {\n");
        prompt.append("      \"reasoning\": \"string (Korean) - 분석 결과의 근거와 이유를 상세히 설명\",\n");
        prompt.append("      \"code_patterns\": [\n");
        prompt.append("        {\n");
        prompt.append("          \"pattern\": \"string - 패턴명\",\n");
        prompt.append("          \"description\": \"string (Korean) - 패턴 설명\",\n");
        prompt.append("          \"evidence\": [\"array of strings (Korean) - 구체적인 증거들\"],\n");
        prompt.append("          \"impact_score\": \"integer (1-10) - 분석 결과에 미친 영향도\"\n");
        prompt.append("        }\n");
        prompt.append("      ],\n");
        prompt.append("      \"strengths\": [\"array of strings (Korean) - 개발자의 강점들\"],\n");
        prompt.append("      \"suggestions\": [\"array of strings (Korean) - 개선 제안사항들\"]\n");
        prompt.append("    }\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");
        
        // 분석 지시문
        prompt.append("Based on the above analysis framework, analyze the provided ").append(language).append(" code and return ONLY a JSON response in this exact format:\n\n");
        
        // 예제 출력 (참고용)
        prompt.append("**EXAMPLE OUTPUT (DO NOT COPY - ANALYZE THE ACTUAL CODE PROVIDED BELOW):**\n");
        prompt.append("{\n");
        prompt.append("  \"type_code\": \"BR\",\n");
        prompt.append("  \"development_style_score\": -25,\n");
        prompt.append("  \"developer_preference_score\": 15,\n");
        prompt.append("  \"confidence_score\": 75,\n");
        prompt.append("  \"comment\": \"의존성 주입과 빌더 패턴을 활용하여 실용적인 구현을 선호하며, 코드 안정성과 유지보수성을 중시하는 개발자입니다.\",\n");
        prompt.append("  \"language\": \"java\",\n");
        prompt.append("  \"detailed_analysis\": {\n");
        prompt.append("    \"reasoning\": \"코드에서 생성자 기반 의존성 주입, 유효성 검사 메서드 분리, 빌더 패턴 활용 등 안정적이고 체계적인 구현 패턴을 확인했습니다.\",\n");
        prompt.append("    \"code_patterns\": [\n");
        prompt.append("      {\n");
        prompt.append("        \"pattern\": \"Constructor Dependency Injection\",\n");
        prompt.append("        \"description\": \"생성자를 통한 의존성 주입 패턴\",\n");
        prompt.append("        \"evidence\": [\"final 키워드를 사용한 불변 필드\", \"생성자에서 의존성 주입\", \"순환 참조 방지\"],\n");
        prompt.append("        \"impact_score\": 9\n");
        prompt.append("      }\n");
        prompt.append("    ],\n");
        prompt.append("    \"strengths\": [\"의존성 관리가 체계적임\", \"예외 처리가 구체적이고 명확함\", \"메서드 분리를 통한 책임 분산\"],\n");
        prompt.append("    \"suggestions\": [\"단위 테스트 커버리지 확대\", \"로깅 추가로 디버깅 편의성 향상\"]\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");
        
        // 중요 요구사항
        prompt.append("**🚨 CRITICAL ANALYSIS REQUIREMENTS - MUST FOLLOW:**\n");
        prompt.append("1. **ANALYZE THE ACTUAL CODE** - Do not use generic placeholder text\n");
        prompt.append("2. **detailed_analysis.reasoning** - MUST explain specific code elements you observed\n");
        prompt.append("3. **detailed_analysis.code_patterns** - MUST identify at least 2-3 REAL patterns with concrete evidence\n");
        prompt.append("4. **detailed_analysis.strengths** - MUST list at least 3-5 specific strengths from the code\n");
        prompt.append("5. **detailed_analysis.suggestions** - MUST provide at least 2-3 actionable improvement suggestions\n");
        prompt.append("6. **All Korean text** - reasoning, pattern descriptions, strengths, suggestions must be in Korean\n");
        prompt.append("7. **Evidence arrays** - Each code pattern must have specific code evidence, not generic statements\n");
        prompt.append("8. **RETURN RAW JSON ONLY** - DO NOT USE ```json``` OR ANY MARKDOWN FORMATTING\n");
        prompt.append("9. **NO EXTRA TEXT** - Start with { and end with }, nothing else before or after\n");
        prompt.append("10. **IMPORTANT** - Your entire response must be a valid JSON object that can be parsed directly\n\n");
        
        prompt.append("**CODE TO ANALYZE (PROVIDE DETAILED ANALYSIS OF THIS SPECIFIC CODE):**\n\n");
        
        return prompt.toString();
    }

    //프로그래밍 언어 감지
    public String detectLanguage(String code) {
        if (code == null || code.trim().isEmpty()) {
            return "Unknown";
        }

        // Java 감지
        if (code.contains("import java.") || code.contains("public class") || code.contains("package ") || 
            code.contains("@Service") || code.contains("@Entity") || code.contains("@Controller")) {
            return "Java";
        }
        
        // JavaScript/TypeScript 감지
        if (code.contains("function ") || code.contains("console.log") || code.contains("const ") || 
            code.contains("let ") || code.contains("var ") || code.contains("export ") || 
            code.contains("import ") || code.contains("React") || code.contains("useState")) {
            if (code.contains("interface ") || code.contains(": string") || code.contains(": number") || 
                code.contains("TypeScript") || code.contains("tsx")) {
                return "TypeScript";
            }
            return "JavaScript";
        }
        
        // Python 감지
        if (code.contains("def ") || code.contains("import ") || code.contains("print(") || 
            code.contains("class ") || code.contains("if __name__") || code.contains("from ")) {
            return "Python";
        }
        
        // C++ 감지
        if (code.contains("#include") || code.contains("using namespace") || code.contains("std::") ||
            code.contains("cout") || code.contains("endl")) {
            return "C++";
        }
        
        // C# 감지
        if (code.contains("using System") || code.contains("namespace ") || 
            (code.contains("public class") && code.contains("Console.WriteLine"))) {
            return "C#";
        }
        
        // Go 감지
        if (code.contains("package main") || code.contains("func ") || code.contains("import (") ||
            code.contains("fmt.Print")) {
            return "Go";
        }
        
        // Rust 감지
        if (code.contains("fn ") || code.contains("use ") || code.contains("struct ") || 
            code.contains("impl ") || code.contains("println!")) {
            return "Rust";
        }
        
        // PHP 감지
        if (code.contains("<?php") || (code.contains("function ") && code.contains("$")) || 
            code.contains("echo ")) {
            return "PHP";
        }
        
        // Ruby 감지
        if (code.contains("def ") || code.contains("class ") || code.contains("require ") || 
            code.contains("puts ") || code.contains("end")) {
            return "Ruby";
        }
        
        // Swift 감지
        if (code.contains("import Foundation") || code.contains("import UIKit") || 
            (code.contains("func ") && code.contains("var ") && code.contains("let "))) {
            return "Swift";
        }
        
        // Kotlin 감지
        if (code.contains("fun ") || (code.contains("class ") && code.contains("package ")) || 
            code.contains("println(")) {
            return "Kotlin";
        }
        
        // HTML 감지
        if (code.contains("<html") || code.contains("<div") || code.contains("<!DOCTYPE") ||
            code.contains("<body") || code.contains("<head")) {
            return "HTML";
        }
        
        // CSS 감지
        if (code.contains("body {") || code.contains(".class") || code.contains("#id") ||
            code.contains("margin:") || code.contains("padding:")) {
            return "CSS";
        }
        
        // SQL 감지
        if (code.contains("SELECT ") || code.contains("CREATE TABLE") || code.contains("INSERT INTO") ||
            code.contains("UPDATE ") || code.contains("DELETE FROM")) {
            return "SQL";
        }
        
        // JSON 감지
        String trimmed = code.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || 
            (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            return "JSON";
        }
        
        // XML 감지
        if (code.contains("<?xml") || code.contains("<root") || 
            (code.contains("<") && code.contains("/>"))) {
            return "XML";
        }
        
        return "Unknown";
    }
}