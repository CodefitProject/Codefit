package com.example.demo.domain.scout.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ScoutRequests {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recommendations_id")
    private Long recommendationId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "user_id")
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    public ScoutRequests(Long jobId, Long userId) {
        this.jobId = jobId;
        this.userId = userId;
    }
}
