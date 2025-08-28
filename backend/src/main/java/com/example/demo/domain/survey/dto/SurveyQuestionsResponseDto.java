package com.example.demo.domain.survey.dto;

import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * 설문 질문 목록 응답 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record SurveyQuestionsResponseDto(
    Map<String, List<SurveyQuestionDto>> questions,
    Integer totalCount
) {
}

