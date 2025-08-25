package com.example.demo.domain.company.dto;

import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record CreateCompanyDto(
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        String email,
        
        @NotBlank(message = "패스워드는 필수입니다")
        String password,
        
        @NotBlank(message = "기업명은 필수입니다")
        String name,
        
        @NotBlank(message = "사업자등록번호는 필수입니다")
        String businessNumber,
        
        @NotBlank(message = "산업분류는 필수입니다")
        String industry,
        
        String empCount,
        
        String description,
        
        @NotNull(message = "사업자등록증명원은 필수입니다")
        MultipartFile businessCertificate,
        
        MultipartFile logo
) {}
