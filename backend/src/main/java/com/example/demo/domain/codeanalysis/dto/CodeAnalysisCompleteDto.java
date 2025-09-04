package com.example.demo.domain.codeanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysisCompleteDto {
    private Long analysisId;
    private boolean success;
    private String message;
}