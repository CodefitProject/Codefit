package com.example.demo.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * 기술 스택 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "tech_stacks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tech_stack_id")
    private Long techStackId;

    /**
     * 기술 스택 이름
     */
    @Column(name = "tech_stack_name", nullable = false, unique = true, length = 100)
    private String techStackName;

    /**
     * 이 기술스택을 사용하는 채용공고들 (일대다 관계)
     */
    @OneToMany(mappedBy = "techStack", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPostingTechStack> jobPostingTechStacks = new HashSet<>();

    @Builder
    public TechStack(String techStackName) {
        this.techStackName = techStackName;
        this.jobPostingTechStacks = new HashSet<>();
    }
}

