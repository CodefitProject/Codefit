package com.example.demo.domain.post.service;

import com.example.demo.common.security.service.CustomUserDetails;
import com.example.demo.common.service.S3Service;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.company.entity.Company;
import com.example.demo.domain.company.repository.CompanyRepository;
import com.example.demo.domain.post.dto.*;
import com.example.demo.domain.post.entity.JobApplication;
import com.example.demo.domain.post.entity.JobPosting;
import com.example.demo.domain.post.entity.JobPostingTechStack;
import com.example.demo.domain.post.entity.TechStack;
import com.example.demo.domain.post.repository.JobApplicationRepository;
import com.example.demo.domain.post.repository.JobPostingRepository;
import com.example.demo.domain.post.repository.JobPostingTechStackRepository;
import com.example.demo.domain.post.repository.TechStackRepository;
import com.example.demo.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채용 공고 관련 서비스 구현체
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PostServiceImpl implements PostService {
    
    private final JobPostingRepository jobPostingRepository;
    private final TechStackRepository techStackRepository;
    private final JobPostingTechStackRepository jobPostingTechStackRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyRepository companyRepository;
    private final BaseUserRepository baseUserRepository;
    private final ObjectMapper objectMapper;
    private final S3Service s3Service;
    
    @Override
    @Transactional(readOnly = true)
    public JobPostingListResponseDto getJobPostings(Pageable pageable) {
        log.debug("공고 목록 조회 - 페이지: {}, 크기: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        try {
            Page<JobPosting> jobPostingPage = jobPostingRepository.findActiveAndNotExpiredJobPostings(
                    LocalDateTime.now(), pageable);
            
            log.debug("공고 엔티티 조회 완료 - 총 {}개", jobPostingPage.getTotalElements());
            log.debug("공고 엔티티 리스트: {}", jobPostingPage.getContent().size());
            
            List<JobPostingDto> jobPostings = jobPostingPage.getContent().stream()
                    .map(jobPosting -> {
                        try {
                            log.debug("DTO 변환 중 - 공고 ID: {}, 제목: {}", jobPosting.getJobPostingId(), jobPosting.getTitle());
                            return JobPostingDto.from(jobPosting);
                        } catch (Exception e) {
                            log.error("DTO 변환 실패 - 공고 ID: {}, 오류: {}", jobPosting.getJobPostingId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            log.debug("DTO 변환 완료 - 총 {}개", jobPostings.size());
            
            return JobPostingListResponseDto.builder()
                    .jobPostings(jobPostings)
                    .totalCount(jobPostingPage.getTotalElements())
                    .currentPage(pageable.getPageNumber())
                    .totalPages(jobPostingPage.getTotalPages())
                    .build();
                    
        } catch (Exception e) {
            log.error("공고 목록 조회 중 오류 발생", e);
            throw new BusinessException("공고 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public JobPostingListResponseDto getMbtiMatchedJobPostings(String mbtiType, Pageable pageable) {
        log.debug("MBTI 매칭 공고 목록 조회 - 타입: {}", mbtiType);
        
        try {
            Page<JobPosting> jobPostingPage = jobPostingRepository.findMbtiMatchedJobPostings(
                    mbtiType, LocalDateTime.now(), pageable);
            
            List<JobPostingDto> jobPostings = jobPostingPage.getContent().stream()
                    .map(JobPostingDto::from)
                    .collect(Collectors.toList());
            
            log.debug("MBTI 매칭 공고 조회 완료 - 총 {}개", jobPostingPage.getTotalElements());
            
            return JobPostingListResponseDto.builder()
                    .jobPostings(jobPostings)
                    .totalCount(jobPostingPage.getTotalElements())
                    .currentPage(pageable.getPageNumber())
                    .totalPages(jobPostingPage.getTotalPages())
                    .build();
                    
        } catch (Exception e) {
            log.error("MBTI 매칭 공고 조회 중 오류 발생", e);
            throw new BusinessException("MBTI 매칭 공고 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public JobPostingDto getJobPostingDetail(Long jobPostingId, CustomUserDetails userDetails) {
        log.info("공고 상세 조회 - 공고 ID: {}", jobPostingId);
        
        try {
            // 기술스택을 포함하여 조회
            JobPosting jobPosting = jobPostingRepository.findByIdWithTechStacks(jobPostingId)
                    .orElseThrow(() -> new BusinessException("존재하지 않는 공고입니다."));
            
            JobPostingDto dto = JobPostingDto.from(jobPosting);
            // 지원 여부 및 소유자 여부 확인
            if (userDetails != null) {
                long userId = userDetails.baseUser().getBaseUserId();
                boolean isApplied = jobApplicationRepository.existsByJobPostingJobPostingIdAndUserBaseUserId(
                        jobPostingId, userId);
                
                // 소유자 여부 확인 - 공고의 회사 baseUserId와 현재 사용자 ID 비교
                boolean isOwner = jobPosting.getCompany().getBaseUser().getBaseUserId().equals(userId);
                log.info(">>>>>>>>>>>>>>>>>> isOwner : {}", isOwner);
                dto = JobPostingDto.builder()
                        .jobPostingId(dto.jobPostingId())
                        .companyId(dto.companyId())
                        .companyName(dto.companyName())
                        .title(dto.title())
                        .description(dto.description())
                        .experienceLevel(dto.experienceLevel())
                        .salaryRange(dto.salaryRange())
                        .location(dto.location())
                        .workType(dto.workType())
                        .preferredDeveloperTypes(dto.preferredDeveloperTypes())
                        .expiresAt(dto.expiresAt())
                        .status(dto.status())
                        .jobImagePath(dto.jobImagePath())
                        .logoPath(dto.logoPath())
                        .createdAt(dto.createdAt())
                        .isApplied(isApplied)
                        .isOwner(isOwner)
                        .selectedTechStackNames(dto.selectedTechStackNames()) // 기술스택 정보 유지
                        .build();
            }
            
            log.debug("공고 상세 조회 완료 - 제목: {}", jobPosting.getTitle());
            return dto;
            
        } catch (Exception e) {
            log.error("공고 상세 조회 중 오류 발생", e);
            throw new BusinessException("공고 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    public JobPostingDto createJobPosting(CreateJobPostingRequestDto requestDto) {
        log.debug("공고 등록 - 회사 ID: {}, 제목: {}", requestDto.companyId(), requestDto.title());
        
        try {
            // 회사 존재 여부 확인
            Company company = companyRepository.findById(requestDto.companyId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 회사입니다."));
            
            // 기술스택 이름 목록 파싱
            List<String> techStackNames = null;
            if (requestDto.selectedTechStackNames() != null && !requestDto.selectedTechStackNames().trim().isEmpty()) {
                try {
                    // JSON 문자열을 List<String>으로 파싱
                    techStackNames = objectMapper.readValue(
                        requestDto.selectedTechStackNames(), 
                        new TypeReference<List<String>>() {}
                    );
                    
                    log.debug("기술스택 처리 완료 - 총 {}개", techStackNames.size());
                } catch (Exception e) {
                    log.warn("기술스택 파싱 중 오류 발생: {}", e.getMessage());
                }
            }
            
            // 이미지 업로드 처리
            String jobImagePath = null;
            if (requestDto.jobImageFile() != null && !requestDto.jobImageFile().isEmpty()) {
                try {
                    jobImagePath = s3Service.uploadFile(requestDto.jobImageFile(), "job_images");
                    log.info("공고 이미지 업로드 성공: {}", jobImagePath);
                } catch (Exception e) {
                    log.warn("공고 이미지 업로드 실패: {}", e.getMessage());
                    // 이미지 업로드 실패는 공고 등록을 중단시키지 않음
                }
            }
            
            // 공고 생성
            JobPosting jobPosting = JobPosting.builder()
                    .company(company)
                    .title(requestDto.title())
                    .description(requestDto.description())
                    .experienceLevel(requestDto.experienceLevel())
                    .salaryRange(requestDto.salaryRange())
                    .location(requestDto.location())
                    .workType(requestDto.workType())
                    .preferredDeveloperTypes(requestDto.preferredDeveloperTypes())
                    .expiresAt(requestDto.expiresAt())
                    .status("ACTIVE")
                    .jobImagePath(jobImagePath)
                    .build();
            
            JobPosting savedJobPosting = jobPostingRepository.save(jobPosting);
            log.debug("공고 등록 완료 - ID: {}", savedJobPosting.getJobPostingId());
            
            // 기술스택 관계 저장
            if (techStackNames != null && !techStackNames.isEmpty()) {
                for (String techStackName : techStackNames) {
                    techStackRepository.findByTechStackName(techStackName)
                        .ifPresent(techStack -> {
                            JobPostingTechStack jobPostingTechStack = JobPostingTechStack.builder()
                                .jobPosting(savedJobPosting)
                                .techStack(techStack)
                                .build();
                            jobPostingTechStackRepository.save(jobPostingTechStack);
                        });
                }
                log.debug("기술스택 관계 저장 완료 - 총 {}개", techStackNames.size());
            }
            
            return JobPostingDto.from(savedJobPosting);
            
        } catch (Exception e) {
            log.error("공고 등록 중 오류 발생", e);
            throw new BusinessException("공고 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    public JobPostingDto updateJobPosting(Long jobPostingId, CreateJobPostingRequestDto requestDto) {
        log.debug("공고 수정 - 공고 ID: {}", jobPostingId);
        
        try {
            JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                    .orElseThrow(() -> new BusinessException("존재하지 않는 공고입니다."));
            
            // 기술스택 이름 목록 파싱
            List<String> techStackNames = null;
            if (requestDto.selectedTechStackNames() != null && !requestDto.selectedTechStackNames().trim().isEmpty()) {
                try {
                    // JSON 문자열을 List<String>으로 파싱
                    techStackNames = objectMapper.readValue(
                        requestDto.selectedTechStackNames(), 
                        new TypeReference<List<String>>() {}
                    );
                    
                    log.debug("기술스택 처리 완료 - 총 {}개", techStackNames.size());
                } catch (Exception e) {
                    log.warn("기술스택 파싱 중 오류 발생: {}", e.getMessage());
                }
            }
            
            // 이미지 업로드 처리
            String jobImagePath = jobPosting.getJobImagePath(); // 기존 이미지 경로 유지
            if (requestDto.jobImageFile() != null && !requestDto.jobImageFile().isEmpty()) {
                try {
                    // 기존 이미지가 있다면 삭제
                    if (jobImagePath != null) {
                        try {
                            String fileKey = s3Service.extractFileKeyFromUrl(jobImagePath);
                            s3Service.deleteFile(fileKey);
                        } catch (Exception e) {
                            log.warn("기존 이미지 삭제 실패: {}", e.getMessage());
                        }
                    }
                    
                    // 새 이미지 업로드
                    jobImagePath = s3Service.uploadFile(requestDto.jobImageFile(), "job_images");
                    log.info("공고 이미지 업로드 성공: {}", jobImagePath);
                } catch (Exception e) {
                    log.warn("공고 이미지 업로드 실패: {}", e.getMessage());
                    // 이미지 업로드 실패는 공고 수정을 중단시키지 않음
                }
            }
            
            // 공고 정보 업데이트
            jobPosting.updateJobPosting(
                    requestDto.title(),
                    requestDto.description(),
                    requestDto.experienceLevel(),
                    requestDto.salaryRange(),
                    requestDto.location(),
                    requestDto.workType(),
                    requestDto.preferredDeveloperTypes(),
                    requestDto.expiresAt()
            );
            
            // 이미지 경로 업데이트
            if (requestDto.jobImageFile() != null && !requestDto.jobImageFile().isEmpty()) {
                jobPosting.updateJobImagePath(jobImagePath);
            }
            
            // 기존 기술스택 관계 삭제
            jobPostingTechStackRepository.deleteByJobPostingId(jobPostingId);
            
            // 새로운 기술스택 관계 저장
            if (techStackNames != null && !techStackNames.isEmpty()) {
                for (String techStackName : techStackNames) {
                    techStackRepository.findByTechStackName(techStackName)
                        .ifPresent(techStack -> {
                            JobPostingTechStack jobPostingTechStack = JobPostingTechStack.builder()
                                .jobPosting(jobPosting)
                                .techStack(techStack)
                                .build();
                            jobPostingTechStackRepository.save(jobPostingTechStack);
                        });
                }
                log.debug("기술스택 관계 업데이트 완료 - 총 {}개", techStackNames.size());
            }
            
            JobPosting updatedJobPosting = jobPostingRepository.save(jobPosting);
            log.debug("공고 수정 완료 - ID: {}", updatedJobPosting.getJobPostingId());
            
            return JobPostingDto.from(updatedJobPosting);
            
        } catch (Exception e) {
            log.error("공고 수정 중 오류 발생", e);
            throw new BusinessException("공고 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteJobPosting(Long jobPostingId) {
        log.debug("공고 삭제 - 공고 ID: {}", jobPostingId);
        
        try {
            JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                    .orElseThrow(() -> new BusinessException("존재하지 않는 공고입니다."));
            
            // 소프트 삭제 처리
            jobPosting.softDelete();
            jobPostingRepository.save(jobPosting);
            
            log.debug("공고 삭제 완료 - ID: {}", jobPostingId);
            
        } catch (Exception e) {
            log.error("공고 삭제 중 오류 발생", e);
            throw new BusinessException("공고 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    public void applyToJobPosting(JobApplicationRequestDto requestDto) {
        log.debug("공고 지원 - 공고 ID: {}, 사용자 ID: {}", requestDto.jobPostingId(), requestDto.userId());
        
        try {
            // 공고 존재 여부 확인
            JobPosting jobPosting = jobPostingRepository.findById(requestDto.jobPostingId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 공고입니다."));
            
            // 사용자 존재 여부 확인
            BaseUser user = baseUserRepository.findById(requestDto.userId())
                    .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다."));
            
            // 중복 지원 확인
            if (jobApplicationRepository.existsByJobPostingJobPostingIdAndUserBaseUserId(
                    requestDto.jobPostingId(), requestDto.userId())) {
                throw new BusinessException("이미 지원한 공고입니다.");
            }
            
            // 지원 정보 생성
            JobApplication jobApplication = JobApplication.builder()
                    .jobPosting(jobPosting)
                    .user(user)
                    .build();
            
            jobApplicationRepository.save(jobApplication);
            log.debug("공고 지원 완료 - 공고 ID: {}, 사용자 ID: {}", requestDto.jobPostingId(), requestDto.userId());
            
        } catch (Exception e) {
            log.error("공고 지원 중 오류 발생", e);
            throw new BusinessException("공고 지원 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<TechStackDto> getTechStacks() {
        log.debug("기술 스택 목록 조회");
        
        try {
            List<TechStack> techStacks = techStackRepository.findAllByOrderByTechStackNameAsc();
            
            List<TechStackDto> result = techStacks.stream()
                    .map(TechStackDto::from)
                    .collect(Collectors.toList());
            
            log.debug("기술 스택 목록 조회 완료 - 총 {}개", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("기술 스택 목록 조회 중 오류 발생", e);
            throw new BusinessException("기술 스택 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public JobPostingListResponseDto getUserApplications(Long userId, Pageable pageable) {
        log.debug("사용자 지원 내역 조회 - 사용자 ID: {}", userId);
        
        try {
            Page<JobApplication> applicationPage = jobApplicationRepository.findByUserBaseUserIdOrderByAppliedAtDesc(
                    userId, pageable);
            
            List<JobPostingDto> jobPostings = applicationPage.getContent().stream()
                    .map(application -> {
                        JobPostingDto dto = JobPostingDto.from(application.getJobPosting());
                        return JobPostingDto.builder()
                                .jobPostingId(dto.jobPostingId())
                                .companyId(dto.companyId())
                                .companyName(dto.companyName())
                                .title(dto.title())
                                .description(dto.description())
                                .experienceLevel(dto.experienceLevel())
                                .salaryRange(dto.salaryRange())
                                .location(dto.location())
                                .workType(dto.workType())
                                .preferredDeveloperTypes(dto.preferredDeveloperTypes())
                                .expiresAt(dto.expiresAt())
                                .status(dto.status())
                                .jobImagePath(dto.jobImagePath())
                                .logoPath(dto.logoPath())
                                .createdAt(dto.createdAt())
                                .isApplied(true) // 지원 내역이므로 true
                                .build();
                    })
                    .collect(Collectors.toList());
            
            log.debug("사용자 지원 내역 조회 완료 - 총 {}개", applicationPage.getTotalElements());
            
            return JobPostingListResponseDto.builder()
                    .jobPostings(jobPostings)
                    .totalCount(applicationPage.getTotalElements())
                    .currentPage(pageable.getPageNumber())
                    .totalPages(applicationPage.getTotalPages())
                    .build();
                    
        } catch (Exception e) {
            log.error("사용자 지원 내역 조회 중 오류 발생", e);
            throw new BusinessException("사용자 지원 내역 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean checkApplicationStatus(Long jobPostingId, Long userId) {
        log.debug("지원 여부 확인 - 공고 ID: {}, 사용자 ID: {}", jobPostingId, userId);
        
        try {
            boolean isApplied = jobApplicationRepository.existsByJobPostingJobPostingIdAndUserBaseUserId(
                    jobPostingId, userId);
            
            log.debug("지원 여부 확인 완료 - 지원 여부: {}", isApplied);
            return isApplied;
            
        } catch (Exception e) {
            log.error("지원 여부 확인 중 오류 발생", e);
            throw new BusinessException("지원 여부 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}

