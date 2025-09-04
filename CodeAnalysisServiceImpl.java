package com.demo.proworks.domain.codeanalysis.service.impl;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import com.demo.proworks.domain.codeanalysis.dao.CodeAnalysisDAO;
import com.demo.proworks.domain.codeanalysis.service.CodeAnalysisService;
import com.demo.proworks.domain.codeanalysis.vo.CodeAnalysisRequestVo;
import com.demo.proworks.domain.codeanalysis.vo.CodeAnalysisResultVo;

import com.inswave.elfw.exception.ElException;
import com.inswave.elfw.log.AppLog;

import org.json.JSONObject;
import org.json.JSONArray;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * @subject : 코드 분석 서비스 구현체
 * @description : Gemini API를 통한 코드 분석 서비스 구현 (REST API 직접 호출 방식)
 * @author : Inswave
 * @since : 2025/07/04
 */
@Service("codeAnalysisServiceImpl")
public class CodeAnalysisServiceImpl implements CodeAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    @Value("${gemini.model.name}")
    private String modelName;
    
    // 새로 추가된 프로퍼티 값들을 주입
    @Value("${gemini.request.temperature}")
    private double temperature;
    
    @Value("${gemini.request.top-k}")
    private int topK;
    
    @Value("${gemini.request.top-p}")
    private double topP;
    
    @Value("${gemini.request.max-output-tokens}")
    private int maxOutputTokens;
    
    @Value("${gemini.request.response-mime-type}")
    private String responseMimeType;
    
    @Value("${gemini.retry.max-attempts}")
    private int maxRetryAttempts;
    
    @Value("${gemini.retry.initial-interval}")
    private int retryInitialInterval;
    
    @Value("${gemini.log.request}")
    private boolean logRequest;
    
    @Value("${gemini.log.response}")
    private boolean logResponse;
    
    @Resource(name = "codeAnalysisDAO")
    private CodeAnalysisDAO codeAnalysisDAO;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

    @Override
    public CodeAnalysisResultVo analyzeCode(CodeAnalysisRequestVo requestVo) throws Exception {
        try {
            AppLog.debug("=== 코드 분석 시작 (REST API 방식) ===");
            AppLog.debug("타입ID: " + requestVo.getTypeId());
            AppLog.debug("Gemini API 키 존재 여부: " + (geminiApiKey != null && !geminiApiKey.isEmpty()));
            AppLog.debug("모델명: " + modelName);
            
            // API 키 유효성 검사
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || "YOUR_API_KEY".equals(geminiApiKey)) {
                throw new ElException("ERROR.BIZ.001", new String[]{"Gemini API 키가 설정되지 않았습니다. gemini.properties 파일을 확인하세요."});
            }
            
            // 분석할 코드 준비
            StringBuilder codeContent = new StringBuilder();
            codeContent.append("다음 코드들을 분석해주세요:\n\n");
            
            if (requestVo.getModelFile() != null && !requestVo.getModelFile().isEmpty()) {
                codeContent.append("=== Data Code (").append(requestVo.getModelFileName()).append(") ===\n");
                codeContent.append(requestVo.getModelFile()).append("\n\n");
                AppLog.debug("Data Code 파일 추가됨: " + requestVo.getModelFileName());
            }
            
            if (requestVo.getControllerFile() != null && !requestVo.getControllerFile().isEmpty()) {
                codeContent.append("=== Frontend Code (").append(requestVo.getControllerFileName()).append(") ===\n");
                codeContent.append(requestVo.getControllerFile()).append("\n\n");
                AppLog.debug("Frontend Code 파일 추가됨: " + requestVo.getControllerFileName());
            }
            
            if (requestVo.getServiceFile() != null && !requestVo.getServiceFile().isEmpty()) {
                codeContent.append("=== Backend Code (").append(requestVo.getServiceFileName()).append(") ===\n");
                codeContent.append(requestVo.getServiceFile()).append("\n\n");
                AppLog.debug("Backend Code 파일 추가됨: " + requestVo.getServiceFileName());
            }
            
            if (requestVo.getRepositoryFile() != null && !requestVo.getRepositoryFile().isEmpty()) {
                codeContent.append("=== Utility Code (").append(requestVo.getRepositoryFileName()).append(") ===\n");
                codeContent.append(requestVo.getRepositoryFile()).append("\n\n");
                AppLog.debug("Utility Code 파일 추가됨: " + requestVo.getRepositoryFileName());
            }
            
            if (codeContent.toString().equals("다음 코드들을 분석해주세요:\n\n")) {
                throw new ElException("ERROR.BIZ.002", new String[]{"분석할 코드가 없습니다. 하나 이상의 파일을 업로드하세요."});
            }
            
            String detectedLanguage = detectLanguage(codeContent.toString());
            AppLog.debug("Detected language: " + detectedLanguage);

            // 분석 프롬프트 생성
            String analysisPrompt = buildAnalysisPrompt(detectedLanguage) + "\n\n" + codeContent.toString();
            AppLog.debug("프롬프트 길이: " + analysisPrompt.length() + " 문자");
            
            // REST API 호출
            AppLog.debug("Gemini REST API 호출 시작...");
            String apiResponse = callGeminiAPI(analysisPrompt);
            AppLog.debug("Gemini REST API 호출 완료");
            
            // 응답 파싱
            AppLog.debug("응답 파싱 시작...");
            JSONObject parsedResult = parseGeminiResponse(apiResponse);
            AppLog.debug("응답 파싱 완료");
            
            // 결과 VO 생성
            CodeAnalysisResultVo resultVo = new CodeAnalysisResultVo();
            
            // 실제 사용자 ID 설정 (requestVo에서 가져오거나 기본값 사용)
            Long actualUserId = requestVo.getTypeId();
            if (actualUserId == null) {
                // 기본 사용자 ID 설정 (테스트용)
                actualUserId = 1L;
            }
            resultVo.setUserId(actualUserId);
            
            // 전체 분석 결과 저장 (새로운 JSON 구조)
            String typeCode = parsedResult.getString("typeCode");
            resultVo.setAnalysisResult(parsedResult.optString("fullAnalysis", parsedResult.toString()));
            resultVo.setTypeCode(typeCode);
            // 2차원 분석 결과를 새로운 통합 점수 필드에 매핑 (+-50 범위)
            resultVo.setDevelopmentStyleScore(parsedResult.getInt("developmentStyleScore"));
            resultVo.setDeveloperPreferenceScore(parsedResult.getInt("developerPreferenceScore"));
            resultVo.setConfidenceScore(parsedResult.getDouble("confidenceScore"));
            resultVo.setCreatedAt(new Date());
            resultVo.setLanguage(parsedResult.getString("language"));
            
            // 코멘트 설정 (분석 결과 요약)
            String comment = parsedResult.optString("comment", "코드 분석이 완료되었습니다.");
            resultVo.setComment(comment);
            
            AppLog.debug("결과 VO 생성 완료 - 타입: " + resultVo.getTypeCode() + ", 사용자ID: " + resultVo.getUserId());
            
            // 결과 저장
            AppLog.debug("데이터베이스 저장 시작...");
            saveAnalysisResult(resultVo);
            AppLog.debug("데이터베이스 저장 완료");
            
            AppLog.debug("=== 코드 분석 완료 ===");
            
            return resultVo;
            
        } catch (ElException e) {
            AppLog.error("코드 분석 중 비즈니스 오류 발생", e);
            throw e;
        } catch (Exception e) {
            AppLog.error("코드 분석 중 예상치 못한 오류 발생: " + e.getClass().getName(), e);
            throw new ElException("ERROR.SYS.002", new String[]{"코드 분석 중 오류가 발생했습니다: " + e.getMessage()});
        }
    }
    
    /**
     * Gemini API 호출 (프롬프트 단순화 및 응답 안정성 개선)
     */
    private String callGeminiAPI(String prompt) throws Exception {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // API URL 생성
            String apiUrl = GEMINI_API_URL.replace("{model}", modelName).replace("{apiKey}", geminiApiKey);
            
            // 요청 본문 생성
            JSONObject requestBody = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject part = new JSONObject();
            part.put("text", prompt);
            parts.put(part);
            content.put("parts", parts);
            contents.put(content);
            requestBody.put("contents", contents);
            
            // Generation 설정 추가 - 프로퍼티에서 주입받은 값 사용
            JSONObject generationConfig = new JSONObject();
            generationConfig.put("temperature", temperature);
            generationConfig.put("topK", topK);
            generationConfig.put("topP", topP);
            generationConfig.put("maxOutputTokens", maxOutputTokens);
            generationConfig.put("responseMimeType", responseMimeType);
            
            // 새로운 응답 스키마 (detailed_analysis 포함)
            JSONObject responseSchema = new JSONObject();
            responseSchema.put("type", "object");
            JSONObject properties = new JSONObject();
            
            properties.put("type_code", new JSONObject().put("type", "string").put("pattern", "^[AB][RI]$"));
            properties.put("development_style_score", new JSONObject().put("type", "integer").put("minimum", -50).put("maximum", 50));
            properties.put("developer_preference_score", new JSONObject().put("type", "integer").put("minimum", -50).put("maximum", 50));
            properties.put("confidence_score", new JSONObject().put("type", "integer").put("minimum", 0).put("maximum", 100));
            properties.put("comment", new JSONObject().put("type", "string"));
            properties.put("language", new JSONObject().put("type", "string"));
            
            // detailed_analysis 구조 정의
            JSONObject detailedAnalysis = new JSONObject();
            detailedAnalysis.put("type", "object");
            JSONObject detailedProperties = new JSONObject();
            
            detailedProperties.put("reasoning", new JSONObject().put("type", "string"));
            
            // code_patterns 배열 구조
            JSONObject codePattern = new JSONObject();
            codePattern.put("type", "object");
            JSONObject patternProperties = new JSONObject();
            patternProperties.put("pattern", new JSONObject().put("type", "string"));
            patternProperties.put("description", new JSONObject().put("type", "string"));
            patternProperties.put("evidence", new JSONObject().put("type", "array").put("items", new JSONObject().put("type", "string")));
            patternProperties.put("impact_score", new JSONObject().put("type", "integer").put("minimum", 1).put("maximum", 10));
            codePattern.put("properties", patternProperties);
            codePattern.put("required", new JSONArray().put("pattern").put("description").put("evidence").put("impact_score"));
            
            detailedProperties.put("code_patterns", new JSONObject().put("type", "array").put("items", codePattern));
            detailedProperties.put("strengths", new JSONObject().put("type", "array").put("items", new JSONObject().put("type", "string")));
            detailedProperties.put("suggestions", new JSONObject().put("type", "array").put("items", new JSONObject().put("type", "string")));
            
            detailedAnalysis.put("properties", detailedProperties);
            detailedAnalysis.put("required", new JSONArray().put("reasoning").put("code_patterns").put("strengths").put("suggestions"));
            
            properties.put("detailed_analysis", detailedAnalysis);
            
            responseSchema.put("properties", properties);
            responseSchema.put("required", new JSONArray().put("type_code").put("development_style_score").put("developer_preference_score").put("confidence_score").put("comment").put("language").put("detailed_analysis"));
            
            generationConfig.put("responseSchema", responseSchema);
            requestBody.put("generationConfig", generationConfig);
            
            // 요청 로깅
            if (logRequest) {
                AppLog.debug("API 요청 URL: " + apiUrl);
                AppLog.debug("API 요청 본문 길이: " + requestBody.toString().length());
                AppLog.debug("API 요청 파라미터: temperature=" + temperature + 
                          ", topK=" + topK + 
                          ", topP=" + topP + 
                          ", maxOutputTokens=" + maxOutputTokens);
            }
            
            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            
            // 재시도 로직 추가
            int attempts = 0;
            Exception lastException = null;
            int currentRetryInterval = retryInitialInterval;
            
            while (attempts < maxRetryAttempts) {
                try {
                    // API 호출
                    ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
                    
                    // 응답 로깅
                    if (logResponse && response.getBody() != null) {
                        AppLog.debug("API 응답 상태: " + response.getStatusCode());
                        AppLog.debug("API 응답 길이: " + (response.getBody() != null ? response.getBody().length() : 0));
                        // 응답이 너무 길 수 있으므로 처음 일부분만 로깅
                        if (response.getBody().length() > 500) {
                            AppLog.debug("API 응답 내용 (처음 500자): " + response.getBody().substring(0, 500) + "...");
                        } else {
                            AppLog.debug("API 응답 내용: " + response.getBody());
                        }
                    }
                    
                    if (response.getStatusCode() == HttpStatus.OK) {
                        return response.getBody();
                    } else {
                        throw new Exception("Gemini API 호출 실패: " + response.getStatusCode());
                    }
                } catch (Exception e) {
                    lastException = e;
                    attempts++;
                    
                    if (attempts < maxRetryAttempts) {
                        AppLog.warn("Gemini API 호출 실패 (" + attempts + "/" + maxRetryAttempts + "), " + 
                                  currentRetryInterval + "ms 후 재시도: " + e.getMessage());
                        try {
                            Thread.sleep(currentRetryInterval);
                            // 백오프 간격 증가 (지수 백오프)
                            currentRetryInterval *= 2;
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new Exception("재시도 대기 중 중단됨", ie);
                        }
                    }
                }
            }
            
            // 모든 재시도 실패
            AppLog.error("Gemini REST API 호출 실패 (" + attempts + "번 시도 후)", lastException);
            throw new Exception("Gemini API 호출 중 오류가 발생했습니다 (" + attempts + "번 시도): " + 
                             (lastException != null ? lastException.getMessage() : "알 수 없는 오류"), lastException);
            
        } catch (Exception e) {
            AppLog.error("Gemini REST API 호출 중 오류 발생", e);
            throw new Exception("Gemini API 호출 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gemini API 응답 파싱 (상세 분석 정보 포함)
     */
    private JSONObject parseGeminiResponse(String response) throws Exception {
        try {
            // 응답 길이 체크
            if (response == null || response.trim().isEmpty()) {
                throw new Exception("Gemini API에서 빈 응답을 받았습니다.");
            }
            
            AppLog.debug("Gemini API 원본 응답 길이: " + response.length());
            AppLog.debug("Gemini API 원본 응답 (처음 500자): " + response.substring(0, Math.min(500, response.length())));
            
            JSONObject jsonResponse = new JSONObject(response);
            
            // 응답 구조 검증
            if (!jsonResponse.has("candidates")) {
                throw new Exception("Gemini API 응답에 candidates 필드가 없습니다.");
            }
            
            JSONArray candidates = jsonResponse.getJSONArray("candidates");
            if (candidates.length() == 0) {
                throw new Exception("Gemini API에서 결과를 반환하지 않았습니다.");
            }
            
            JSONObject candidate = candidates.getJSONObject(0);
            
            // finishReason 확인
            if (candidate.has("finishReason")) {
                String finishReason = candidate.getString("finishReason");
                if (!"STOP".equals(finishReason)) {
                    AppLog.warn("응답이 완전하지 않을 수 있습니다. finishReason: " + finishReason);
                }
            }
            
            if (!candidate.has("content")) {
                throw new Exception("Gemini API 응답에 content 필드가 없습니다.");
            }
            
            JSONObject content = candidate.getJSONObject("content");
            JSONArray parts = content.getJSONArray("parts");
            
            if (parts.length() == 0) {
                throw new Exception("Gemini API 응답에 텍스트가 없습니다.");
            }
            
            String resultText = parts.getJSONObject(0).getString("text");
            AppLog.debug("Gemini API 응답 텍스트 길이: " + resultText.length());
            AppLog.debug("Gemini API 응답 텍스트: " + resultText);
            
            // JSON 형식 검증 및 파싱
            resultText = resultText.trim();
            if (!resultText.startsWith("{") || !resultText.endsWith("}")) {
                // JSON이 아닌 경우 래핑 시도
                AppLog.warn("응답이 JSON 형식이 아닙니다. 텍스트에서 JSON 추출을 시도합니다.");
                int startIdx = resultText.indexOf("{");
                int endIdx = resultText.lastIndexOf("}");
                if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                    resultText = resultText.substring(startIdx, endIdx + 1);
                } else {
                    throw new Exception("응답에서 유효한 JSON을 찾을 수 없습니다.");
                }
            }
            
            JSONObject analysisResult;
            try {
                analysisResult = new JSONObject(resultText);
            } catch (Exception e) {
                AppLog.error("JSON 파싱 실패. 응답 텍스트: " + resultText);
                throw new Exception("API 응답을 JSON으로 파싱할 수 없습니다: " + e.getMessage());
            }
            
            // 필수 필드 검증 (새로운 형식에 맞게)
            String[] requiredFields = {"type_code", "development_style_score", "developer_preference_score", "confidence_score"};
            for (String field : requiredFields) {
                if (!analysisResult.has(field)) {
                    throw new Exception("응답에 필수 필드가 없습니다: " + field);
                }
            }
            
            // 새로운 데이터베이스 구조에 맞게 변환 (이미 +-50 범위)
            JSONObject result = new JSONObject();
            
            // 타입 코드
            result.put("typeCode", analysisResult.getString("type_code"));
            
            // 점수는 이미 -50~+50 범위로 제공됨
            result.put("developmentStyleScore", analysisResult.getInt("development_style_score"));
            result.put("developerPreferenceScore", analysisResult.getInt("developer_preference_score"));
            
            // 신뢰도는 0-100 범위를 0.0-1.0으로 변환
            double confidenceScore = analysisResult.getInt("confidence_score") / 100.0;
            result.put("confidenceScore", Math.min(0.99, confidenceScore)); // 최대 0.99로 제한
            
            // 언어 정보
            String language = analysisResult.optString("language", "java");
            result.put("language", language);
            
            // 요약 정보 생성
            String comment = analysisResult.optString("comment", "코드 분석 완료");
            String summary = String.format("CodeFIT: %s (%s, 신뢰도: %.0f%%) - %s", 
                analysisResult.getString("type_code"), 
                language,
                confidenceScore * 100,
                comment);
            result.put("summary", summary);
            
            // comment를 result 객체에 추가 (DB 저장용)
            result.put("comment", comment);
            
            // 상세 분석 정보 처리
            JSONObject detailedAnalysisResult = new JSONObject();
            
            AppLog.debug("=== 상세 분석 파싱 시작 ===");
            AppLog.debug("analysisResult 구조 확인:");
            AppLog.debug("- has detailed_analysis: " + analysisResult.has("detailed_analysis"));
            if (analysisResult.has("detailed_analysis")) {
                AppLog.debug("- detailed_analysis 내용: " + analysisResult.getJSONObject("detailed_analysis").toString());
            }
            
            // 전체 analysisResult 로깅 (문제 진단용)
            AppLog.debug("전체 analysisResult: " + analysisResult.toString());
            
            if (analysisResult.has("detailed_analysis")) {
                JSONObject detailedAnalysis = analysisResult.getJSONObject("detailed_analysis");
                AppLog.debug("detailed_analysis 객체 획득 성공");
                
                // 분석 근거
                if (detailedAnalysis.has("reasoning")) {
                    String reasoning = detailedAnalysis.getString("reasoning");
                    detailedAnalysisResult.put("reasoning", reasoning);
                    AppLog.debug("reasoning 설정 완료: " + reasoning.substring(0, Math.min(50, reasoning.length())) + "...");
                } else {
                    AppLog.warn("reasoning 필드가 없음");
                }
                
                // 코드 패턴 분석
                if (detailedAnalysis.has("code_patterns")) {
                    JSONArray patterns = detailedAnalysis.getJSONArray("code_patterns");
                    detailedAnalysisResult.put("code_patterns", patterns);
                    AppLog.debug("code_patterns 설정 완료 - 개수: " + patterns.length());
                } else {
                    AppLog.warn("code_patterns 필드가 없음");
                }
                
                // 강점
                if (detailedAnalysis.has("strengths")) {
                    JSONArray strengths = detailedAnalysis.getJSONArray("strengths");
                    detailedAnalysisResult.put("strengths", strengths);
                    AppLog.debug("strengths 설정 완료 - 개수: " + strengths.length());
                } else {
                    AppLog.warn("strengths 필드가 없음");
                }
                
                // 개선 제안
                if (detailedAnalysis.has("suggestions")) {
                    JSONArray suggestions = detailedAnalysis.getJSONArray("suggestions");
                    detailedAnalysisResult.put("suggestions", suggestions);
                    AppLog.debug("suggestions 설정 완료 - 개수: " + suggestions.length());
                } else {
                    AppLog.warn("suggestions 필드가 없음");
                }
                
                AppLog.debug("상세 분석 정보 파싱 완료 - 총 필드 수: " + detailedAnalysisResult.length());
                
            } else {
                // detailed_analysis가 없는 경우 기본값 설정
                AppLog.error("❌ detailed_analysis 필드가 전체 응답에 없습니다!");
                AppLog.error("사용 가능한 필드들: " + String.join(", ", analysisResult.keySet().toArray(new String[0])));
                
                detailedAnalysisResult.put("reasoning", "코드 구조와 패턴을 분석하여 개발 스타일을 도출했습니다.");
                detailedAnalysisResult.put("code_patterns", new JSONArray());
                detailedAnalysisResult.put("strengths", new JSONArray());
                detailedAnalysisResult.put("suggestions", new JSONArray());
                AppLog.debug("detailed_analysis 필드가 없어 기본값으로 설정");
            }
            
            // 전체 응답을 JSON 형태로 저장 (상세 분석 포함)
            JSONObject fullAnalysisJson = new JSONObject();
            fullAnalysisJson.put("basic_analysis", analysisResult);
            fullAnalysisJson.put("detailed_analysis", detailedAnalysisResult);
            fullAnalysisJson.put("language", language);
            fullAnalysisJson.put("comment", comment);
            
            result.put("fullAnalysis", fullAnalysisJson.toString());
            
            AppLog.debug("파싱 완료 - 타입: " + result.getString("typeCode") + 
                        ", 신뢰도: " + result.getDouble("confidenceScore") + 
                        ", 상세분석: " + (detailedAnalysisResult.length() > 0 ? "포함" : "없음"));
            
            return result;
            
        } catch (Exception e) {
            AppLog.error("Gemini API 응답 파싱 중 오류", e);
            throw new Exception("Gemini API 응답 파싱에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void saveAnalysisResult(CodeAnalysisResultVo resultVo) throws Exception {
        try {
            // 1. 코드 분석 결과 저장
            int result = codeAnalysisDAO.insertCodeAnalysisResult(resultVo);
            if (result <= 0) {
                throw new Exception("코드 분석 결과 저장에 실패했습니다.");
            }
            AppLog.debug("코드 분석 결과 저장 완료 - ID: " + resultVo.getAnalysisId());
            
            // 2. users_mbti_types 테이블에 is_code_checked = 1로 업데이트
            try {
                int mbtiResult = codeAnalysisDAO.upsertMbtiTypeForCode(resultVo.getUserId());
                if (mbtiResult > 0) {
                    AppLog.debug("users_mbti_types 테이블 업데이트 완료 - 사용자ID: " + resultVo.getUserId() + ", is_code_checked = 1");
                } else {
                    AppLog.warn("users_mbti_types 테이블 업데이트 실패 - 사용자ID: " + resultVo.getUserId());
                }
            } catch (Exception mbtiEx) {
                AppLog.error("users_mbti_types 업데이트 중 오류 (분석 결과는 저장됨): " + mbtiEx.getMessage(), mbtiEx);
                // 분석 결과는 이미 저장되었으므로 예외를 던지지 않고 로그만 남김
            }
            
        } catch (ElException e) {
            AppLog.error("코드 분석 결과 저장 중 DAO 오류 발생", e);
            throw new Exception("코드 분석 결과 저장 중 데이터베이스 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    @Override
    public CodeAnalysisResultVo getAnalysisResult(Long typeId) throws Exception {
        try {
            CodeAnalysisResultVo result = codeAnalysisDAO.selectLatestCodeAnalysisResult(typeId);
            if (result != null) {
                AppLog.debug("코드 분석 결과 조회 완료 - 타입ID: " + typeId);
            } else {
                AppLog.debug("코드 분석 결과가 없습니다 - 타입ID: " + typeId);
            }
            return result;
        } catch (ElException e) {
            AppLog.error("코드 분석 결과 조회 중 DAO 오류 발생", e);
            throw new Exception("코드 분석 결과 조회 중 데이터베이스 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 새로운 분석 프롬프트 생성 (상세 분석 포함)
     */
    private String buildAnalysisPrompt(String language) {
        StringBuilder prompt = new StringBuilder();
        
        // 새로운 프롬프트 JSON 구조를 문자열로 포함
        prompt.append("{\n");
        prompt.append("  \"task\": \"developer_trait_analysis\",\n");
        prompt.append("  \"description\": \"Analyze developer traits based on their code to determine their development style and preferences\",\n");
        prompt.append("  \"note\": \"Please make sure to respond to this request strictly in the following JSON format. Do not say anything outside of the specified format.\",\n");
        prompt.append("  \"trait_definitions\": {\n");
        prompt.append("    \"development_style\": {\n");
        prompt.append("      \"B\": {\n");
        prompt.append("        \"name\": \"Builder\",\n");
        prompt.append("        \"description\": \"Prefers quick implementation and practicality\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Simple, straightforward solutions\",\n");
        prompt.append("          \"Minimal abstractions\",\n");
        prompt.append("          \"Focus on working code over perfect architecture\",\n");
        prompt.append("          \"Pragmatic approach to problem-solving\",\n");
        prompt.append("          \"Direct implementation without over-engineering\"\n");
        prompt.append("        ]\n");
        prompt.append("      },\n");
        prompt.append("      \"A\": {\n");
        prompt.append("        \"name\": \"Architect\",\n");
        prompt.append("        \"description\": \"Pursues systematic and perfect design\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Well-structured code with clear separation of concerns\",\n");
        prompt.append("          \"Use of design patterns\",\n");
        prompt.append("          \"Comprehensive error handling\",\n");
        prompt.append("          \"Detailed documentation\",\n");
        prompt.append("          \"Scalable and maintainable architecture\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    },\n");
        prompt.append("    \"developer_preference\": {\n");
        prompt.append("      \"R\": {\n");
        prompt.append("        \"name\": \"Refactor\",\n");
        prompt.append("        \"description\": \"Prefers improving and optimizing existing code\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Code refactoring patterns\",\n");
        prompt.append("          \"Performance optimizations\",\n");
        prompt.append("          \"Code cleanup and simplification\",\n");
        prompt.append("          \"Improving readability\",\n");
        prompt.append("          \"Fixing technical debt\"\n");
        prompt.append("        ]\n");
        prompt.append("      },\n");
        prompt.append("      \"I\": {\n");
        prompt.append("        \"name\": \"Innovator\",\n");
        prompt.append("        \"description\": \"Enjoys daring to explore new technologies\",\n");
        prompt.append("        \"indicators\": [\n");
        prompt.append("          \"Use of cutting-edge technologies\",\n");
        prompt.append("          \"Experimental approaches\",\n");
        prompt.append("          \"Integration of new libraries/frameworks\",\n");
        prompt.append("          \"Creative problem-solving\",\n");
        prompt.append("          \"Early adoption of new features\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    }\n");
        prompt.append("  },\n");
        prompt.append("  \"analysis_instructions\": {\n");
        prompt.append("    \"steps\": [\n");
        prompt.append("      \"Examine code structure and organization\",\n");
        prompt.append("      \"Identify design patterns and architectural choices\",\n");
        prompt.append("      \"Analyze technology choices and dependencies\",\n");
        prompt.append("      \"Evaluate code style and documentation\",\n");
        prompt.append("      \"Assess problem-solving approaches\"\n");
        prompt.append("    ],\n");
        prompt.append("    \"scoring_guidelines\": {\n");
        prompt.append("      \"development_style_score\": {\n");
        prompt.append("        \"range\": [-50, 50],\n");
        prompt.append("        \"interpretation\": {\n");
        prompt.append("          \"-50 to -21\": \"Strong Builder (B) tendency\",\n");
        prompt.append("          \"-20 to -1\": \"Moderate Builder (B) tendency\",\n");
        prompt.append("          \"0\": \"Balanced between Builder and Architect\",\n");
        prompt.append("          \"1 to 20\": \"Moderate Architect (A) tendency\",\n");
        prompt.append("          \"21 to 50\": \"Strong Architect (A) tendency\"\n");
        prompt.append("        }\n");
        prompt.append("      },\n");
        prompt.append("      \"developer_preference_score\": {\n");
        prompt.append("        \"range\": [-50, 50],\n");
        prompt.append("        \"interpretation\": {\n");
        prompt.append("          \"-50 to -21\": \"Strong Innovator (I) tendency\",\n");
        prompt.append("          \"-20 to -1\": \"Moderate Innovator (I) tendency\",\n");
        prompt.append("          \"0\": \"Balanced between Refiner and Innovator\",\n");
        prompt.append("          \"1 to 20\": \"Moderate Refiner (R) tendency\",\n");
        prompt.append("          \"21 to 50\": \"Strong Refiner (R) tendency\"\n");
        prompt.append("        }\n");
        prompt.append("      },\n");
        prompt.append("      \"confidence_score\": {\n");
        prompt.append("        \"range\": [0, 100],\n");
        prompt.append("        \"factors\": [\n");
        prompt.append("          \"Amount of code analyzed\",\n");
        prompt.append("          \"Variety of code patterns observed\",\n");
        prompt.append("          \"Consistency of traits across different code sections\",\n");
        prompt.append("          \"Clarity of trait indicators\"\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    }\n");
        prompt.append("  },\n");
        prompt.append("  \"output_format\": {\n");
        prompt.append("    \"analysis_result\": {\n");
        prompt.append("      \"type_code\": \"string (BR, BI, AR, AI)\",\n");
        prompt.append("      \"development_style_score\": \"integer (-50 to 50)\",\n");
        prompt.append("      \"developer_preference_score\": \"integer (-50 to 50)\",\n");
        prompt.append("      \"confidence_score\": \"integer (0 to 100)\",\n");
        prompt.append("      \"comment\": \"string (Korean language preferred)\",\n");
        prompt.append("      \"language\": \"string (java, python, javascript, etc.)\",\n");
        prompt.append("      \"detailed_analysis\": {\n");
        prompt.append("        \"reasoning\": \"string (Korean) - 분석 결과의 근거와 이유를 상세히 설명\",\n");
        prompt.append("        \"code_patterns\": [\n");
        prompt.append("          {\n");
        prompt.append("            \"pattern\": \"string - 패턴명\",\n");
        prompt.append("            \"description\": \"string (Korean) - 패턴 설명\",\n");
        prompt.append("            \"evidence\": [\"array of strings (Korean) - 구체적인 증거들\"],\n");
        prompt.append("            \"impact_score\": \"integer (1-10) - 분석 결과에 미친 영향도\"\n");
        prompt.append("          }\n");
        prompt.append("        ],\n");
        prompt.append("        \"strengths\": [\"array of strings (Korean) - 개발자의 강점들\"],\n");
        prompt.append("        \"suggestions\": [\"array of strings (Korean) - 개선 제안사항들\"]\n");
        prompt.append("      }\n");
        prompt.append("    }\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");
        
        prompt.append("Based on the above analysis framework, analyze the provided " + language + " code and return ONLY a JSON response in this exact format:\n\n");
        
        prompt.append("**EXAMPLE OUTPUT (DO NOT COPY - ANALYZE THE ACTUAL CODE PROVIDED BELOW):**\n");
        prompt.append("{\n");
        prompt.append("  \"type_code\": \"BR\",\n");
        prompt.append("  \"development_style_score\": -25,\n");
        prompt.append("  \"developer_preference_score\": 15,\n");
        prompt.append("  \"confidence_score\": 75,\n");
        prompt.append("  \"comment\": \"의존성 주입과 빌더 패턴을 활용하여 실용적인 구현을 선호하며, 코드 안정성과 유지보수성을 중시하는 개발자입니다.\",\n");
        prompt.append("  \"language\": \"java\",\n");
        prompt.append("  \"detailed_analysis\": {\n");
        prompt.append("    \"reasoning\": \"코드에서 생성자 기반 의존성 주입, 유효성 검사 메서드 분리, 빌더 패턴 활용 등 안정적이고 체계적인 구현 패턴을 확인했습니다. 특히 validateUserRequest 메서드를 통해 입력값 검증을 별도로 분리하여 책임을 명확히 하고, 예외 처리를 구체적으로 구현한 점에서 코드 품질을 중시하는 개발자임을 알 수 있습니다.\",\n");
        prompt.append("    \"code_patterns\": [\n");
        prompt.append("      {\n");
        prompt.append("        \"pattern\": \"Constructor Dependency Injection\",\n");
        prompt.append("        \"description\": \"생성자를 통한 의존성 주입 패턴\",\n");
        prompt.append("        \"evidence\": [\"final 키워드를 사용한 불변 필드\", \"생성자에서 의존성 주입\", \"순환 참조 방지\"],\n");
        prompt.append("        \"impact_score\": 9\n");
        prompt.append("      },\n");
        prompt.append("      {\n");
        prompt.append("        \"pattern\": \"Input Validation Separation\",\n");
        prompt.append("        \"description\": \"입력값 검증 로직의 메서드 분리\",\n");
        prompt.append("        \"evidence\": [\"validateUserRequest 메서드 분리\", \"구체적인 예외 메시지\", \"단계적 검증 로직\"],\n");
        prompt.append("        \"impact_score\": 8\n");
        prompt.append("      },\n");
        prompt.append("      {\n");
        prompt.append("        \"pattern\": \"Builder Pattern Usage\",\n");
        prompt.append("        \"description\": \"객체 생성을 위한 빌더 패턴 활용\",\n");
        prompt.append("        \"evidence\": [\"User.builder() 사용\", \"메서드 체이닝\", \"가독성 있는 객체 생성\"],\n");
        prompt.append("        \"impact_score\": 7\n");
        prompt.append("      }\n");
        prompt.append("    ],\n");
        prompt.append("    \"strengths\": [\"의존성 관리가 체계적임\", \"예외 처리가 구체적이고 명확함\", \"메서드 분리를 통한 책임 분산\", \"코드 가독성이 뛰어남\", \"불변성을 고려한 설계\"],\n");
        prompt.append("    \"suggestions\": [\"이메일 유효성 검사를 정규식으로 개선 고려\", \"로깅 추가로 디버깅 편의성 향상\", \"단위 테스트 커버리지 확대\"]\n");
        prompt.append("  }\n");
        prompt.append("}\n\n");
        
        // 더 강화된 지시문
        prompt.append("**🚨 CRITICAL ANALYSIS REQUIREMENTS - MUST FOLLOW:**\n");
        prompt.append("1. **ANALYZE THE ACTUAL CODE** - Do not use generic placeholder text\n");
        prompt.append("2. **detailed_analysis.reasoning** - MUST explain specific code elements you observed\n");
        prompt.append("3. **detailed_analysis.code_patterns** - MUST identify at least 2-3 REAL patterns with concrete evidence\n");
        prompt.append("4. **detailed_analysis.strengths** - MUST list at least 3-5 specific strengths from the code\n");
        prompt.append("5. **detailed_analysis.suggestions** - MUST provide at least 2-3 actionable improvement suggestions\n");
        prompt.append("6. **All Korean text** - reasoning, pattern descriptions, strengths, suggestions must be in Korean\n");
        prompt.append("7. **Evidence arrays** - Each code pattern must have specific code evidence, not generic statements\n\n");
        prompt.append("**CODE TO ANALYZE (PROVIDE DETAILED ANALYSIS OF THIS SPECIFIC CODE):**\n\n");
        
        return prompt.toString();
    }

    private String detectLanguage(String code) {
        // Java 감지
        if (code.contains("import java.") || code.contains("public class") || code.contains("package ")) {
            return "Java";
        }
        // JavaScript/TypeScript 감지
        if (code.contains("function ") || code.contains("console.log") || code.contains("const ") || 
            code.contains("let ") || code.contains("var ") || code.contains("export ") || code.contains("import ")) {
            if (code.contains("interface ") || code.contains(": string") || code.contains(": number")) {
                return "TypeScript";
            }
            return "JavaScript";
        }
        // Python 감지
        if (code.contains("def ") || code.contains("import ") || code.contains("print(") || 
            code.contains("class ") || code.contains("if __name__")) {
            return "Python";
        }
        // C++ 감지
        if (code.contains("#include") || code.contains("using namespace") || code.contains("std::")) {
            return "C++";
        }
        // C# 감지
        if (code.contains("using System") || code.contains("namespace ") || code.contains("public class")) {
            return "C#";
        }
        // Go 감지
        if (code.contains("package main") || code.contains("func ") || code.contains("import (")) {
            return "Go";
        }
        // Rust 감지
        if (code.contains("fn ") || code.contains("use ") || code.contains("struct ") || code.contains("impl ")) {
            return "Rust";
        }
        // PHP 감지
        if (code.contains("<?php") || code.contains("function ") || code.contains("$")) {
            return "PHP";
        }
        // Ruby 감지
        if (code.contains("def ") || code.contains("class ") || code.contains("require ") || code.contains("puts ")) {
            return "Ruby";
        }
        // Swift 감지
        if (code.contains("import Foundation") || code.contains("func ") || code.contains("var ") || code.contains("let ")) {
            return "Swift";
        }
        // Kotlin 감지
        if (code.contains("fun ") || code.contains("class ") || code.contains("package ") || code.contains("import ")) {
            return "Kotlin";
        }
        // HTML/CSS 감지
        if (code.contains("<html") || code.contains("<div") || code.contains("<!DOCTYPE")) {
            return "HTML";
        }
        if (code.contains("body {") || code.contains(".class") || code.contains("#id")) {
            return "CSS";
        }
        // SQL 감지
        if (code.contains("SELECT ") || code.contains("CREATE TABLE") || code.contains("INSERT INTO")) {
            return "SQL";
        }
        // JSON/XML 감지
        if (code.trim().startsWith("{") && code.trim().endsWith("}")) {
            return "JSON";
        }
        if (code.contains("<?xml") || code.contains("<root")) {
            return "XML";
        }
        
        return "Unknown";
    }
} 