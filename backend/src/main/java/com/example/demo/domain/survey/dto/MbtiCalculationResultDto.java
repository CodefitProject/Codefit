package com.example.demo.domain.survey.dto;

import com.example.demo.domain.codeanalysis.entity.UsersMbtiTypes;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
        
        StringBuilder detail = new StringBuilder();
        detail.append("{");
        detail.append("\"detailed_analysis\":{");
        detail.append("\"reasoning\":\"").append(codeAnalysis.getReasoning() != null ? codeAnalysis.getReasoning() : "").append("\",");
        detail.append("\"code_patterns\":").append(codeAnalysis.getCodePatterns() != null ? codeAnalysis.getCodePatterns() : "[]").append(",");
        detail.append("\"strengths\":").append(codeAnalysis.getStrengths() != null ? codeAnalysis.getStrengths() : "[]").append(",");
        detail.append("\"suggestions\":").append(codeAnalysis.getSuggestions() != null ? codeAnalysis.getSuggestions() : "[]");
        detail.append("}}");
        
        return detail.toString();
    }
}

