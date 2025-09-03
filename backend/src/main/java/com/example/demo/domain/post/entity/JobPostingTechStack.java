package com.example.demo.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 채용 공고 - 기술 스택 중간 테이블 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "job_posting_tech_stacks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPostingTechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_posting_tech_stack_id")
    private Long jobPostingTechStackId;

    /**
     * 채용 공고 참조
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    /**
     * 기술 스택 참조
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_stack_id", nullable = false)
    private TechStack techStack;

    /**
     * 생성 일시
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public JobPostingTechStack(JobPosting jobPosting, TechStack techStack) {
        this.jobPosting = jobPosting;
        this.techStack = techStack;
    }
}
