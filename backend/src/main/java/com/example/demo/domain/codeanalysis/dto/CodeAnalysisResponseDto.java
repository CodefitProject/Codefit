package com.example.demo.domain.codeanalysis.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CodeAnalysisResponseDto(
    Long analysisId,
    Long userId,
    String typeCode,
    String typeName,
    String typeDescription,
    Integer developmentStyleScore,
    Integer developerPreferenceScore,
    BigDecimal confidenceScore,
    String language,
    String reasoning,
    String strengths,
    String suggestions,
    String codePatterns,
    String comment,
    LocalDateTime createdAt,
    boolean success,
    String message
) {}