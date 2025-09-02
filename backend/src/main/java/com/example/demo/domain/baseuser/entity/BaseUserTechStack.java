package com.example.demo.domain.baseuser.entity;

import com.example.demo.domain.post.entity.TechStack;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 사용자 - 기술 스택 중간 테이블 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "base_user_tech_stacks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BaseUserTechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "base_user_tech_stack_id")
    private Long baseUserTechStackId;

    /**
     * 사용자 참조
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_user_id", nullable = false)
    private BaseUser baseUser;

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
    public BaseUserTechStack(BaseUser baseUser, TechStack techStack) {
        this.baseUser = baseUser;
        this.techStack = techStack;
    }
}
