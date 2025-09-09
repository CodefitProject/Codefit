package com.example.demo.domain.post.service;

import com.example.demo.common.security.service.CustomUserDetails;
import com.example.demo.domain.post.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * 채용 공고 관련 서비스 인터페이스
 * 
 * @author 배상현
 * @since 2025/01/21
 */
public interface PostService {
    
    /**
     * 공고 목록 조회 (페이징)
     * 
     * @param pageable 페이징 정보
     * @return 공고 목록
     */
    JobPostingListResponseDto getJobPostings(Pageable pageable);
    
    /**
     * MBTI 및 성향 매칭 공고 목록 조회
     * 
     * @param userDetails 로그인한 사용자 정보 (JWT 토큰에서 추출)
     * @param matchFilter 필터링 강도 (0: 필터링 없음, 1: 1개 이상, 2: 2개 이상, 3: 3개 이상, 4: 4개 이상)
     * @param pageable 페이징 정보
     * @return 매칭된 공고 목록
     */
    JobPostingListResponseDto getMbtiMatchedJobPostings(CustomUserDetails userDetails, String matchFilter, Pageable pageable);
    
    /**
     * 공고 상세 조회
     * 
     * @param jobPostingId 공고 ID
     * @return 공고 상세 정보
     */
    JobPostingDto getJobPostingDetail(Long jobPostingId, CustomUserDetails userDetails);
    
    /**
     * 공고 등록
     * 
     * @param requestDto 공고 등록 요청 데이터
     * @return 등록된 공고 정보
     */
    JobPostingDto createJobPosting(CreateJobPostingRequestDto requestDto);
    
    /**
     * 공고 수정
     * 
     * @param jobPostingId 공고 ID
     * @param requestDto 수정 요청 데이터
     * @return 수정된 공고 정보
     */
    JobPostingDto updateJobPosting(Long jobPostingId, CreateJobPostingRequestDto requestDto);
    
    /**
     * 공고 삭제
     * 
     * @param jobPostingId 공고 ID
     */
    void deleteJobPosting(Long jobPostingId);
    
    /**
     * 공고 지원
     * 
     * @param requestDto 지원 요청 데이터
     */
    void applyToJobPosting(JobApplicationRequestDto requestDto);
    
    /**
     * 기술 스택 목록 조회
     * 
     * @return 기술 스택 목록
     */
    List<TechStackDto> getTechStacks();
    
    /**
     * 사용자의 지원 내역 조회
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 지원 내역 목록
     */
    JobPostingListResponseDto getUserApplications(Long userId, Pageable pageable);
    
    /**
     * 지원 여부 확인
     * 
     * @param jobPostingId 공고 ID
     * @param userId 사용자 ID
     * @return 지원 여부
     */
    boolean checkApplicationStatus(Long jobPostingId, Long userId);
}

