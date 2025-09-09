package com.example.demo.domain.company.repository;

import com.example.demo.domain.company.entity.Company;
import com.example.demo.domain.company.enums.CompanyStatus;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>, CompanyRepositoryCustom {

    boolean existsByBusinessNumber(String businessNumber);

    Long countByStatus(CompanyStatus status);

    boolean existsByBaseUserEmail(String email);

    Optional<Company> findByBaseUserBaseUserId(Long baseUserId);

    List<Company> findAllByStatusOrderByCreatedAtDesc(CompanyStatus status, Pageable pageable);
}
