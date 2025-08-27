package com.example.demo.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채용 공고 생성 요청 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record CreateJobPostingRequestDto(
    @NotNull(message = "회사 ID는 필수입니다")
    Long companyId,
    
    @NotBlank(message = "공고 제목은 필수입니다")
    String title,
    
    @NotBlank(message = "공고 설명은 필수입니다")
    String description,
    
    String experienceLevel,
    String salaryRange,
    String location,
    String workType,
    String preferredDeveloperTypes,
    
    @NotNull(message = "공고 만료일은 필수입니다")
    LocalDateTime expiresAt,
    
    String selectedTechStackNames
) {
}

