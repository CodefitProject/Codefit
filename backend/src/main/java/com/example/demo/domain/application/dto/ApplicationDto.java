package com.example.demo.domain.application.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ApplicationDto(
        int applicationId,
        String name,
        String email,
        String career,
        String currentPosition,
        String applicationStatus,
        String typeCode,
        String resumeFileName,
        String userId,
        List<String> stacks
) {}
