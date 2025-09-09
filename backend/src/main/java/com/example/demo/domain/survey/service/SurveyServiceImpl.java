package com.example.demo.domain.survey.service;

import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.survey.dto.*;
import com.example.demo.domain.survey.entity.SurveyQuestion;
import com.example.demo.domain.survey.entity.SurveyResponse;
import com.example.demo.domain.survey.repository.SurveyQuestionRepository;
import com.example.demo.domain.survey.repository.SurveyResponseRepository;
import com.example.demo.domain.codeanalysis.entity.UsersMbtiTypes;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.domain.codeanalysis.repository.UsersMbtiTypesRepository;
import com.example.demo.domain.codeanalysis.repository.CodeAnalysisRepository;
import com.example.demo.global.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 설문 관련 서비스 구현체
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SurveyServiceImpl implements SurveyService {
    
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final UsersMbtiTypesRepository usersMbtiTypesRepository;
    private final CodeAnalysisRepository codeAnalysisRepository;
    private final BaseUserRepository baseUserRepository;
    private final ObjectMapper objectMapper;
    
    // 설문 점수 계산 상수 (균등 배분 방식)
    private static final int OPTION_COUNT = 7;           // 7지선다
    private static final int CENTER_OPTION = 4;          // 중간값 (4번 = 0점)
    private static final int TARGET_RANGE = 50;          // 목표 범위 (±50점)
    private static final int QUESTIONS_PER_AXIS = 5;     // 축당 문제 수
    private static final int MAX_DEVIATION = (OPTION_COUNT - 1) / 2; // 최대 편차 (3)
    private static final double UNIT_SCORE = (double) TARGET_RANGE / (QUESTIONS_PER_AXIS * MAX_DEVIATION); // 3.333...
    
    // 가중치 설정 (설문:코드분석)
    private static final double WEIGHT_BA_SURVEY = 0.6;
    private static final double WEIGHT_BA_CODE = 0.4;
    private static final double WEIGHT_RI_SURVEY = 0.75;
    private static final double WEIGHT_RI_CODE = 0.25;
    private static final double WEIGHT_ST_SURVEY = 1.0;
    private static final double WEIGHT_ST_CODE = 0.0;
    private static final double WEIGHT_DF_SURVEY = 1.0;
    private static final double WEIGHT_DF_CODE = 0.0;
    
    // MBTI 타입 이름 매핑
    private static final Map<String, String> TYPE_NAMES = new HashMap<>();
    static {
        TYPE_NAMES.put("BRSD", "실용적 안정성 추구자");
        TYPE_NAMES.put("BRSF", "민첩한 기능 빌더");
        TYPE_NAMES.put("BRTD", "신뢰성 있는 팀 디버거");
        TYPE_NAMES.put("BRTF", "빠른 팀 기능 개발자");
        TYPE_NAMES.put("BISD", "혁신적 솔로 디버거");
        TYPE_NAMES.put("BISF", "창의적 스피드 러너");
        TYPE_NAMES.put("BITD", "실험적 팀 문제 해결사");
        TYPE_NAMES.put("BITF", "혁신적 팀 크리에이터");
        TYPE_NAMES.put("ARSD", "체계적 리팩터 마스터");
        TYPE_NAMES.put("ARSF", "균형잡힌 솔로 아키텍트");
        TYPE_NAMES.put("ARTD", "완벽주의 팀 디버거");
        TYPE_NAMES.put("ARTF", "구조적 팀 빌더");
        TYPE_NAMES.put("AISD", "혁신적 설계 전문가");
        TYPE_NAMES.put("AISF", "창의적 솔로 아키텍트");
        TYPE_NAMES.put("AITD", "미래지향 팀 디버거");
        TYPE_NAMES.put("AITF", "혁신적 팀 아키텍트");
    }
    
    @Override
    @Transactional(readOnly = true)
    public SurveyQuestionsResponseDto getActiveQuestions() {
        log.debug("활성화된 설문 질문 목록 조회");
        
        try {
            List<SurveyQuestion> questions = surveyQuestionRepository.findActiveQuestionsOrderById();
            
            // 축 순서를 보장하기 위한 LinkedHashMap 사용
            Map<String, List<SurveyQuestionDto>> groupedQuestions = new LinkedHashMap<>();
            
            // 축 순서를 명시적으로 초기화 (B/A -> R/I -> S/T -> D/F)
            String[] axisOrder = {"B/A", "R/I", "S/T", "D/F"};
            for (String axis : axisOrder) {
                groupedQuestions.put(axis, new ArrayList<>());
            }
            
            // 질문을 축별로 그룹핑
            for (SurveyQuestion question : questions) {
                String axis = question.getAxis();
                if (groupedQuestions.containsKey(axis)) {
                    groupedQuestions.get(axis).add(SurveyQuestionDto.from(question));
                }
            }
            
            log.debug("설문 질문 조회 완료 - 총 {}개", questions.size());
            
            return SurveyQuestionsResponseDto.builder()
                    .questions(groupedQuestions)
                    .totalCount(questions.size())
                    .build();
                    
        } catch (Exception e) {
            log.error("설문 질문 조회 중 오류 발생", e);
            throw new BusinessException("설문 질문 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    public MbtiCalculationResultDto submitSurveyAndCalculateMbti(SurveySubmitRequestDto requestDto) {
        log.debug("설문 응답 제출 - 사용자 ID: {}", requestDto.userId());
        
        try {
            // 1. 사용자 존재 여부 확인
            BaseUser user = baseUserRepository.findById(requestDto.userId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다."));
            
            // 2. 설문 응답 저장
            String responsesJson = objectMapper.writeValueAsString(requestDto.answers());
            
            SurveyResponse response = SurveyResponse.builder()
                    .user(user)
                    .responses(responsesJson)
                    .build();
            
            surveyResponseRepository.save(response);
            log.debug("설문 응답 저장 완료");
            
            // 3. 설문 점수 계산
            Map<String, Double> surveyScores = calculateSurveyScores(requestDto.answers());
            log.debug("설문 점수 계산 완료: {}", surveyScores);
            
            // 4. 코드 분석 결과 조회
            CodeAnalysis codeAnalysis = codeAnalysisRepository.findByBaseUserId(requestDto.userId())
                    .stream().findFirst().orElse(null);
            
            // 5. 코드 분석 점수 추출
            Map<String, Object> codeScores = new HashMap<>();
            if (codeAnalysis != null) {
                codeScores.put("developmentStyleScore", codeAnalysis.getDevelopmentStyleScore());
                codeScores.put("developerPreferenceScore", codeAnalysis.getDeveloperPreferenceScore());
                log.debug("코드 분석 점수 - 개발 스타일: {}, 개발자 선호도: {}", 
                         codeAnalysis.getDevelopmentStyleScore(), codeAnalysis.getDeveloperPreferenceScore());
            } else {
                log.debug("코드 분석 결과가 없어 기본값 사용");
            }
            
            // 6. 기존 MBTI 결과 확인
            UsersMbtiTypes existingResult = usersMbtiTypesRepository.findByBaseUser_BaseUserId(requestDto.userId())
                    .orElse(null);
            
            // 7. 최종 MBTI 타입 계산
            Map<String, Double> finalScores = calculateFinalScores(surveyScores, codeScores);
            String finalTypeCode = calculateTypeCode(finalScores);
            String typeName = TYPE_NAMES.getOrDefault(finalTypeCode, "알 수 없는 유형");
            String typeDescription = generateTypeDescription(finalTypeCode);
            
            // 8. 키 인사이트 생성
            String keyInsights = generateKeyInsights(requestDto.answers());
            
            UsersMbtiTypes savedResult;
            if (existingResult != null) {
                // 기존 결과 업데이트
                existingResult.setTypeCode(finalTypeCode);
                existingResult.updateScores(
                    java.math.BigDecimal.valueOf(finalScores.get("B/A")),
                    java.math.BigDecimal.valueOf(finalScores.get("R/I")),
                    java.math.BigDecimal.valueOf(finalScores.get("S/T")),
                    java.math.BigDecimal.valueOf(finalScores.get("D/F"))
                );
                existingResult.markMbtiChecked();
                if (codeAnalysis != null) {
                    existingResult.markCodeChecked();
                }
                savedResult = usersMbtiTypesRepository.save(existingResult);
                log.debug("기존 MBTI 결과 업데이트 완료 - 타입: {}", savedResult.getTypeCode());
            } else {
                // 새 결과 생성
                UsersMbtiTypes newResult = UsersMbtiTypes.builder()
                        .baseUser(user)
                        .typeCode(finalTypeCode)
                        .aBScore(java.math.BigDecimal.valueOf(finalScores.get("B/A")))
                        .rIScore(java.math.BigDecimal.valueOf(finalScores.get("R/I")))
                        .sTScore(java.math.BigDecimal.valueOf(finalScores.get("S/T")))
                        .dFScore(java.math.BigDecimal.valueOf(finalScores.get("D/F")))
                        .isMbtiChecked(true)
                        .isCodeChecked(codeAnalysis != null)
                        .analyzedAt(java.time.LocalDateTime.now())
                        .build();
                savedResult = usersMbtiTypesRepository.save(newResult);
                log.debug("새 MBTI 결과 저장 완료 - 타입: {}", savedResult.getTypeCode());
            }
            
            return MbtiCalculationResultDto.from(savedResult, codeAnalysis, typeName, typeDescription, 
                                               null, null, keyInsights);
            
        } catch (Exception e) {
            log.error("설문 제출 및 MBTI 계산 중 오류 발생", e);
            throw new BusinessException("설문 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public MbtiCalculationResultDto getUserMbtiType(Long userId) {
        log.debug("사용자 MBTI 타입 조회 - 사용자 ID: {}", userId);
        
        try {
            UsersMbtiTypes result = usersMbtiTypesRepository.findByBaseUser_BaseUserId(userId)
                    .orElse(null);
            
            if (result == null) {
                log.debug("MBTI 타입 정보가 없습니다 - 사용자 ID: {}", userId);
                return null;
            }
            
            // 코드 분석 결과 조회
            CodeAnalysis codeAnalysis = codeAnalysisRepository.findByBaseUserId(userId)
                    .stream().findFirst().orElse(null);
            
            String typeName = TYPE_NAMES.getOrDefault(result.getTypeCode(), "알 수 없는 유형");
            String typeDescription = generateTypeDescription(result.getTypeCode());
            
            // 기존 설문 응답 조회하여 키 인사이트 생성
            Optional<SurveyResponse> surveyResponse = surveyResponseRepository.findLatestResponseByUserId(userId);
            String keyInsights = "[]";
            
            if (surveyResponse.isPresent()) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    List<QuestionAnswerDto> answers = objectMapper.readValue(
                        surveyResponse.get().getResponses(), 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, QuestionAnswerDto.class)
                    );
                    
                    keyInsights = generateKeyInsights(answers);
                } catch (Exception e) {
                    log.warn("기존 설문 응답 파싱 실패", e);
                }
            }
            
            log.debug("MBTI 타입 조회 완료 - 타입: {}", result.getTypeCode());
            return MbtiCalculationResultDto.from(result, codeAnalysis, typeName, typeDescription, 
                                               null, null, keyInsights);
            
        } catch (Exception e) {
            log.error("MBTI 타입 조회 중 오류 발생", e);
            throw new BusinessException("MBTI 타입 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isSurveyCompleted(Long userId) {
        log.debug("설문 완료 여부 확인 - 사용자 ID: {}", userId);
        
        try {
            boolean exists = surveyResponseRepository.existsByUserBaseUserId(userId);
            log.debug("설문 완료 여부: {}", exists);
            return exists;
            
        } catch (Exception e) {
            log.error("설문 완료 여부 확인 중 오류 발생", e);
            throw new BusinessException("설문 완료 여부 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 설문 응답으로부터 축별 점수 계산 (균등 배분 방식, 0점 기준 -50 ~ +50)
     */
    private Map<String, Double> calculateSurveyScores(List<QuestionAnswerDto> answers) {
        Map<String, Double> scores = new HashMap<>();
        Map<String, List<Double>> axisScores = new HashMap<>();
        
        // 축별 점수 리스트 초기화
        for (String axis : new String[]{"B/A", "R/I", "S/T", "D/F"}) {
            axisScores.put(axis, new ArrayList<>());
        }
        
        log.debug("균등 배분 설정: UNIT_SCORE = {} (7지선다, ±{}점)", UNIT_SCORE, TARGET_RANGE);
        
        // 질문별 점수 계산
        for (QuestionAnswerDto answer : answers) {
            Long questionId = answer.questionId();
            int answerValue = answer.answerValue();
            
            // 균등 배분 공식: (선택지 - 중간값) × 단위점수
            double questionScore = (answerValue - CENTER_OPTION) * UNIT_SCORE;
            
            log.debug("문제 {}: 답변({}) → 점수({})", questionId, answerValue, questionScore);
            
            // 축별 점수 배정 (질문 ID 기반)
            if (questionId >= 1 && questionId <= 5) {
                axisScores.get("B/A").add(questionScore);
            } else if (questionId >= 6 && questionId <= 10) {
                axisScores.get("R/I").add(questionScore);
            } else if (questionId >= 11 && questionId <= 15) {
                axisScores.get("S/T").add(questionScore);
            } else if (questionId >= 16 && questionId <= 20) {
                axisScores.get("D/F").add(questionScore);
            }
        }
        
        // 축별 점수 합계 계산
        for (String axis : new String[]{"B/A", "R/I", "S/T", "D/F"}) {
            List<Double> scoreList = axisScores.get(axis);
            if (!scoreList.isEmpty()) {
                double totalScore = scoreList.stream().mapToDouble(Double::doubleValue).sum();
                scores.put(axis, totalScore);
                log.debug("{} 축 최종 점수: {}문항 합계 = {}", axis, scoreList.size(), totalScore);
            } else {
                scores.put(axis, 0.0);
                log.debug("{} 축 응답 없음, 기본값 0.0 설정", axis);
            }
        }
        
        log.debug("설문 점수 계산 완료: {}", scores);
        return scores;
    }
    
    /**
     * 가중치를 적용하여 최종 점수 계산
     */
    private Map<String, Double> calculateFinalScores(Map<String, Double> surveyScores, 
                                                     Map<String, Object> codeScores) {
        
        // 코드 분석 점수 추출
        double codeStyleScore = 0.0;  // B/A 축에 영향
        double codeInnovationScore = 0.0;  // R/I 축에 영향
        
        if (codeScores.containsKey("developmentStyleScore")) {
            Integer styleScore = (Integer) codeScores.get("developmentStyleScore");
            if (styleScore != null) {
                codeStyleScore = styleScore.doubleValue();
                log.debug("코드 분석 - 개발 스타일 점수: {}", codeStyleScore);
            }
        }
        
        if (codeScores.containsKey("developerPreferenceScore")) {
            Integer prefScore = (Integer) codeScores.get("developerPreferenceScore");
            if (prefScore != null) {
                codeInnovationScore = prefScore.doubleValue();
                log.debug("코드 분석 - 개발자 선호도 점수: {}", codeInnovationScore);
            }
        }
        
        // B/A 축 계산 (+값: Architect, -값: Builder)
        double surveyBA = surveyScores.getOrDefault("B/A", 0.0);
        double finalBA = (surveyBA * WEIGHT_BA_SURVEY) + (codeStyleScore * WEIGHT_BA_CODE);
        
        // R/I 축 계산 (+값: Refactor, -값: Innovate)  
        double surveyRI = surveyScores.getOrDefault("R/I", 0.0);
        double finalRI = (surveyRI * WEIGHT_RI_SURVEY) + (codeInnovationScore * WEIGHT_RI_CODE);
        
        // S/T 축 계산 (+값: Team, -값: Solo) - 코드 분석 영향 없음
        double surveyST = surveyScores.getOrDefault("S/T", 0.0);
        double finalST = (surveyST * WEIGHT_ST_SURVEY);
        
        // D/F 축 계산 (+값: Feature, -값: Debug) - 코드 분석 영향 없음
        double surveyDF = surveyScores.getOrDefault("D/F", 0.0);
        double finalDF = (surveyDF * WEIGHT_DF_SURVEY);
        
        log.debug("설문 점수 - BA: {}, RI: {}, ST: {}, DF: {}", surveyBA, surveyRI, surveyST, surveyDF);
        log.debug("코드 분석 점수 - Style: {}, Innovation: {}", codeStyleScore, codeInnovationScore);
        log.debug("최종 계산 점수 - BA: {}, RI: {}, ST: {}, DF: {}", finalBA, finalRI, finalST, finalDF);
        
        Map<String, Double> finalScores = new HashMap<>();
        finalScores.put("B/A", finalBA);
        finalScores.put("R/I", finalRI);
        finalScores.put("S/T", finalST);
        finalScores.put("D/F", finalDF);
        
        return finalScores;
    }
    
    /**
     * 점수를 기반으로 MBTI 타입 코드 계산
     */
    private String calculateTypeCode(Map<String, Double> finalScores) {
        StringBuilder typeCode = new StringBuilder();
        typeCode.append(finalScores.get("B/A") >= 0 ? "A" : "B");  // +: Architect, -: Builder
        typeCode.append(finalScores.get("R/I") >= 0 ? "R" : "I");  // +: Refactor, -: Innovate  
        typeCode.append(finalScores.get("S/T") >= 0 ? "T" : "S");  // +: Team, -: Solo
        typeCode.append(finalScores.get("D/F") >= 0 ? "F" : "D");  // +: Feature, -: Debug
        
        String finalTypeCode = typeCode.toString();
        log.debug("최종 결정된 타입: {}", finalTypeCode);
        
        return finalTypeCode;
    }
    
    /**
     * 타입별 설명 생성
     */
    private String generateTypeDescription(String typeCode) {
        Map<String, String> descriptions = new HashMap<>();
        descriptions.put("BRSD", "검증된 방법으로 안정적인 솔루션을 만드는 개발자");
        descriptions.put("BRSF", "실용적 접근으로 빠르게 기능을 구현하는 개발자");
        descriptions.put("BRTD", "안정적 방법으로 팀과 함께 문제를 해결하는 개발자");
        descriptions.put("BRTF", "검증된 방법으로 팀과 함께 실용적인 기능을 개발하는 개발자");
        descriptions.put("BISD", "새로운 접근법으로 독립적으로 문제를 해결하는 개발자");
        descriptions.put("BISF", "혁신적 방법으로 빠르게 기능을 구현하는 개발자");
        descriptions.put("BITD", "새로운 방법으로 팀과 함께 문제를 해결하는 개발자");
        descriptions.put("BITF", "새로운 기술로 팀과 함께 빠르게 기능을 구현하는 개발자");
        descriptions.put("ARSD", "기존 시스템을 체계적으로 개선하는 개발자");
        descriptions.put("ARSF", "체계적 설계로 개인의 강점을 발휘하는 개발자");
        descriptions.put("ARTD", "체계적 접근으로 팀과 함께 완벽한 시스템을 만드는 개발자");
        descriptions.put("ARTF", "검증된 기술로 팀과 함께 견고한 기능을 구축하는 개발자");
        descriptions.put("AISD", "새로운 기술로 안정적이고 혁신적인 설계를 하는 개발자");
        descriptions.put("AISF", "혁신적 설계를 통해 독창적인 기능을 개발하는 개발자");
        descriptions.put("AITD", "새로운 기술로 팀과 함께 안정적인 시스템을 구축하는 개발자");
        descriptions.put("AITF", "새로운 기술로 팀과 함께 혁신적인 기능을 설계하는 개발자");
        
        return descriptions.getOrDefault(typeCode, "개발자 성향 분석 결과");
    }
    
    /**
     * 답변 분석 수행
     */
    private String analyzeAnswers(List<QuestionAnswerDto> answers) {
        try {
            Map<String, Object> analysis = new HashMap<>();
            
            // 극단성 분석
            int extremeHigh = 0; // 6-7점
            int extremeLow = 0;  // 1-2점
            int moderate = 0;    // 3-5점
            
            for (QuestionAnswerDto answer : answers) {
                int value = answer.answerValue();
                if (value >= 6) {
                    extremeHigh++;
                } else if (value <= 2) {
                    extremeLow++;
                } else {
                    moderate++;
                }
            }
            
            analysis.put("extremeHigh", extremeHigh);
            analysis.put("extremeLow", extremeLow);
            analysis.put("moderate", moderate);
            analysis.put("consistency", (double) moderate / answers.size() * 100);
            
            return objectMapper.writeValueAsString(analysis);
            
        } catch (Exception e) {
            log.error("답변 분석 중 오류 발생", e);
            return "{}";
        }
    }
    
    /**
     * 주요 인사이트 생성
     */
    private String generateKeyInsights(List<QuestionAnswerDto> answers) {
        try {
            List<String> insights = new ArrayList<>();
            
            // 답변 패턴 분석
            int strongPreferences = 0;
            int neutralAnswers = 0;
            
            for (QuestionAnswerDto answer : answers) {
                int value = answer.answerValue();
                if (value == 1 || value == 7) {
                    strongPreferences++;
                } else if (value == 4) {
                    neutralAnswers++;
                }
            }
            
            if (strongPreferences > answers.size() * 0.4) {
                insights.add("명확한 선호도를 가지고 있으며, 자신의 개발 스타일에 대한 확신이 강합니다.");
            }
            
            if (neutralAnswers > answers.size() * 0.3) {
                insights.add("상황에 따라 유연하게 접근하는 성향을 보이며, 균형잡힌 개발자의 특성을 가지고 있습니다.");
            }
            
            // 총 답변 수를 기반으로 한 분석 완료 메시지
            insights.add(String.format("%d개의 설문 문항에 대한 응답을 종합적으로 분석하여 개발 성향을 도출했습니다.", answers.size()));
            
            return objectMapper.writeValueAsString(insights);
            
        } catch (Exception e) {
            log.error("인사이트 생성 중 오류 발생", e);
            return "[]";
        }
    }
    
}

