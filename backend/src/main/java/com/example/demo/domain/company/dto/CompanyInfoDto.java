package com.example.demo.domain.company.dto;

import com.example.demo.domain.company.entity.Company;
import lombok.Builder;

@Builder
public record CompanyInfoDto(
    Long id,
    String name,
    String logoPath
) {
    public static CompanyInfoDto from(Company company) {
        return CompanyInfoDto.builder()
                .id(company.getId())
                .name(company.getName())
                .logoPath(company.getLogoPath())
                .build();
    }
}