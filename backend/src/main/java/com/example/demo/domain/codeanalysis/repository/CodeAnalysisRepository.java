package com.example.demo.domain.codeanalysis.repository;

import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {
    
    /**
     * 분석 ID로 코드 분석 결과 조회
     */
    Optional<CodeAnalysis> findByAnalysisId(Long analysisId);
    
    /**
     * 사용자 ID와 분석 ID로 코드 분석 결과 조회 (보안 강화)
     */
    Optional<CodeAnalysis> findByAnalysisIdAndBaseUserId(Long analysisId, Long baseUserId);
}