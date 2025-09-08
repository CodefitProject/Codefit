package com.example.demo.domain.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompanyOwnerInfoDto {
    private String email;
    private String name;
    private Long baseUserId;
    private Long companyId;
}
