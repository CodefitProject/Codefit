package com.example.demo.domain.codeanalysis.dto;

import java.math.BigDecimal;

public record CodeAnalysisCreateDto(
    Long userId,
    String analysisResult,
    String typeCode,
    Integer developmentStyleScore,
    Integer developerPreferenceScore,
    BigDecimal confidenceScore,
    String comment
) {}