package com.example.demo.domain.codeanalysis.repository;

import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {
}