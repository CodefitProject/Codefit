package com.example.demo.domain.survey.dto;

import com.example.demo.domain.codeanalysis.entity.UsersMbtiTypes;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MBTI 계산 결과 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record MbtiCalculationResultDto(
    Long typeId,
    Long userId,
    String typeCode,
    String typeName,
    String typeDescription,
    Map<String, Double> scores,
    String codeAnalysisComment,
    String codeAnalysisDetail,
    String axisContributions,
    String answerPattern,
    String keyInsights,
    Integer confidenceScore,
    Boolean isMbtiChecked,
    Boolean isCodeChecked,
    LocalDateTime analyzedAt
) {
    
    /**
     * UsersMbtiTypes와 CodeAnalysis로부터 DTO 생성
     */
    public static MbtiCalculationResultDto from(UsersMbtiTypes mbtiTypes, CodeAnalysis codeAnalysis, 
                                               String typeName, String typeDescription,
                                               String axisContributions, String answerPattern, String keyInsights) {
        
        // BigDecimal을 Double로 변환
        Double aBScore = mbtiTypes.getABScore() != null ? mbtiTypes.getABScore().doubleValue() : 0.0;
        Double rIScore = mbtiTypes.getRIScore() != null ? mbtiTypes.getRIScore().doubleValue() : 0.0;
        Double sTScore = mbtiTypes.getSTScore() != null ? mbtiTypes.getSTScore().doubleValue() : 0.0;
        Double dFScore = mbtiTypes.getDFScore() != null ? mbtiTypes.getDFScore().doubleValue() : 0.0;
        
        return MbtiCalculationResultDto.builder()
                .typeId(mbtiTypes.getTypeId())
                .userId(mbtiTypes.getBaseUser().getBaseUserId())
                .typeCode(mbtiTypes.getTypeCode())
                .typeName(typeName)
                .typeDescription(typeDescription)
                .scores(Map.of(
                    "B_A", aBScore,
                    "R_I", rIScore,
                    "S_T", sTScore,
                    "D_F", dFScore
                ))
                .codeAnalysisComment(codeAnalysis != null ? codeAnalysis.getComment() : null)
                .codeAnalysisDetail(codeAnalysis != null ? buildCodeAnalysisDetail(codeAnalysis) : null)
                .axisContributions(axisContributions)
                .answerPattern(answerPattern)
                .keyInsights(keyInsights)
                .confidenceScore(codeAnalysis != null && codeAnalysis.getConfidenceScore() != null ? 
                    (int)(codeAnalysis.getConfidenceScore().doubleValue() * 100) : null)
                .isMbtiChecked(mbtiTypes.getIsMbtiChecked())
                .isCodeChecked(mbtiTypes.getIsCodeChecked())
                .analyzedAt(mbtiTypes.getAnalyzedAt())
                .build();
    }
    
    /**
     * 코드 분석 상세 정보를 JSON 형태로 구성
     */
    private static String buildCodeAnalysisDetail(CodeAnalysis codeAnalysis) {
        if (codeAnalysis == null) return null;
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> detailedAnalysis = new HashMap<>();
            
            detailedAnalysis.put("reasoning", codeAnalysis.getReasoning() != null ? codeAnalysis.getReasoning() : "");
            detailedAnalysis.put("code_patterns", parseCodePatterns(codeAnalysis.getCodePatterns()));
            detailedAnalysis.put("strengths", parseListFromString(codeAnalysis.getStrengths()));
            detailedAnalysis.put("suggestions", parseListFromString(codeAnalysis.getSuggestions()));
            
            Map<String, Object> result = new HashMap<>();
            result.put("detailed_analysis", detailedAnalysis);
            
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            // JSON 생성 실패 시 null 반환
            return null;
        }
    }
    
    /**
     * 코드 패턴 문자열을 배열로 파싱
     */
    private static List<Map<String, Object>> parseCodePatterns(String codePatterns) {
        List<Map<String, Object>> patterns = new ArrayList<>();
        
        if (codePatterns == null || codePatterns.trim().isEmpty()) {
            return patterns;
        }
        
        // 숫자로 시작하는 패턴들을 분리
        String[] patternTexts = codePatterns.split("\\n\\n");
        
        for (String patternText : patternTexts) {
            if (patternText.trim().isEmpty()) continue;
            
            Map<String, Object> pattern = new HashMap<>();
            String[] lines = patternText.split("\\n");
            
            if (lines.length > 0) {
                // 첫 번째 줄에서 패턴명과 영향도 추출
                String firstLine = lines[0].trim();
                if (firstLine.matches("^\\d+\\..*")) {
                    String patternName = firstLine.replaceFirst("^\\d+\\. ", "");
                    if (patternName.contains(" (")) {
                        patternName = patternName.substring(0, patternName.indexOf(" ("));
                    }
                    pattern.put("pattern", patternName);
                }
                
                // 설명 추출
                StringBuilder description = new StringBuilder();
                int impactScore = 0;
                
                for (String line : lines) {
                    if (line.trim().startsWith("설명:")) {
                        description.append(line.replaceFirst("^\\s*설명:\\s*", ""));
                    } else if (line.trim().startsWith("영향도:")) {
                        try {
                            String scoreStr = line.replaceFirst("^\\s*영향도:\\s*", "").trim();
                            impactScore = Integer.parseInt(scoreStr);
                        } catch (NumberFormatException e) {
                            impactScore = 5; // 기본값
                        }
                    }
                }
                
                pattern.put("description", description.toString());
                pattern.put("impact_score", impactScore);
                pattern.put("evidence", new ArrayList<>()); // 빈 배열로 설정
            }
            
            patterns.add(pattern);
        }
        
        return patterns;
    }
    
    /**
     * 문자열을 리스트로 파싱 (• 또는 - 로 구분된 항목들)
     */
    private static List<String> parseListFromString(String text) {
        List<String> items = new ArrayList<>();
        
        if (text == null || text.trim().isEmpty()) {
            return items;
        }
        
        // • 또는 - 로 시작하는 항목들을 분리
        String[] lines = text.split("\\n");
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                String item = trimmed.replaceFirst("^[•-]\\s*", "");
                if (!item.isEmpty()) {
                    items.add(item);
                }
            }
        }
        
        return items;
    }
}

