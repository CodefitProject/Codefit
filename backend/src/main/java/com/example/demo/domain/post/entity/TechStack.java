package com.example.demo.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Builder
    public TechStack(String techStackName) {
        this.techStackName = techStackName;
    }
}

