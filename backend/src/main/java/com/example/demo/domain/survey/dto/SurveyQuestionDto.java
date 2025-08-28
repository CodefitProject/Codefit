package com.example.demo.domain.survey.dto;

import com.example.demo.domain.survey.entity.SurveyQuestion;
import lombok.Builder;

/**
 * 설문 질문 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record SurveyQuestionDto(
    Long questionId,
    String questionText,
    String axis,
    Integer options,
    Boolean isActive
) {
    public static SurveyQuestionDto from(SurveyQuestion question) {
        return SurveyQuestionDto.builder()
                .questionId(question.getQuestionId())
                .questionText(question.getQuestionText())
                .axis(question.getAxis())
                .options(question.getOptions())
                .isActive(question.getIsActive())
                .build();
    }
}

