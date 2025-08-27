package com.example.demo.domain.survey.controller;

import com.example.demo.domain.survey.dto.*;
import com.example.demo.domain.survey.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 설문 관련 REST API 컨트롤러
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
@Slf4j
public class SurveyController {
    
    private final SurveyService surveyService;
    
    /**
     * 활성화된 설문 질문 목록 조회
     * 
     * @return 설문 질문 목록
     */
    @GetMapping("/questions")
    public ResponseEntity<SurveyQuestionsResponseDto> getQuestions() {
        log.debug("설문 질문 목록 조회 요청");
        
        SurveyQuestionsResponseDto response = surveyService.getActiveQuestions();
        log.debug("설문 질문 조회 완료 - 총 {}개", response.totalCount());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 설문 응답 제출 및 MBTI 타입 계산
     * 
     * @param requestDto 설문 제출 요청 데이터
     * @return MBTI 계산 결과
     */
    @PostMapping("/submit")
    public ResponseEntity<MbtiCalculationResultDto> submitSurvey(
            @Valid @RequestBody SurveySubmitRequestDto requestDto) {
        
        log.debug("설문 제출 요청 - 사용자 ID: {}, 응답 수: {}", 
                requestDto.userId(), requestDto.answers().size());
        
        MbtiCalculationResultDto result = surveyService.submitSurveyAndCalculateMbti(requestDto);
        log.debug("설문 제출 완료 - 최종 타입: {}", result.typeCode());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 사용자의 MBTI 타입 조회
     * 
     * @param userId 사용자 ID
     * @return MBTI 타입 정보
     */
    @GetMapping("/result/{userId}")
    public ResponseEntity<MbtiCalculationResultDto> getMbtiType(@PathVariable Long userId) {
        log.debug("MBTI 타입 조회 요청 - 사용자 ID: {}", userId);
        
        MbtiCalculationResultDto result = surveyService.getUserMbtiType(userId);
        
        if (result == null) {
            log.debug("MBTI 타입 정보가 없습니다 - 사용자 ID: {}", userId);
            return ResponseEntity.notFound().build();
        }
        
        log.debug("MBTI 타입 조회 완료 - 타입: {}", result.typeCode());
        return ResponseEntity.ok(result);
    }
    
    /**
     * 설문 완료 여부 확인
     * 
     * @param userId 사용자 ID
     * @return 설문 완료 여부
     */
    @GetMapping("/completed/{userId}")
    public ResponseEntity<Boolean> isSurveyCompleted(@PathVariable Long userId) {
        log.debug("설문 완료 여부 확인 요청 - 사용자 ID: {}", userId);
        
        boolean isCompleted = surveyService.isSurveyCompleted(userId);
        log.debug("설문 완료 여부: {}", isCompleted);
        
        return ResponseEntity.ok(isCompleted);
    }
}

