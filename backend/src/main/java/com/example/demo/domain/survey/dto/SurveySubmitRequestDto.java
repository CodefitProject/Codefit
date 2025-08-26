package com.example.demo.domain.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

/**
 * 설문 제출 요청 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record SurveySubmitRequestDto(
    @NotNull(message = "사용자 ID는 필수입니다")
    Long userId,
    
    @NotEmpty(message = "설문 응답은 필수입니다")
    @Valid
    List<QuestionAnswerDto> answers
) {
}

