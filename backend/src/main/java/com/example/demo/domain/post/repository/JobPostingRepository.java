package com.example.demo.domain.post.repository;

import com.example.demo.domain.application.dto.CompanyOwnerInfoDto;
import com.example.demo.domain.application.dto.CompanyOwnerInfoProjection;
import com.example.demo.domain.post.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 채용 공고 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    /**
     * 활성 상태의 공고 목록 조회 (페이징)
     */
    Page<JobPosting> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    /**
     * 특정 회사의 공고 목록 조회
     */
    List<JobPosting> findByCompanyCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    /**
     * 만료되지 않은 활성 공고 목록 조회 (연관관계 포함)
     */
    @Query("SELECT jp FROM JobPosting jp " +
           "LEFT JOIN FETCH jp.company c " +
           "LEFT JOIN FETCH c.baseUser bu " +
           "WHERE jp.status = 'ACTIVE' AND jp.expiresAt > :now " +
           "ORDER BY jp.createdAt DESC")
    Page<JobPosting> findActiveAndNotExpiredJobPostings(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * MBTI 타입에 매칭되는 공고 목록 조회
     */
    @Query("SELECT jp FROM JobPosting jp WHERE jp.status = 'ACTIVE' AND jp.expiresAt > :now " +
           "AND (jp.preferredDeveloperTypes IS NULL OR jp.preferredDeveloperTypes LIKE %:mbtiType%) " +
           "ORDER BY jp.createdAt DESC")
    Page<JobPosting> findMbtiMatchedJobPostings(@Param("mbtiType") String mbtiType, 
                                                @Param("now") LocalDateTime now, 
                                                Pageable pageable);

    /**
     * 특정 기간 내 생성된 공고 수 조회
     */
    @Query("SELECT COUNT(jp) FROM JobPosting jp WHERE jp.createdAt >= :startDate AND jp.createdAt <= :endDate")
    long countJobPostingsInPeriod(@Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    /**
     * 만료된 공고들을 EXPIRED 상태로 업데이트
     */
    @Query("UPDATE JobPosting jp SET jp.status = 'EXPIRED' WHERE jp.expiresAt <= :now AND jp.status = 'ACTIVE'")
    int updateExpiredJobPostings(@Param("now") LocalDateTime now);

    /**
     * 기술스택을 포함하여 공고 상세 조회 (중간테이블 사용)
     */
    @Query("SELECT jp FROM JobPosting jp " +
           "LEFT JOIN FETCH jp.company c " +
           "LEFT JOIN FETCH c.baseUser bu " +
           "LEFT JOIN FETCH jp.jobPostingTechStacks jpts " +
           "LEFT JOIN FETCH jpts.techStack ts " +
           "WHERE jp.jobPostingId = :jobPostingId")
    Optional<JobPosting> findByIdWithTechStacks(@Param("jobPostingId") Long jobPostingId);

    @Query(value = """
    SELECT b.email AS email, b.name AS name, b.base_user_id AS baseUserId, j.company_id AS companyId
    FROM job_postings j
    JOIN companies c ON j.company_id = c.company_id
    JOIN base_users b ON c.base_user_id = b.base_user_id
    WHERE j.job_posting_id = :jobPostingId
    """, nativeQuery = true)
    CompanyOwnerInfoProjection findCompanyOwnerInfo(@Param("jobPostingId") Long jobPostingId);
}

