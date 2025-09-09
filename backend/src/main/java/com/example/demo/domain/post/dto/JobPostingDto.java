package com.example.demo.domain.post.dto;

import com.example.demo.domain.post.entity.JobPosting;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 채용 공고 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record JobPostingDto(
    Long jobPostingId,
    Long companyId,
    String companyName,
    String title,
    String description,
    String experienceLevel,
    String salaryRange,
    String location,
    String workType,
    String preferredDeveloperTypes,
    LocalDateTime expiresAt,
    String status,
    String jobImagePath,
    String logoPath,
    LocalDateTime createdAt,
    Boolean isApplied,
    Boolean isOwner, // 공고 소유자 여부 추가
    String selectedTechStackNames // 기술스택 정보 추가
) {
    public static JobPostingDto from(JobPosting jobPosting) {
        // 기술스택 이름들을 쉼표로 연결된 문자열로 변환
        String techStackNames = jobPosting.getTechStacks().stream()
                .map(techStack -> techStack.getTechStackName())
                .collect(java.util.stream.Collectors.joining(","));
        
        return JobPostingDto.builder()
                .jobPostingId(jobPosting.getJobPostingId())
                .companyId(jobPosting.getCompany().getCompanyId())
                .companyName(jobPosting.getCompany().getBaseUser().getName())
                .title(jobPosting.getTitle())
                .description(jobPosting.getDescription())
                .experienceLevel(jobPosting.getExperienceLevel())
                .salaryRange(jobPosting.getSalaryRange())
                .location(jobPosting.getLocation())
                .workType(jobPosting.getWorkType())
                .preferredDeveloperTypes(jobPosting.getPreferredDeveloperTypes())
                .expiresAt(jobPosting.getExpiresAt())
                .status(jobPosting.getStatus())
                .jobImagePath(jobPosting.getJobImagePath())
                .logoPath(jobPosting.getCompany().getLogoPath())
                .createdAt(jobPosting.getCreatedAt())
                .isApplied(false) // 기본값, 실제로는 Service에서 계산
                .isOwner(false) // 기본값, 실제로는 Service에서 계산
                .selectedTechStackNames(techStackNames) // 기술스택 정보 설정
                .build();
    }
}

