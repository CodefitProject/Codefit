package com.example.demo.domain.company.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record CompanyListResponseDto(
    Long totalCount,
    List<CompanyInfoDto> companies
) {
}