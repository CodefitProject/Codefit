package com.example.demo.domain.company.repository;

import com.example.demo.domain.company.entity.Company;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    boolean existsByEmail(String email);
    
    boolean existsByBusinessNumber(String businessNumber);
    
    Optional<Company> findByEmail(String email);
    
    Optional<Company> findByBusinessNumber(String businessNumber);
    
    List<Company> findAllByStatus(Company.CompanyStatus status);
    
    List<Company> findAllByStatusOrderByCreatedAtDesc(Company.CompanyStatus status, Pageable pageable);
    
    Long countByStatus(Company.CompanyStatus status);
}
