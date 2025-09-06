package com.example.demo.common.service;

import com.example.demo.global.exception.GeminiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate(); // HTTP 요청 클라이언트
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱 객체
    private final PromptService promptService; // 프롬프트 생성 서비스

    //코드 분석 메서드
    public String analyzeCode(String code) throws IOException {
        // 1. Gemini API URL 생성
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey);

        // 2. HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 3. 프로그래밍 언어 감지 및 분석 프롬프트 생성
        String detectedLanguage = promptService.detectLanguage(code);
        String prompt = promptService.buildCodeAnalysisPrompt(detectedLanguage) + code;
        log.debug("감지된 언어: {}, 프롬프트 길이: {} 문자", detectedLanguage, prompt.length());

        // 4. API 요청 본문 생성
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        // 5. HTTP 요청 엔티티 생성
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 6. Gemini API 호출 실행
        try {
            String response = restTemplate.postForObject(url, entity, String.class);

            // 7. 응답에서 분석 결과 텍스트 추출
            JsonNode root = objectMapper.readTree(response);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            
            if (textNode.isMissingNode()) {
                log.error("Gemini 응답에서 텍스트를 찾을 수 없음: {}", response);
                throw new GeminiException("Gemini 응답 파싱에 실패했습니다.");
            }

            return textNode.asText();

        } catch (Exception e) {
            // API 호출 오류 처리 (네트워크 오류, 인증 오류, JSON 파싱 오류 등)
            log.error("Gemini API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new GeminiException("Gemini API 호출 오류: " + e.getMessage(), e);
        }
    }
}