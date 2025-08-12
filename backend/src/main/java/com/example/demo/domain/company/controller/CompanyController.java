package com.example.demo.domain.company.controller;

import com.example.demo.domain.company.dto.CreateCompanyDto;
import com.example.demo.domain.company.service.CompanyService;
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
    public ResponseEntity<String> createCompany(@Valid @ModelAttribute CreateCompanyDto dto) {
        return companyService.createCompany(dto);
    }
}
