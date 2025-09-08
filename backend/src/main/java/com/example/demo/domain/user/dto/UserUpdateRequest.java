package com.example.demo.domain.user.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * 사용자 정보 수정 요청 DTO
 * 개인정보와 이력서를 함께 처리하는 통합 요청 객체
 */
public record UserUpdateRequest(
        String name,
        String career,
        String currentPosition,
        String yearSalary,
        String bio,
        String preferredLocations,
        String techStack,
        MultipartFile resumeFile
) {
}