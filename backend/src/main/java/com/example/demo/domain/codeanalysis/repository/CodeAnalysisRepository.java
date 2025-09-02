package com.example.demo.domain.codeanalysis.repository;

import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {
    
    List<CodeAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<CodeAnalysis> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    
    long countByUserId(Long userId);
}