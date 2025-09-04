package com.example.demo.common.service;

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

/**
 * Gemini AI 서비스
 * 
 * Google의 Gemini AI API를 활용하여 코드 분석을 수행하는 서비스
 * 코드를 입력받아 개발자의 코딩 스타일과 성향을 분석하여 반환
 * 
 * @author CodeFIT Team
 * @since 2025.09.04
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey; // Gemini API 키

    @Value("${gemini.api.model}")
    private String model; // 사용할 Gemini 모델명

    @Value("${gemini.api.project-id}")
    private String projectId; // Google Cloud 프로젝트 ID

    @Value("${gemini.api.location}")
    private String location; // API 서비스 지역

    private final RestTemplate restTemplate = new RestTemplate(); // HTTP 요청 클라이언트
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱 객체
    private final PromptService promptService; // 프롬프트 생성 서비스

    /**
     * 코드 분석 메서드
     * 
     * 입력받은 코드를 Gemini AI에게 전송하여 개발자의 코딩 스타일과
     * 성향을 분석하고 JSON 형식의 결과를 반환한다.
     * 
     * @param code 분석할 코드 문자열
     * @return JSON 형식의 분석 결과
     * @throws IOException API 호출 오류 또는 응답 파싱 오류
     */
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
            log.debug("Gemini API 호출 시작: {}", url);
            String response = restTemplate.postForObject(url, entity, String.class);
            log.debug("Gemini API 호출 성공, 응답 길이: {} 문자", response != null ? response.length() : 0);

            // 7. 응답에서 분석 결과 텍스트 추출
            JsonNode root = objectMapper.readTree(response);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            
            if (textNode.isMissingNode()) {
                log.error("Gemini 응답에서 텍스트를 찾을 수 없음: {}", response);
                throw new IOException("Gemini 응답 파싱에 실패했습니다.");
            }
            
            String analysisResult = textNode.asText();
            log.debug("분석 결과 추출 성공, 길이: {} 문자", analysisResult.length());
            
            return analysisResult;
        } catch (Exception e) {
            // API 호출 오류 처리 (네트워크 오류, 인증 오류, JSON 파싱 오류 등)
            log.error("Gemini API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new IOException("Gemini API 호출 오류: " + e.getMessage(), e);
        }
    }
}