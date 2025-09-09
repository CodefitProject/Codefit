package com.example.demo.domain.codeanalysis.repository;

import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
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
    
    /**
     * 사용자 ID로 코드 분석 결과 목록 조회
     */
    List<CodeAnalysis> findByBaseUserId(Long baseUserId);
    
    /**
     * 사용자 ID로 가장 최신 코드 분석 결과 조회 (created_at 기준 내림차순)
     */
    Optional<CodeAnalysis> findTopByBaseUserIdOrderByCreatedAtDesc(Long baseUserId);
}