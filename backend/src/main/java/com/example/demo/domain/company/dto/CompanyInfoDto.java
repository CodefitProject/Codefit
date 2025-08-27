package com.example.demo.domain.company.dto;

import com.example.demo.domain.company.entity.Company;
import lombok.Builder;

@Builder
public record CompanyInfoDto(
    Long userId,
    String name,
    String logoPath
) {
    public static CompanyInfoDto from(Company company) {
        return CompanyInfoDto.builder()
                .userId(company.getBaseUser().getBaseUserId())
                .name(company.getBaseUser().getName())
                .logoPath(company.getLogoPath())
                .build();
    }
}