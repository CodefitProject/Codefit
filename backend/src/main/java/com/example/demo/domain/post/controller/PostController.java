package com.example.demo.domain.post.controller;

import com.example.demo.common.security.service.CustomUserDetails;
import com.example.demo.domain.post.dto.*;
import com.example.demo.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * 채용 공고 관련 REST API 컨트롤러
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {
    
    private final PostService postService;
    
    /**
     * 날짜 문자열을 LocalDateTime으로 변환
     * ISO 8601 형식과 datetime-local 형식 모두 지원
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // ISO 8601 형식 (Z 포함) 처리: 2025-10-01T22:54:33.167Z
            if (dateTimeStr.endsWith("Z")) {
                return ZonedDateTime.parse(dateTimeStr).toLocalDateTime();
            }
            // ISO 8601 형식 (타임존 포함) 처리: 2025-10-01T22:54:33.167+09:00
            else if (dateTimeStr.contains("+") || dateTimeStr.lastIndexOf("-") > 10) {
                return ZonedDateTime.parse(dateTimeStr).toLocalDateTime();
            }
            // datetime-local 형식 처리: 2025-10-01T22:54
            else {
                return LocalDateTime.parse(dateTimeStr);
            }
        } catch (Exception e) {
            log.error("날짜 파싱 실패: {}", dateTimeStr, e);
            throw new IllegalArgumentException("잘못된 날짜 형식입니다: " + dateTimeStr);
        }
    }
    
    /**
     * 공고 목록 조회 (페이징)
     * 
     * @param pageable 페이징 정보
     * @return 공고 목록
     */
    @GetMapping
    public ResponseEntity<JobPostingListResponseDto> getJobPostings(
            @PageableDefault(size = 16) Pageable pageable) {
        
        log.debug("공고 목록 조회 요청 - 페이지: {}, 크기: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        JobPostingListResponseDto response = postService.getJobPostings(pageable);
        log.debug("공고 목록 조회 완료 - 총 {}개", response.totalCount());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * MBTI 매칭 공고 목록 조회
     * 
     * @param mbtiType 사용자 MBTI 타입
     * @param pageable 페이징 정보
     * @return 매칭된 공고 목록
     */
    @GetMapping("/mbti-matched")
    public ResponseEntity<JobPostingListResponseDto> getMbtiMatchedJobPostings(
            @RequestParam String mbtiType,
            @PageableDefault(size = 16) Pageable pageable) {
        
        log.debug("MBTI 매칭 공고 조회 요청 - 타입: {}", mbtiType);
        
        JobPostingListResponseDto response = postService.getMbtiMatchedJobPostings(mbtiType, pageable);
        log.debug("MBTI 매칭 공고 조회 완료 - 총 {}개", response.totalCount());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 공고 상세 조회
     * 
     * @param jobPostingId 공고 ID
     * @return 공고 상세 정보
     */
    @GetMapping("/{jobPostingId}")
    public ResponseEntity<JobPostingDto> getJobPostingDetail(
            @PathVariable Long jobPostingId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("CustomUserDetails : {}", userDetails);
        JobPostingDto response = postService.getJobPostingDetail(jobPostingId, userDetails);
        log.info("공고 상세 조회 완료 - 제목: {}", response.title());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 공고 등록
     * 
     * @param companyId 회사 ID
     * @param title 공고 제목
     * @param description 공고 설명
     * @param experienceLevel 경력 수준
     * @param salaryRange 급여 범위
     * @param location 근무 위치
     * @param workType 근무 형태
     * @param preferredDeveloperTypes 선호 개발자 성향
     * @param expiresAt 공고 만료일
     * @param selectedTechStackNames 선택된 기술스택
     * @param jobImageFile 공고 이미지 파일
     * @return 등록된 공고 정보
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<JobPostingDto> createJobPosting(
            @RequestParam Long companyId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String salaryRange,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String preferredDeveloperTypes,
            @RequestParam String expiresAt,
            @RequestParam(required = false) String selectedTechStackNames,
            @RequestParam(required = false) MultipartFile jobImageFile) {
        
        log.debug("공고 등록 요청 - 회사 ID: {}, 제목: {}", companyId, title);
        
        // DTO 생성
        CreateJobPostingRequestDto requestDto = CreateJobPostingRequestDto.builder()
                .companyId(companyId)
                .title(title)
                .description(description)
                .experienceLevel(experienceLevel)
                .salaryRange(salaryRange)
                .location(location)
                .workType(workType)
                .preferredDeveloperTypes(preferredDeveloperTypes)
                .expiresAt(parseDateTime(expiresAt))
                .selectedTechStackNames(selectedTechStackNames)
                .jobImageFile(jobImageFile)
                .build();
        
        JobPostingDto response = postService.createJobPosting(requestDto);
        log.debug("공고 등록 완료 - ID: {}", response.jobPostingId());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 공고 수정
     * 
     * @param jobPostingId 공고 ID
     * @param companyId 회사 ID
     * @param title 공고 제목
     * @param description 공고 설명
     * @param experienceLevel 경력 수준
     * @param salaryRange 급여 범위
     * @param location 근무 위치
     * @param workType 근무 형태
     * @param preferredDeveloperTypes 선호 개발자 성향
     * @param expiresAt 공고 만료일
     * @param selectedTechStackNames 선택된 기술스택
     * @param jobImageFile 공고 이미지 파일
     * @return 수정된 공고 정보
     */
    @PutMapping(value = "/{jobPostingId}", consumes = "multipart/form-data")
    public ResponseEntity<JobPostingDto> updateJobPosting(
            @PathVariable Long jobPostingId,
            @RequestParam Long companyId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String salaryRange,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String preferredDeveloperTypes,
            @RequestParam String expiresAt,
            @RequestParam(required = false) String selectedTechStackNames,
            @RequestParam(required = false) MultipartFile jobImageFile) {
        
        log.debug("공고 수정 요청 - 공고 ID: {}", jobPostingId);
        
        // DTO 생성
        CreateJobPostingRequestDto requestDto = CreateJobPostingRequestDto.builder()
                .companyId(companyId)
                .title(title)
                .description(description)
                .experienceLevel(experienceLevel)
                .salaryRange(salaryRange)
                .location(location)
                .workType(workType)
                .preferredDeveloperTypes(preferredDeveloperTypes)
                .expiresAt(parseDateTime(expiresAt))
                .selectedTechStackNames(selectedTechStackNames)
                .jobImageFile(jobImageFile)
                .build();
        
        JobPostingDto response = postService.updateJobPosting(jobPostingId, requestDto);
        log.debug("공고 수정 완료 - ID: {}", response.jobPostingId());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 공고 삭제
     * 
     * @param jobPostingId 공고 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{jobPostingId}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long jobPostingId) {
        log.debug("공고 삭제 요청 - 공고 ID: {}", jobPostingId);
        
        postService.deleteJobPosting(jobPostingId);
        log.debug("공고 삭제 완료 - ID: {}", jobPostingId);
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * 공고 지원
     * 
     * @param requestDto 지원 요청 데이터
     * @return 지원 결과
     */
    @PostMapping("/apply")
    public ResponseEntity<Void> applyToJobPosting(
            @Valid @RequestBody JobApplicationRequestDto requestDto) {
        
        log.debug("공고 지원 요청 - 공고 ID: {}, 사용자 ID: {}", 
                requestDto.jobPostingId(), requestDto.userId());
        
        postService.applyToJobPosting(requestDto);
        log.debug("공고 지원 완료");
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * 기술 스택 목록 조회
     * 
     * @return 기술 스택 목록
     */
    @GetMapping("/tech-stacks")
    public ResponseEntity<List<TechStackDto>> getTechStacks() {
        log.debug("기술 스택 목록 조회 요청");
        
        List<TechStackDto> response = postService.getTechStacks();
        log.debug("기술 스택 목록 조회 완료 - 총 {}개", response.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 사용자의 지원 내역 조회
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 지원 내역 목록
     */
    @GetMapping("/applications/{userId}")
    public ResponseEntity<JobPostingListResponseDto> getUserApplications(
            @PathVariable Long userId,
            @PageableDefault(size = 16) Pageable pageable) {
        
        log.debug("사용자 지원 내역 조회 요청 - 사용자 ID: {}", userId);
        
        JobPostingListResponseDto response = postService.getUserApplications(userId, pageable);
        log.debug("사용자 지원 내역 조회 완료 - 총 {}개", response.totalCount());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 지원 여부 확인
     * 
     * @param jobPostingId 공고 ID
     * @param userId 사용자 ID
     * @return 지원 여부
     */
    @GetMapping("/{jobPostingId}/application-status")
    public ResponseEntity<Boolean> checkApplicationStatus(
            @PathVariable Long jobPostingId,
            @RequestParam Long userId) {
        
        log.debug("지원 여부 확인 요청 - 공고 ID: {}, 사용자 ID: {}", jobPostingId, userId);
        
        boolean isApplied = postService.checkApplicationStatus(jobPostingId, userId);
        log.debug("지원 여부 확인 완료 - 지원 여부: {}", isApplied);
        
        return ResponseEntity.ok(isApplied);
    }
}

