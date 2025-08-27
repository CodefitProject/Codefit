package com.example.demo.domain.company.controller;

import com.example.demo.domain.company.dto.CompanyListResponseDto;
import com.example.demo.domain.company.dto.CreateCompanyDto;
import com.example.demo.domain.company.dto.CreateCompanyRequestDto;
import com.example.demo.domain.company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/public/company/register")
    public ResponseEntity<String> createCompany(@Valid CreateCompanyDto dto) {
        return companyService.createCompany(dto);
    }

    @GetMapping("/public/companies")
    public ResponseEntity<CompanyListResponseDto> getCompaniesForMainPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        return ResponseEntity.ok(companyService.getCompaniesForMainPage(page, size));
    }
}
