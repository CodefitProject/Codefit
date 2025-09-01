package com.example.demo.domain.post.entity;

import com.example.demo.domain.company.entity.Company;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 채용 공고 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "job_postings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_posting_id")
    private Long jobPostingId;

    /**
     * 회사 정보
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    /**
     * 공고 제목
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 공고 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 경력 레벨
     */
    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    /**
     * 급여 범위
     */
    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    /**
     * 근무 지역
     */
    @Column(name = "location", length = 100)
    private String location;

    /**
     * 근무 형태 (재택, 출근, 하이브리드 등)
     */
    @Column(name = "work_type", length = 50)
    private String workType;

    /**
     * 선호하는 개발자 타입 (MBTI JSON)
     */
    @Column(name = "preferred_developer_types", columnDefinition = "TEXT")
    private String preferredDeveloperTypes;

    /**
     * 공고 만료일
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * 공고 상태 (ACTIVE, INACTIVE, EXPIRED)
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    /**
     * 공고 이미지 경로
     */
    @Column(name = "job_image_path")
    private String jobImagePath;

    /**
     * 요구 기술 스택 (다대다 관계)
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "job_posting_tech_stacks",
        joinColumns = @JoinColumn(name = "job_posting_id"),
        inverseJoinColumns = @JoinColumn(name = "tech_stack_id")
    )
    private Set<TechStack> techStacks = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public JobPosting(Company company, String title, String description, String experienceLevel,
                      String salaryRange, String location, String workType, String preferredDeveloperTypes,
                      LocalDateTime expiresAt, String status, String jobImagePath, Set<TechStack> techStacks) {
        this.company = company;
        this.title = title;
        this.description = description;
        this.experienceLevel = experienceLevel;
        this.salaryRange = salaryRange;
        this.location = location;
        this.workType = workType;
        this.preferredDeveloperTypes = preferredDeveloperTypes;
        this.expiresAt = expiresAt;
        this.status = status != null ? status : "ACTIVE";
        this.jobImagePath = jobImagePath;
        this.techStacks = techStacks != null ? techStacks : new HashSet<>();
    }

    /**
     * 공고 정보 수정
     */
    public void updateJobPosting(String title, String description, String experienceLevel,
                                 String salaryRange, String location, String workType,
                                 String preferredDeveloperTypes, LocalDateTime expiresAt, Set<TechStack> techStacks) {
        this.title = title;
        this.description = description;
        this.experienceLevel = experienceLevel;
        this.salaryRange = salaryRange;
        this.location = location;
        this.workType = workType;
        this.preferredDeveloperTypes = preferredDeveloperTypes;
        this.expiresAt = expiresAt;
        this.techStacks.clear();
        if (techStacks != null) {
            this.techStacks.addAll(techStacks);
        }
    }
    
    /**
     * 공고 이미지 경로 업데이트
     */
    public void updateJobImagePath(String jobImagePath) {
        this.jobImagePath = jobImagePath;
    }

    /**
     * 공고 비활성화
     */
    public void deactivate() {
        this.status = "INACTIVE";
    }

    /**
     * 공고 만료 처리
     */
    public void expire() {
        this.status = "EXPIRED";
    }
}

