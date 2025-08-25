package com.example.demo.domain.baseuser.entity;
import com.example.demo.domain.baseuser.enums.UserRole;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Entity
@Table(name = "base_users")
public class BaseUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long baseUserId;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String name;

        @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updateAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole; // 일반, 기업, 관리자 등

}

