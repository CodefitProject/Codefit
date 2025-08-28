package com.example.demo.domain.post.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * 채용 지원 요청 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record JobApplicationRequestDto(
    @NotNull(message = "채용 공고 ID는 필수입니다")
    Long jobPostingId,
    
    @NotNull(message = "사용자 ID는 필수입니다")
    Long userId
) {
}

