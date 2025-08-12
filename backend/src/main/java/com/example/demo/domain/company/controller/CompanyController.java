package com.example.demo.domain.company.controller;

import com.example.demo.domain.company.dto.CreateCompanyDto;
import com.example.demo.domain.company.service.CompanyService;
import com.example.demo.util.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Long>> createCompany(@Valid @ModelAttribute CreateCompanyDto dto) {
        return companyService.createCompany(dto);
    }
}
