package com.example.demo.domain.survey.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * 질문 응답 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record QuestionAnswerDto(
    @NotNull(message = "질문 ID는 필수입니다")
    Long questionId,
    
    @NotNull(message = "답변 값은 필수입니다")
    @Min(value = 1, message = "답변 값은 1 이상이어야 합니다")
    @Max(value = 7, message = "답변 값은 7 이하여야 합니다")
    Integer answerValue
) {
}

