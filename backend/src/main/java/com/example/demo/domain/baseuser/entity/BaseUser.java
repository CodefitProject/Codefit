package com.example.demo.domain.baseuser.entity;
import com.example.demo.domain.baseuser.enums.UserRole;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "base_users")
public class BaseUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "base_user_id")
    private Long baseUserId;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String name;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole; // 일반, 기업, 관리자 등

    /**
     * 사용자 보유 기술 스택 (일대다 관계 - 중간테이블 사용)
     */
    @OneToMany(mappedBy = "baseUser", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BaseUserTechStack> baseUserTechStacks = new HashSet<>();

    /**
     * 기술 스택 추가
     */
    public void addTechStack(com.example.demo.domain.post.entity.TechStack techStack) {
        BaseUserTechStack baseUserTechStack = BaseUserTechStack.builder()
                .baseUser(this)
                .techStack(techStack)
                .build();
        this.baseUserTechStacks.add(baseUserTechStack);
    }

    /**
     * 모든 기술 스택 제거
     */
    public void clearTechStacks() {
        this.baseUserTechStacks.clear();
    }

    /**
     * 기술 스택 목록 조회 (편의 메서드)
     */
    public Set<com.example.demo.domain.post.entity.TechStack> getTechStacks() {
        return this.baseUserTechStacks.stream()
                .map(BaseUserTechStack::getTechStack)
                .collect(java.util.stream.Collectors.toSet());
    }

}


