package com.example.demo.domain.post.entity;

import com.example.demo.domain.baseuser.entity.BaseUser;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 채용 지원 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "job_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    /**
     * 채용 공고
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    /**
     * 지원자 (BaseUser)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private BaseUser user;

    /**
     * 지원 상태 (PENDING, ACCEPTED, REJECTED)
     */
    @Column(name = "application_status", nullable = false, length = 20)
    private String applicationStatus;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @Builder
    public JobApplication(JobPosting jobPosting, BaseUser user) {
        this.jobPosting = jobPosting;
        this.user = user;
        this.applicationStatus = "PENDING";
    }

    /**
     * 지원 수락
     */
    public void accept() {
        this.applicationStatus = "ACCEPTED";
    }

    /**
     * 지원 거절
     */
    public void reject() {
        this.applicationStatus = "REJECTED";
    }

    @Column(nullable = false)
    private String status = "pending";
}

