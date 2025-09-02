package com.example.demo.domain.codeanalysis.service;

import com.example.demo.domain.codeanalysis.dto.CodeAnalysisCreateDto;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.domain.codeanalysis.repository.CodeAnalysisRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.demo.common.security.service.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CodeAnalysisService {

    private final CodeAnalysisRepository codeAnalysisRepository;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    @Transactional
    public CodeAnalysisResponseDto analyzeCode(Long userId, List<MultipartFile> files) {
        try {
            log.info("코드 분석 시작 - userId: {}, 파일 수: {}", userId, files.size());

            // 파일 내용 분석 (실제로는 AI 서비스 호출)
            String analysisResult = performCodeAnalysis(files);
            
            // 분석 결과 생성 (임시 로직 - 실제로는 AI 분석 결과 사용)
            AnalysisResult result = generateAnalysisResult();
            
            // DB에 분석 결과 저장
            CodeAnalysisCreateDto createDto = new CodeAnalysisCreateDto(
                userId,
                analysisResult,
                result.typeCode(),
                result.developmentStyleScore(),
                result.developerPreferenceScore(),
                result.confidenceScore(),
                "AI 기반 코드 분석 완료"
            );

            CodeAnalysis savedAnalysis = saveAnalysis(createDto);
            
            log.info("코드 분석 완료 - analysisId: {}", savedAnalysis.getAnalysisId());

            return new CodeAnalysisResponseDto(
                savedAnalysis.getAnalysisId(),
                savedAnalysis.getUserId(),
                savedAnalysis.getTypeCode(),
                getTypeName(savedAnalysis.getTypeCode()),
                getTypeDescription(savedAnalysis.getTypeCode()),
                savedAnalysis.getDevelopmentStyleScore(),
                savedAnalysis.getDeveloperPreferenceScore(),
                savedAnalysis.getConfidenceScore(),
                detectLanguage(files),
                savedAnalysis.getAnalysisResult(),
                savedAnalysis.getComment(),
                savedAnalysis.getCreatedAt(),
                true,
                "코드 분석이 성공적으로 완료되었습니다."
            );

        } catch (Exception e) {
            log.error("코드 분석 실패 - userId: {}", userId, e);
            return new CodeAnalysisResponseDto(
                null, userId, null, null, null, null, null, null, null, null, null, 
                LocalDateTime.now(), false, "코드 분석 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }

    private String performCodeAnalysis(List<MultipartFile> files) throws IOException, JsonProcessingException {
        Map<String, Object> analysis = new HashMap<>();
        
        for (MultipartFile file : files) {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            String fileName = file.getOriginalFilename();
            
            Map<String, Object> fileAnalysis = new HashMap<>();
            fileAnalysis.put("fileName", fileName);
            fileAnalysis.put("lineCount", content.split("\n").length);
            fileAnalysis.put("characterCount", content.length());
            fileAnalysis.put("language", detectLanguageFromFile(fileName));
            
            analysis.put(fileName, fileAnalysis);
        }
        
        return objectMapper.writeValueAsString(analysis);
    }

    private AnalysisResult generateAnalysisResult() {
        String[] typeCodes = {"AI", "AR", "BI", "BR"};
        String typeCode = typeCodes[random.nextInt(typeCodes.length)];
        
        int developmentStyleScore = random.nextInt(101) - 50; // -50 to 50
        int developerPreferenceScore = random.nextInt(101) - 50; // -50 to 50
        BigDecimal confidenceScore = BigDecimal.valueOf(0.6 + (random.nextDouble() * 0.4)); // 0.6 to 1.0
        
        return new AnalysisResult(typeCode, developmentStyleScore, developerPreferenceScore, confidenceScore);
    }

    private CodeAnalysis saveAnalysis(CodeAnalysisCreateDto createDto) {
        CodeAnalysis codeAnalysis = CodeAnalysis.builder()
            .userId(createDto.userId())
            .analysisResult(createDto.analysisResult())
            .typeCode(createDto.typeCode())
            .developmentStyleScore(createDto.developmentStyleScore())
            .developerPreferenceScore(createDto.developerPreferenceScore())
            .confidenceScore(createDto.confidenceScore())
            .comment(createDto.comment())
            .build();

        return codeAnalysisRepository.save(codeAnalysis);
    }

    private String detectLanguage(List<MultipartFile> files) {
        if (files.isEmpty()) return "Unknown";
        
        String fileName = files.get(0).getOriginalFilename();
        return detectLanguageFromFile(fileName);
    }

    private String detectLanguageFromFile(String fileName) {
        if (fileName == null) return "Unknown";
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "java" -> "Java";
            case "js", "jsx" -> "JavaScript";
            case "ts", "tsx" -> "TypeScript";
            case "py" -> "Python";
            case "cpp", "cc", "cxx" -> "C++";
            case "c" -> "C";
            case "cs" -> "C#";
            case "go" -> "Go";
            case "php" -> "PHP";
            case "rb" -> "Ruby";
            case "swift" -> "Swift";
            case "kt" -> "Kotlin";
            default -> "Unknown";
        };
    }

    private String getTypeName(String typeCode) {
        return switch (typeCode) {
            case "AI" -> "혁신적 아키텍트";
            case "AR" -> "개선형 아키텍트";
            case "BI" -> "혁신적 빌더";
            case "BR" -> "실용적 빌더";
            default -> "Unknown Type";
        };
    }

    private String getTypeDescription(String typeCode) {
        return switch (typeCode) {
            case "AI" -> "새로운 기술을 활용하여 체계적인 시스템을 구축하는 개발자";
            case "AR" -> "기존 코드를 체계적으로 개선하고 최적화하는 개발자";
            case "BI" -> "새로운 기술로 빠르고 실용적인 솔루션을 만드는 개발자";
            case "BR" -> "기존 방식을 개선하여 효율적인 솔루션을 구축하는 개발자";
            default -> "알 수 없는 개발자 유형";
        };
    }

    // 내부 레코드
    private record AnalysisResult(
        String typeCode,
        Integer developmentStyleScore,
        Integer developerPreferenceScore,
        BigDecimal confidenceScore
    ) {}

    // 사용자별 분석 히스토리 조회
    @Transactional(readOnly = true)
    public List<CodeAnalysis> getUserAnalysisHistory(Long userId) {
        return codeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 사용자의 최신 분석 결과 조회
    @Transactional(readOnly = true)
    public CodeAnalysis getLatestAnalysis(Long userId) {
        return codeAnalysisRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
    }

    // 컨트롤러를 위한 ResponseEntity 반환 메서드들
    public ResponseEntity<CodeAnalysisResponseDto> analyzeCodeWithResponse(CustomUserDetails userDetails, List<MultipartFile> files) {
        // CustomUserDetails에서 userId 추출
        Long userId = userDetails.baseUser().getBaseUserId();

        log.info("코드 분석 요청 - userId: {}, 파일 수: {}", userId, files.size());

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new CodeAnalysisResponseDto(
                    null, userId, null, null, null, null, null, null, null, null, null, null,
                    false, "업로드된 파일이 없습니다."
                ));
        }

        // 파일 크기 및 타입 검증
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new CodeAnalysisResponseDto(
                        null, userId, null, null, null, null, null, null, null, null, null, null,
                        false, "빈 파일은 업로드할 수 없습니다: " + file.getOriginalFilename()
                    ));
            }

            // 파일 크기 제한 (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new CodeAnalysisResponseDto(
                        null, userId, null, null, null, null, null, null, null, null, null, null,
                        false, "파일 크기가 10MB를 초과합니다: " + file.getOriginalFilename()
                    ));
            }
        }

        CodeAnalysisResponseDto response = analyzeCode(userId, files);
        
        if (response.success()) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body(response);
    }

    public ResponseEntity<List<CodeAnalysis>> getAnalysisHistoryWithResponse(CustomUserDetails userDetails) {
        Long userId = userDetails.baseUser().getBaseUserId();
        List<CodeAnalysis> history = getUserAnalysisHistory(userId);
        return ResponseEntity.ok(history);
    }

    public ResponseEntity<CodeAnalysis> getLatestAnalysisWithResponse(CustomUserDetails userDetails) {
        Long userId = userDetails.baseUser().getBaseUserId();
        CodeAnalysis latestAnalysis = getLatestAnalysis(userId);
        if (latestAnalysis != null) {
            return ResponseEntity.ok(latestAnalysis);
        }

        return ResponseEntity.notFound().build();
    }
}
