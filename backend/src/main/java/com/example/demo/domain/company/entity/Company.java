package com.example.demo.domain.company.entity;

import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.company.enums.CompanyStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "base_user_id", nullable = false, unique = true)
    private BaseUser baseUser;

    @Column(unique = true, nullable = false, name = "business_number")
    private String businessNumber;

    @Column(nullable = false)
    private String industry;

    @Column(name = "emp_count")
    private String empCount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "business_certificate_path")
    private String businessCertificatePath;

    @Column(name = "logo_path")
    private String logoPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyStatus status = CompanyStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Company(BaseUser baseUser, String businessNumber, String industry, String empCount,
                   String description, String businessCertificatePath, String logoPath) {
        this.baseUser = baseUser;
        this.businessNumber = businessNumber;
        this.industry = industry;
        this.empCount = empCount;
        this.description = description;
        this.businessCertificatePath = businessCertificatePath;
        this.logoPath = logoPath;
    }
}