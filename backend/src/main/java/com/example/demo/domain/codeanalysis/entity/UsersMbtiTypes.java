package com.example.demo.domain.codeanalysis.entity;

import com.example.demo.domain.baseuser.entity.BaseUser;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicUpdate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@DynamicUpdate
@Entity
@Table(name = "users_mbti_types")
public class UsersMbtiTypes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Long typeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_user_id", nullable = false, unique = true)
    private BaseUser baseUser;

    @Column(name = "type_code", length = 4, columnDefinition = "CHAR(4) COMMENT 'BRSD, AITF 등 4자리 타입 코드'")
    private String typeCode;

    @Column(name = "a_b_score", precision = 5, scale = 2, columnDefinition = "DECIMAL(5, 2) COMMENT 'Builder 점수 (-50 ~ 50)'")
    private BigDecimal aBScore;

    @Column(name = "r_i_score", precision = 5, scale = 2, columnDefinition = "DECIMAL(5, 2) COMMENT 'Refactor 점수 (-50 ~ 50)'")
    private BigDecimal rIScore;

    @Column(name = "s_t_score", precision = 5, scale = 2, columnDefinition = "DECIMAL(5, 2) COMMENT 'Solo 점수 (-50 ~ 50)'")
    private BigDecimal sTScore;

    @Column(name = "d_f_score", precision = 5, scale = 2, columnDefinition = "DECIMAL(5, 2) COMMENT 'Debug 점수 (-50 ~ 50)'")
    private BigDecimal dFScore;

    @Column(name = "is_mbti_checked")
    private Boolean isMbtiChecked;

    @Column(name = "is_code_checked")
    private Boolean isCodeChecked;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    public void updateScores(BigDecimal aBScore, BigDecimal rIScore, BigDecimal sTScore, BigDecimal dFScore) {
        this.aBScore = aBScore;
        this.rIScore = rIScore;
        this.sTScore = sTScore;
        this.dFScore = dFScore;
        this.analyzedAt = LocalDateTime.now();
    }

    public void markMbtiChecked() {
        this.isMbtiChecked = true;
    }

    public void markCodeChecked() {
        this.isCodeChecked = true;
    }
}