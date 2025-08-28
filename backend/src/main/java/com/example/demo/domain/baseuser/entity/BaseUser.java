package com.example.demo.domain.baseuser.entity;
import com.example.demo.domain.baseuser.enums.UserRole;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private LocalDateTime createAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updateAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole; // 일반, 기업, 관리자 등

    /**
     * 사용자 보유 기술 스택 (다대다 관계)
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "base_user_tech_stacks",
        joinColumns = @JoinColumn(name = "base_user_id"),
        inverseJoinColumns = @JoinColumn(name = "tech_stack_id")
    )
    @Builder.Default
    private Set<com.example.demo.domain.post.entity.TechStack> techStacks = new HashSet<>();

}


