package com.example.demo.domain.codeanalysis.service;

import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
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

    private final CodeAnalysisRepository codeAnalysisRepository; // 코드 분석 결과 저장소
    private final ObjectMapper objectMapper; // JSON 파싱 객체
    private final GeminiService geminiService; // Gemini AI 서비스

    //코드 분석 메인 메서드
    @Transactional
    public CodeAnalysisResponseDto analyzeCode(Long userId, List<MultipartFile> files) {

        try {
            // 1. 업로드된 코드 파일들을 하나의 문자열로 결합
            StringBuilder codeContent = new StringBuilder();
            for (MultipartFile file : files) {
                codeContent.append("--- File: ").append(file.getOriginalFilename()).append(" ---").append(System.lineSeparator());
                codeContent.append(new String(file.getBytes(), StandardCharsets.UTF_8));
                codeContent.append(System.lineSeparator()).append(System.lineSeparator());
            }

            // 2. Gemini AI를 통한 코드 분석 실행
            String analysisResultJson = geminiService.analyzeCode(codeContent.toString());

            try {
                // 3. JSON 응답 파싱 및 결과 추출 시도
                Map<String, Object> analysisResult = objectMapper.readValue(analysisResultJson, Map.class);

                // Gemini 응답에서 실제 분석 값 추출
                String typeCode = (String) analysisResult.getOrDefault("type_code", "AI");
                Integer developmentStyleScore = (Integer) analysisResult.getOrDefault("development_style_score", 0);
                Integer developerPreferenceScore = (Integer) analysisResult.getOrDefault("developer_preference_score", 0);
                Integer confidenceScore = (Integer) analysisResult.getOrDefault("confidence_score", 50);
                String comment = (String) analysisResult.getOrDefault("comment", "코드 분석 완료");
                String language = (String) analysisResult.getOrDefault("language", "unknown");
                
                // detailed_analysis 정보 추출 (있으면 사용)
                Map<String, Object> detailedAnalysis = (Map<String, Object>) analysisResult.get("detailed_analysis");
                String analysisComment = comment;
                if (detailedAnalysis != null) {
                    List<String> strengths = (List<String>) detailedAnalysis.get("strengths");
                    List<String> suggestions = (List<String>) detailedAnalysis.get("suggestions");
                    
                    if (strengths != null && suggestions != null) {
                        analysisComment = String.format("%s | 강점: %s | 제안: %s", 
                            comment,
                            String.join(", ", strengths.subList(0, Math.min(2, strengths.size()))),
                            String.join(", ", suggestions.subList(0, Math.min(2, suggestions.size()))));
                    }
                }

                // 4. 코드 분석 엔티티 생성
                CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                        .userId(userId)
                        .analysisResult(analysisResultJson) // JSON 형태의 전체 분석 결과
                        .typeCode(typeCode) // 실제 분석된 개발자 타입 코드 (AI, AR, BI, BR)
                        .developmentStyleScore(developmentStyleScore) // 실제 개발 스타일 점수 (-50 ~ +50)
                        .developerPreferenceScore(developerPreferenceScore) // 실제 개발자 선호도 점수 (-50 ~ +50)
                        .confidenceScore(new java.math.BigDecimal(confidenceScore / 100.0)) // 신뢰도 점수를 0.0~1.0으로 변환
                        .comment(analysisComment)
                        .build();

                // 5. 분석 결과를 데이터베이스에 저장
                CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);
                log.info("코드 분석 결과 저장 완료, 분석 ID: {}", savedAnalysis.getAnalysisId());

                // 6. 성공 응답 DTO 생성 및 반환
                return new CodeAnalysisResponseDto(
                        savedAnalysis.getAnalysisId(), // 분석 결과 ID
                        savedAnalysis.getUserId(), // 사용자 ID
                        savedAnalysis.getTypeCode(), // 개발자 타입 코드
                        "적응형 지능형", // 타입 이름 (한국어)
                        "Gemini AI를 활용한 코드 분석", // 분석 설명
                        savedAnalysis.getDevelopmentStyleScore(), // 개발 스타일 점수
                        savedAnalysis.getDeveloperPreferenceScore(), // 개발자 선호도 점수
                        savedAnalysis.getConfidenceScore(), // 신뢰도 점수
                        "자동_감지", // 감지 방식
                        savedAnalysis.getAnalysisResult(), // 전체 분석 결과
                        savedAnalysis.getComment(), // 분석 코멘트
                        savedAnalysis.getCreatedAt(), // 생성 일시
                        true, // 성공 여부
                        "코드 분석이 성공적으로 완료되었습니다." // 메시지
                );

            } catch (JsonProcessingException e) {
                // JSON 파싱 실패 시 처리 (Gemini 응답이 유효한 JSON이 아닌 경우)
                log.error("Gemini AI 응답 JSON 파싱 실패: {}", analysisResultJson, e);

                // 기본값으로 분석 결과 저장
                CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                        .userId(userId)
                        .analysisResult(analysisResultJson) // 원본 응답 그대로 저장
                        .typeCode("AI") // 기본 타입 코드
                        .developmentStyleScore(0) // 중립 점수
                        .developerPreferenceScore(0) // 중립 점수
                        .confidenceScore(new java.math.BigDecimal("0.50")) // 낮은 신뢰도
                        .comment("분석은 완료되었으나 상세 결과 파싱에 실패했습니다.")
                        .build();

                // 파싱 실패한 결과도 데이터베이스에 저장
                CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);
                log.warn("JSON 파싱 실패했지만 분석 결과 저장 완료, 분석 ID: {}", savedAnalysis.getAnalysisId());

                // 부분적 성공 응답 DTO 생성 및 반환
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
                        false, // 파싱 오류로 인한 부분적 성공
                        "코드 분석은 완료되었으나 결과 파싱 중 오류가 발생했습니다."
                );
            }
        } catch (Exception e) {
            // 전체적인 예외 발생 시 처리 (네트워크 오류, 파일 읽기 오류 등)
            log.error("사용자 {}의 코드 분석 중 예기치 못한 오류 발생", userId, e);
            
            // 실패 응답 DTO 반환
            return new CodeAnalysisResponseDto(
                    null, // 분석 ID 없음
                    userId, // 사용자 ID는 유지
                    null, // 타입 코드 없음
                    null, // 타입 이름 없음
                    null, // 분석 설명 없음
                    0, // 기본 점수
                    0, // 기본 점수
                    null, // 신뢰도 없음
                    null, // 감지 방식 없음
                    null, // 분석 결과 없음
                    null, // 코멘트 없음
                    null, // 생성 일시 없음
                    false, // 실패
                    "코드 분석 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }
}

