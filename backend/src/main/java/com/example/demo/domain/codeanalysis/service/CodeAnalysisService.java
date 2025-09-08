package com.example.demo.domain.codeanalysis.service;

import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisCompleteDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.domain.codeanalysis.entity.UsersMbtiTypes;
import com.example.demo.domain.codeanalysis.repository.UsersMbtiTypesRepository;
import com.example.demo.global.exception.GeminiException;
import com.example.demo.domain.codeanalysis.repository.CodeAnalysisRepository;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.common.service.GeminiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CodeAnalysisService {

    private final CodeAnalysisRepository codeAnalysisRepository;
    private final UsersMbtiTypesRepository usersMbtiTypesRepository;
    private final BaseUserRepository baseUserRepository;
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

        // 4. Gemini 응답에서 실제 분석 값 추출
        String typeCode = (String) analysisResult.getOrDefault("type_code", "AI");
        Integer developmentStyleScore = (Integer) analysisResult.getOrDefault("development_style_score", 0);
        Integer developerPreferenceScore = (Integer) analysisResult.getOrDefault("developer_preference_score", 0);
        Integer confidenceScore = (Integer) analysisResult.getOrDefault("confidence_score", 50);
        String comment = (String) analysisResult.getOrDefault("comment", "코드 분석 완료");
        String language = (String) analysisResult.getOrDefault("language", "unknown");
        
        // detailed_analysis 내부 필드들 추출
        Map<String, Object> detailedAnalysis = (Map<String, Object>) analysisResult.get("detailed_analysis");
        String reasoning = detailedAnalysis != null ? (String) detailedAnalysis.get("reasoning") : null;
        String strengths = null;
        String suggestions = null;
        String codePatterns = null;
        
        try {
            strengths = detailedAnalysis != null ? convertArrayToText((List<?>) detailedAnalysis.get("strengths")) : null;
            suggestions = detailedAnalysis != null ? convertArrayToText((List<?>) detailedAnalysis.get("suggestions")) : null;
            codePatterns = detailedAnalysis != null ? convertCodePatternsToText((List<?>) detailedAnalysis.get("code_patterns")) : null;
        } catch (Exception e) {
            log.warn("detailed_analysis 필드 텍스트 변환 실패", e);
        }

        // 5. 코드 분석 엔티티 생성
        CodeAnalysis codeAnalysis = CodeAnalysis.builder()
                .baseUserId(baseUserId)
                .analysisResult(analysisResultJson)
                .typeCode(typeCode)
                .developmentStyleScore(developmentStyleScore)
                .developerPreferenceScore(developerPreferenceScore)
                .confidenceScore(new java.math.BigDecimal(confidenceScore / 100.0))
                .comment(comment)
                .language(language)
                .reasoning(reasoning)
                .strengths(strengths)
                .suggestions(suggestions)
                .codePatterns(codePatterns)
                .build();

        // 6. 분석 결과를 데이터베이스에 저장
        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        // 7. UsersMbtiTypes 엔티티 생성 또는 업데이트
        createOrUpdateUsersMbtiTypes(baseUserId);

        // 8. 완료 응답 DTO 생성 및 반환
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
                .language("unknown")
                .reasoning("분석 결과 파싱 실패")
                .strengths(null)
                .suggestions(null)
                .codePatterns(null)
                .build();

        CodeAnalysis savedAnalysis = codeAnalysisRepository.save(codeAnalysis);

        return new CodeAnalysisCompleteDto(
                savedAnalysis.getAnalysisId(),
                false,
                "코드 분석은 완료되었으나 결과 파싱 중 오류가 발생했습니다."
        );
    }

    /**
     * 사용자 ID와 분석 ID로 코드 분석 결과 조회
     */
    @Transactional(readOnly = true)
    public CodeAnalysisResponseDto getAnalysisResultByUser(Long analysisId, Long baseUserId) {
        
        CodeAnalysis analysis = codeAnalysisRepository.findByAnalysisIdAndBaseUserId(analysisId, baseUserId)
                .orElseThrow(() -> {
                    log.error("분석 결과 조회 실패 - analysisId: {}, baseUserId: {}", analysisId, baseUserId);
                    return new GeminiException("분석 결과를 찾을 수 없거나 접근 권한이 없습니다.");
                });

        return new CodeAnalysisResponseDto(
                analysis.getAnalysisId(),
                analysis.getBaseUserId(),
                analysis.getTypeCode(),
                getTypeNameByCode(analysis.getTypeCode()),
                "Gemini AI를 활용한 코드 분석",
                analysis.getDevelopmentStyleScore(),
                analysis.getDeveloperPreferenceScore(),
                analysis.getConfidenceScore(),
                analysis.getLanguage(),
                analysis.getReasoning(),
                analysis.getStrengths(),
                analysis.getSuggestions(),
                analysis.getCodePatterns(),
                analysis.getComment(),
                analysis.getCreatedAt(),
                true,
                "분석 결과 조회 완료"
        );
    }

    /**
     * UsersMbtiTypes 엔티티 생성 또는 업데이트
     */
    private void createOrUpdateUsersMbtiTypes(Long baseUserId) {
        BaseUser baseUser = baseUserRepository.findById(baseUserId)
                .orElseThrow(() -> new GeminiException("사용자를 찾을 수 없습니다."));

        UsersMbtiTypes usersMbtiTypes = usersMbtiTypesRepository.findByBaseUser_BaseUserId(baseUserId)
                .orElse(UsersMbtiTypes.builder()
                        .baseUser(baseUser)
                        .isCodeChecked(true)
                        .isMbtiChecked(false)
                        .build());

        if (usersMbtiTypes.getTypeId() != null) {
            usersMbtiTypes.markCodeChecked();
        }

        usersMbtiTypesRepository.save(usersMbtiTypes);
    }

    /**
     * 배열을 텍스트로 변환 (strengths, suggestions용)
     */
    private String convertArrayToText(List<?> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.joining("\n• ", "• ", ""));
    }

    /**
     * code_patterns 배열을 텍스트로 변환
     */
    private String convertCodePatternsToText(List<?> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i) instanceof Map) {
                Map<?, ?> pattern = (Map<?, ?>) list.get(i);
                result.append(String.format("%d. %s\n", i + 1, pattern.get("pattern")));
                result.append(String.format("   설명: %s\n", pattern.get("description")));
                if (pattern.get("impact_score") != null) {
                    result.append(String.format("   영향도: %s\n", pattern.get("impact_score")));
                }
                result.append("\n");
            }
        }
        return result.toString().trim();
    }

    /**
     * 타입 코드에 따른 타입 이름 반환
     */
    private String getTypeNameByCode(String typeCode) {
        return switch (typeCode) {
            case "AI" -> "미래 지향적 설계자";
            case "AR" -> "체계적인 진화자";
            case "BI" -> "신속한 혁신가";
            case "BR" -> "실용적인 개선자";
            default -> "알 수 없는 타입";
        };
    }
}

