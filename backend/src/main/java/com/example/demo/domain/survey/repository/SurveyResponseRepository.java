package com.example.demo.domain.survey.repository;

import com.example.demo.domain.survey.entity.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 설문 응답 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {

    /**
     * 사용자의 최신 설문 응답 조회
     */
    @Query("SELECT sr FROM SurveyResponse sr WHERE sr.user.baseUserId = :userId ORDER BY sr.createdAt DESC LIMIT 1")
    Optional<SurveyResponse> findLatestResponseByUserId(@Param("userId") Long userId);

    /**
     * 사용자의 설문 응답 존재 여부 확인
     */
    boolean existsByUserBaseUserId(Long userId);

    /**
     * 사용자의 모든 설문 응답 삭제
     */
    void deleteByUserBaseUserId(Long userId);
}

