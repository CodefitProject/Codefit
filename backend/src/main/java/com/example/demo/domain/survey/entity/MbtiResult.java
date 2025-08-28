package com.example.demo.domain.survey.entity;

import com.example.demo.domain.baseuser.entity.BaseUser;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * MBTI 결과 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "mbti_results")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MbtiResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Long typeId;

    /**
     * 사용자 정보 (BaseUser와 연결)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private BaseUser user;

    /**
     * MBTI 타입 코드 (예: BRSD, AITF)
     */
    @Column(name = "type_code", nullable = false, length = 4)
    private String typeCode;

    /**
     * 타입 이름
     */
    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;

    /**
     * 타입 설명
     */
    @Column(name = "type_description", columnDefinition = "TEXT")
    private String typeDescription;

    /**
     * B/A 축 점수 (-50 ~ +50)
     */
    @Column(name = "ab_score", nullable = false)
    private Double abScore;

    /**
     * R/I 축 점수 (-50 ~ +50)
     */
    @Column(name = "ri_score", nullable = false)
    private Double riScore;

    /**
     * S/T 축 점수 (-50 ~ +50)
     */
    @Column(name = "st_score", nullable = false)
    private Double stScore;

    /**
     * D/F 축 점수 (-50 ~ +50)
     */
    @Column(name = "df_score", nullable = false)
    private Double dfScore;

    /**
     * MBTI 설문 완료 여부
     */
    @Column(name = "is_mbti_checked", nullable = false)
    private Boolean isMbtiChecked;

    /**
     * 코드 분석 완료 여부
     */
    @Column(name = "is_code_checked", nullable = false)
    private Boolean isCodeChecked;

    /**
     * 코드 분석 코멘트
     */
    @Column(name = "code_analysis_comment", columnDefinition = "TEXT")
    private String codeAnalysisComment;

    /**
     * 코드 분석 상세 결과
     */
    @Column(name = "code_analysis_detail", columnDefinition = "TEXT")
    private String codeAnalysisDetail;

    /**
     * 축별 기여도 (JSON 형식)
     */
    @Column(name = "axis_contributions", columnDefinition = "TEXT")
    private String axisContributions;

    /**
     * 답변 패턴 분석
     */
    @Column(name = "answer_pattern", columnDefinition = "TEXT")
    private String answerPattern;

    /**
     * 주요 인사이트 (JSON 형식)
     */
    @Column(name = "key_insights", columnDefinition = "TEXT")
    private String keyInsights;

    /**
     * 분석 완료 일시
     */
    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public MbtiResult(BaseUser user, String typeCode, String typeName, String typeDescription,
                      Double abScore, Double riScore, Double stScore, Double dfScore,
                      Boolean isMbtiChecked, Boolean isCodeChecked,
                      String codeAnalysisComment, String codeAnalysisDetail,
                      String axisContributions, String answerPattern, String keyInsights) {
        this.user = user;
        this.typeCode = typeCode;
        this.typeName = typeName;
        this.typeDescription = typeDescription;
        this.abScore = abScore;
        this.riScore = riScore;
        this.stScore = stScore;
        this.dfScore = dfScore;
        this.isMbtiChecked = isMbtiChecked != null ? isMbtiChecked : false;
        this.isCodeChecked = isCodeChecked != null ? isCodeChecked : false;
        this.codeAnalysisComment = codeAnalysisComment;
        this.codeAnalysisDetail = codeAnalysisDetail;
        this.axisContributions = axisContributions;
        this.answerPattern = answerPattern;
        this.keyInsights = keyInsights;
        this.analyzedAt = LocalDateTime.now();
    }

    /**
     * MBTI 결과 업데이트
     */
    public void updateMbtiResult(String typeCode, String typeName, String typeDescription,
                                 Double abScore, Double riScore, Double stScore, Double dfScore) {
        this.typeCode = typeCode;
        this.typeName = typeName;
        this.typeDescription = typeDescription;
        this.abScore = abScore;
        this.riScore = riScore;
        this.stScore = stScore;
        this.dfScore = dfScore;
        this.isMbtiChecked = true;
        this.analyzedAt = LocalDateTime.now();
    }

    /**
     * 코드 분석 결과 업데이트
     */
    public void updateCodeAnalysis(String codeAnalysisComment, String codeAnalysisDetail) {
        this.codeAnalysisComment = codeAnalysisComment;
        this.codeAnalysisDetail = codeAnalysisDetail;
        this.isCodeChecked = true;
    }

    /**
     * 분석 결과 추가 정보 업데이트
     */
    public void updateAnalysisDetails(String axisContributions, String answerPattern, String keyInsights) {
        this.axisContributions = axisContributions;
        this.answerPattern = answerPattern;
        this.keyInsights = keyInsights;
    }
}

