package com.example.demo.domain.codeanalysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_analyses")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class CodeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "analysis_result", columnDefinition = "JSON")
    private String analysisResult;

    @Column(name = "type_code", length = 4)
    private String typeCode;

    @Column(name = "development_style_score")
    private Integer developmentStyleScore;

    @Column(name = "developer_preference_score")
    private Integer developerPreferenceScore;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "confidence_score", precision = 3, scale = 2)
    private BigDecimal confidenceScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 점수 검증 메서드
    public void setDevelopmentStyleScore(Integer developmentStyleScore) {
        if (developmentStyleScore != null && (developmentStyleScore < -50 || developmentStyleScore > 50)) {
            throw new IllegalArgumentException("Development style score must be between -50 and 50");
        }
        this.developmentStyleScore = developmentStyleScore;
    }

    public void setDeveloperPreferenceScore(Integer developerPreferenceScore) {
        if (developerPreferenceScore != null && (developerPreferenceScore < -50 || developerPreferenceScore > 50)) {
            throw new IllegalArgumentException("Developer preference score must be between -50 and 50");
        }
        this.developerPreferenceScore = developerPreferenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        if (confidenceScore != null && (confidenceScore.compareTo(BigDecimal.ZERO) < 0 || confidenceScore.compareTo(BigDecimal.ONE) > 0)) {
            throw new IllegalArgumentException("Confidence score must be between 0.00 and 1.00");
        }
        this.confidenceScore = confidenceScore;
    }

    public void setTypeCode(String typeCode) {
        if (typeCode != null && !typeCode.matches("^(AI|AR|BI|BR)$")) {
            throw new IllegalArgumentException("Type code must be one of: AI, AR, BI, BR");
        }
        this.typeCode = typeCode;
    }
}