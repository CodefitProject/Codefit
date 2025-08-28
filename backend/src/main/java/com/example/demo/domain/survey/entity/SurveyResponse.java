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
 * 설문 응답 엔티티
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Entity
@Table(name = "survey_responses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "response_id")
    private Long responseId;

    /**
     * 사용자 정보 (BaseUser와 연결)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private BaseUser user;

    /**
     * 응답 데이터 (JSON 형식)
     */
    @Column(name = "responses", nullable = false, columnDefinition = "TEXT")
    private String responses;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public SurveyResponse(BaseUser user, String responses) {
        this.user = user;
        this.responses = responses;
    }

    /**
     * 응답 데이터 업데이트
     */
    public void updateResponses(String responses) {
        this.responses = responses;
    }
}

