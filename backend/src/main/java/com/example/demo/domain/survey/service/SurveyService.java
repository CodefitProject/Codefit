package com.example.demo.domain.survey.service;

import com.example.demo.domain.survey.dto.*;

/**
 * 설문 관련 서비스 인터페이스
 * 
 * @author 배상현
 * @since 2025/01/21
 */
public interface SurveyService {
    
    /**
     * 활성화된 설문 질문 목록 조회
     * 
     * @return 설문 질문 목록
     */
    SurveyQuestionsResponseDto getActiveQuestions();
    
    /**
     * 설문 응답 제출 및 MBTI 타입 계산
     * 
     * @param requestDto 설문 제출 요청 정보
     * @return MBTI 계산 결과
     */
    MbtiCalculationResultDto submitSurveyAndCalculateMbti(SurveySubmitRequestDto requestDto);
    
    /**
     * 사용자의 최종 MBTI 타입 조회
     * 
     * @param userId 사용자 ID
     * @return MBTI 타입 정보
     */
    MbtiCalculationResultDto getUserMbtiType(Long userId);
    
    /**
     * 설문 완료 여부 확인
     * 
     * @param userId 사용자 ID
     * @return 설문 완료 여부
     */
    boolean isSurveyCompleted(Long userId);
}

