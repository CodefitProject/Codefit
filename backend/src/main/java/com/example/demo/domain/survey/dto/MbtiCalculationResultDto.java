package com.example.demo.domain.survey.dto;

import com.example.demo.domain.survey.entity.MbtiResult;
import lombok.Builder;

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
    public static MbtiCalculationResultDto from(MbtiResult result) {
        return MbtiCalculationResultDto.builder()
                .typeId(result.getTypeId())
                .userId(result.getUser().getBaseUserId())
                .typeCode(result.getTypeCode())
                .typeName(result.getTypeName())
                .typeDescription(result.getTypeDescription())
                .scores(Map.of(
                    "B_A", result.getAbScore(),
                    "R_I", result.getRiScore(),
                    "S_T", result.getStScore(),
                    "D_F", result.getDfScore()
                ))
                .codeAnalysisComment(result.getCodeAnalysisComment())
                .codeAnalysisDetail(result.getCodeAnalysisDetail())
                .axisContributions(result.getAxisContributions())
                .answerPattern(result.getAnswerPattern())
                .keyInsights(result.getKeyInsights())
                .isMbtiChecked(result.getIsMbtiChecked())
                .isCodeChecked(result.getIsCodeChecked())
                .analyzedAt(result.getAnalyzedAt())
                .build();
    }
}

