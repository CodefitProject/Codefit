package com.example.demo.domain.company.repository;

import com.example.demo.domain.company.dto.CompanyInfoDto;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;

public interface CompanyRepositoryCustom {
    Page<CompanyInfoDto> findActiveCompanyInfoWithUser(Pageable pageable);
}
