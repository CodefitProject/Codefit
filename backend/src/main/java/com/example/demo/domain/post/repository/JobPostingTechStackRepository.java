package com.example.demo.domain.post.repository;

import com.example.demo.domain.post.entity.JobPostingTechStack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 채용 공고 - 기술 스택 중간 테이블 Repository
 *
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface JobPostingTechStackRepository extends JpaRepository<JobPostingTechStack, Long> {

    /**
     * 특정 채용 공고의 모든 기술 스택 관계 조회
     */
    List<JobPostingTechStack> findByJobPostingJobPostingId(Long jobPostingId);

    /**
     * 특정 기술 스택을 사용하는 모든 채용 공고 관계 조회
     */
    List<JobPostingTechStack> findByTechStackTechStackId(Long techStackId);

    /**
     * 특정 채용 공고의 모든 기술 스택 관계 삭제
     */
    @Modifying
    @Query("DELETE FROM JobPostingTechStack jpts WHERE jpts.jobPosting.jobPostingId = :jobPostingId")
    void deleteByJobPostingId(@Param("jobPostingId") Long jobPostingId);

    /**
     * 특정 채용 공고와 기술 스택 조합이 존재하는지 확인
     */
    boolean existsByJobPostingJobPostingIdAndTechStackTechStackId(Long jobPostingId, Long techStackId);
}
