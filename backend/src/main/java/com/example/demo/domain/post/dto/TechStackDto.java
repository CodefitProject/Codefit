package com.example.demo.domain.post.dto;

import com.example.demo.domain.post.entity.TechStack;
import lombok.Builder;

/**
 * 기술 스택 DTO
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Builder
public record TechStackDto(
    Long techStackId,
    String techStackName
) {
    public static TechStackDto from(TechStack techStack) {
        return TechStackDto.builder()
                .techStackId(techStack.getTechStackId())
                .techStackName(techStack.getTechStackName())
                .build();
    }
}

