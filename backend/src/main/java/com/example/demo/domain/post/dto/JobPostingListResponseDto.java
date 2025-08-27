package com.example.demo.domain.post.dto;

import lombok.Builder;

import java.util.List;

/**
 * 채용 공고 목록 응답 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record JobPostingListResponseDto(
    List<JobPostingDto> jobPostings,
    Long totalCount,
    Integer currentPage,
    Integer totalPages
) {
}

