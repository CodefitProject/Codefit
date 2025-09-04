package com.example.demo.domain.codeanalysis.service;

import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.global.exception.GeminiException;
import com.example.demo.domain.codeanalysis.repository.CodeAnalysisRepository;
import com.example.demo.common.service.GeminiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CodeAnalysisService {

    private final CodeAnalysisRepository codeAnalysisRepository;
    private final ObjectMapper objectMapper;
    private final GeminiService geminiService;

    //코드 분석 메인 메서드
    @Transactional
    public CodeAnalysisResponseDto analyzeCode(Long userId, List<MultipartFile> files) {
        // 1. 업로드된 코드 파일들을 하나의 문자열로 결합
        StringBuilder codeContent = new StringBuilder();
        for (MultipartFile file : files) {
            try {
                codeContent.append("--- File: ").append(file.getOriginalFilename()).append(" ---").append(System.lineSeparator());
                codeContent.append(new String(file.getBytes(), StandardCharsets.UTF_8));
                codeContent.append(System.lineSeparator()).append(System.lineSeparator());
            } catch (Exception e) {
                throw new GeminiException("파일 읽기 중 오류가 발생했습니다: " + file.getOriginalFilename(), e);
            }
        }

        // 2. Gemini AI를 통한 코드 분석 실행
        String analysisResultJson;
        try {
            analysisResultJson = geminiService.analyzeCode(codeContent.toString());
        } catch (Exception e) {
            throw new GeminiException("Gemini AI 분석 요청 중 오류가 발생했습니다", e);
        }

        // 3. JSON 응답 파싱 및 결과 추출
        Map<String, Object> analysisResult;
        try {
            analysisResult = objectMapper.readValue(analysisResultJson, 
                objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
        } catch (JsonProcessingException e) {
            log.error("Gemini AI 응답 JSON 파싱 실패: {}", analysisResultJson, e);
            return createPartialSuccessResponse(userId, analysisResultJson);
        }

        // Gemini 응답에서 실제 분석 값 추출
        String typeCode = (String) analysisResult.getOrDefault("type_code", "AI");
        Integer developmentStyleScore = (Integer) analysisResult.getOrDefault("development_style_score", 0);
        Integer developerPreferenceScore = (Integer) analysisResult.getOrDefault("developer_preference_score", 0);
        Integer confidenceScore = (Integer) analysisResult.getOrDefault("confidence_score", 50);
        String comment = (String) analysisResult.getOrDefault("comment", "코드 분석 완료");
        //String language = (String) analysisResult.getOrDefault("language", "unknown");

        // 4. 코드 분석 엔티티 생성
        CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                .userId(userId)
                .analysisResult(analysisResultJson)
                .typeCode(typeCode)
                .developmentStyleScore(developmentStyleScore)
                .developerPreferenceScore(developerPreferenceScore)
                .confidenceScore(new java.math.BigDecimal(confidenceScore / 100.0))
                .comment(comment)
                .build();

        // 5. 분석 결과를 데이터베이스에 저장
        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        // 6. 성공 응답 DTO 생성 및 반환
        return new CodeAnalysisResponseDto(
                savedAnalysis.getAnalysisId(),
                savedAnalysis.getUserId(),
                savedAnalysis.getTypeCode(),
                "적응형 지능형",
                "Gemini AI를 활용한 코드 분석",
                savedAnalysis.getDevelopmentStyleScore(),
                savedAnalysis.getDeveloperPreferenceScore(),
                savedAnalysis.getConfidenceScore(),
                "자동_감지",
                savedAnalysis.getAnalysisResult(),
                savedAnalysis.getComment(),
                savedAnalysis.getCreatedAt(),
                true,
                "코드 분석이 성공적으로 완료되었습니다."
        );
    }

    private CodeAnalysisResponseDto createPartialSuccessResponse(Long userId, String analysisResultJson) {
        CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                .userId(userId)
                .analysisResult(analysisResultJson)
                .typeCode("AI")
                .developmentStyleScore(0)
                .developerPreferenceScore(0)
                .confidenceScore(new java.math.BigDecimal("0.50"))
                .comment("분석은 완료되었으나 상세 결과 파싱에 실패했습니다.")
                .build();

        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        return new CodeAnalysisResponseDto(
                savedAnalysis.getAnalysisId(),
                savedAnalysis.getUserId(),
                savedAnalysis.getTypeCode(),
                "적응형 지능형",
                "Gemini AI를 활용한 코드 분석",
                savedAnalysis.getDevelopmentStyleScore(),
                savedAnalysis.getDeveloperPreferenceScore(),
                savedAnalysis.getConfidenceScore(),
                "자동_감지",
                savedAnalysis.getAnalysisResult(),
                savedAnalysis.getComment(),
                savedAnalysis.getCreatedAt(),
                false,
                "코드 분석은 완료되었으나 결과 파싱 중 오류가 발생했습니다."
        );
    }
}

