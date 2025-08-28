package com.example.demo.domain.post.repository;

import com.example.demo.domain.post.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 채용 지원 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * 사용자의 특정 공고 지원 여부 확인
     */
    boolean existsByJobPostingJobPostingIdAndUserBaseUserId(Long jobPostingId, Long userId);

    /**
     * 사용자의 특정 공고 지원 정보 조회
     */
    Optional<JobApplication> findByJobPostingJobPostingIdAndUserBaseUserId(Long jobPostingId, Long userId);

    /**
     * 사용자의 모든 지원 내역 조회 (페이징)
     */
    Page<JobApplication> findByUserBaseUserIdOrderByAppliedAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 공고의 모든 지원자 조회
     */
    List<JobApplication> findByJobPostingJobPostingIdOrderByAppliedAtDesc(Long jobPostingId);

    /**
     * 특정 공고의 지원자 수 조회
     */
    long countByJobPostingJobPostingId(Long jobPostingId);

    /**
     * 특정 상태의 지원 내역 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.baseUserId = :userId AND ja.status = :status ORDER BY ja.appliedAt DESC")
    Page<JobApplication> findByUserIdAndStatus(@Param("userId") Long userId, 
                                               @Param("status") String status, 
                                               Pageable pageable);

    /**
     * 특정 회사의 모든 지원자 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.jobPosting.company.companyId = :companyId ORDER BY ja.appliedAt DESC")
    Page<JobApplication> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);
}

