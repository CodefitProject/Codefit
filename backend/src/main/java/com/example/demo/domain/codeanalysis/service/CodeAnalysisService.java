package com.example.demo.domain.codeanalysis.service;

import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisCompleteDto;
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

    //코드 분석 메인 메서드 - ID만 반환
    @Transactional
    public CodeAnalysisCompleteDto analyzeCode(Long baseUserId, List<MultipartFile> files) {
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
            return createPartialSuccessResponse(baseUserId, analysisResultJson);
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
                .baseUserId(baseUserId)
                .analysisResult(analysisResultJson)
                .typeCode(typeCode)
                .developmentStyleScore(developmentStyleScore)
                .developerPreferenceScore(developerPreferenceScore)
                .confidenceScore(new java.math.BigDecimal(confidenceScore / 100.0))
                .comment(comment)
                .build();

        // 5. 분석 결과를 데이터베이스에 저장
        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        // 6. 완료 응답 DTO 생성 및 반환 (ID만 포함)
        return new CodeAnalysisCompleteDto(
                savedAnalysis.getAnalysisId(),
                true,
                "코드 분석이 성공적으로 완료되었습니다."
        );
    }

    private CodeAnalysisCompleteDto createPartialSuccessResponse(Long baseUserId, String analysisResultJson) {
        CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                .baseUserId(baseUserId)
                .analysisResult(analysisResultJson)
                .typeCode("AI")
                .developmentStyleScore(0)
                .developerPreferenceScore(0)
                .confidenceScore(new java.math.BigDecimal("0.50"))
                .comment("분석은 완료되었으나 상세 결과 파싱에 실패했습니다.")
                .build();

        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        return new CodeAnalysisCompleteDto(
                savedAnalysis.getAnalysisId(),
                false,
                "코드 분석은 완료되었으나 결과 파싱 중 오류가 발생했습니다."
        );
    }

    /**
     * 분석 ID로 코드 분석 결과 조회
     */
    @Transactional(readOnly = true)
    public CodeAnalysisResponseDto getAnalysisResult(Long analysisId) {
        CodeAnalysis analysis = codeAnalysisRepository.findByAnalysisId(analysisId)
                .orElseThrow(() -> new GeminiException("분석 결과를 찾을 수 없습니다. ID: " + analysisId));

        return new CodeAnalysisResponseDto(
                analysis.getAnalysisId(),
                analysis.getBaseUserId(),
                analysis.getTypeCode(),
                "적응형 지능형", // 고정값 (프론트에서 타입별 이름 처리)
                "Gemini AI를 활용한 코드 분석",
                analysis.getDevelopmentStyleScore(),
                analysis.getDeveloperPreferenceScore(),
                analysis.getConfidenceScore(),
                "자동_감지",
                analysis.getAnalysisResult(),
                analysis.getComment(),
                analysis.getCreatedAt(),
                true,
                "분석 결과 조회 완료"
        );
    }

    /**
     * 사용자 ID와 분석 ID로 코드 분석 결과 조회 (보안 강화)
     */
    @Transactional(readOnly = true)
    public CodeAnalysisResponseDto getAnalysisResultByUser(Long analysisId, Long baseUserId) {
        log.info("분석 결과 조회 시도 - analysisId: {}, baseUserId: {}", analysisId, baseUserId);
        
        CodeAnalysis analysis = codeAnalysisRepository.findByAnalysisIdAndBaseUserId(analysisId, baseUserId)
                .orElseThrow(() -> {
                    log.error("분석 결과 조회 실패 - analysisId: {}, baseUserId: {}", analysisId, baseUserId);
                    return new GeminiException("분석 결과를 찾을 수 없거나 접근 권한이 없습니다.");
                });

        return new CodeAnalysisResponseDto(
                analysis.getAnalysisId(),
                analysis.getBaseUserId(),
                analysis.getTypeCode(),
                "적응형 지능형",
                "Gemini AI를 활용한 코드 분석",
                analysis.getDevelopmentStyleScore(),
                analysis.getDeveloperPreferenceScore(),
                analysis.getConfidenceScore(),
                "자동_감지",
                analysis.getAnalysisResult(),
                analysis.getComment(),
                analysis.getCreatedAt(),
                true,
                "분석 결과 조회 완료"
        );
    }
}

