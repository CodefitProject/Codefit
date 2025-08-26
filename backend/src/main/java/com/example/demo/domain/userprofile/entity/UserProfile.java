package com.example.demo.domain.userprofile.entity;

import com.example.demo.domain.baseuser.entity.BaseUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_user_id", nullable = false, unique = true)
    private BaseUser baseUser;

    // ERD 컬럼 대응
    private String gender; // MAN/WOMAN 등 문자열로 저장
    private String mobile;
    @Column(name = "current_position")
    private String currentPosition;
    @Column(name = "year_salary")
    private String yearSalary; // 범위 문자열 보존
    private String career; // 신입/경력 등 요약 값
    private String bio;
    @Column(name = "profile_image_path")
    private String profileImagePath;
    @Column(name = "is_profile_complete")
    private Boolean isProfileComplete;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


