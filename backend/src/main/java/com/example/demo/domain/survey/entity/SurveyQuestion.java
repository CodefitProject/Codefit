package com.example.demo.domain.survey.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 설문 질문 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "survey_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurveyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    /**
     * 질문 내용
     */
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    /**
     * 축 구분 (B_A, R_I, S_T, D_F)
     */
    @Column(name = "axis", nullable = false, length = 10)
    private String axis;

    /**
     * 옵션 개수 (기본 7개)
     */
    @Column(name = "options", nullable = false)
    private Integer options;

    /**
     * 활성화 여부
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public SurveyQuestion(String questionText, String axis, Integer options, Boolean isActive) {
        this.questionText = questionText;
        this.axis = axis;
        this.options = options != null ? options : 7;
        this.isActive = isActive != null ? isActive : true;
    }

    /**
     * 질문 활성화
     */
    public void activate() {
        this.isActive = true;
    }

    /**
     * 질문 비활성화
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * 질문 내용 수정
     */
    public void updateQuestionText(String questionText) {
        this.questionText = questionText;
    }
}

