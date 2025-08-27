package com.example.demo.domain.survey.repository;

import com.example.demo.domain.survey.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 설문 질문 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {

    /**
     * 활성화된 설문 질문 목록 조회 (질문 ID 순으로 정렬)
     */
    @Query("SELECT sq FROM SurveyQuestion sq WHERE sq.isActive = true ORDER BY sq.questionId ASC")
    List<SurveyQuestion> findActiveQuestionsOrderById();

    /**
     * 축별 활성화된 설문 질문 목록 조회
     */
    List<SurveyQuestion> findByAxisAndIsActiveTrueOrderByQuestionIdAsc(String axis);

    /**
     * 활성화된 설문 질문 개수 조회
     */
    long countByIsActiveTrue();
}

