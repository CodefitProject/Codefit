package com.example.demo.domain.post.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QJobPosting is a Querydsl query type for JobPosting
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QJobPosting extends EntityPathBase<JobPosting> {

    private static final long serialVersionUID = 915070258L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QJobPosting jobPosting = new QJobPosting("jobPosting");

    public final com.example.demo.domain.company.entity.QCompany company;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final StringPath description = createString("description");

    public final StringPath experienceLevel = createString("experienceLevel");

    public final DateTimePath<java.time.LocalDateTime> expiresAt = createDateTime("expiresAt", java.time.LocalDateTime.class);

    public final StringPath jobImagePath = createString("jobImagePath");

    public final NumberPath<Long> jobPostingId = createNumber("jobPostingId", Long.class);

    public final StringPath location = createString("location");

    public final StringPath preferredDeveloperTypes = createString("preferredDeveloperTypes");

    public final StringPath salaryRange = createString("salaryRange");

    public final StringPath status = createString("status");

    public final StringPath title = createString("title");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final StringPath workType = createString("workType");

    public QJobPosting(String variable) {
        this(JobPosting.class, forVariable(variable), INITS);
    }

    public QJobPosting(Path<? extends JobPosting> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QJobPosting(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QJobPosting(PathMetadata metadata, PathInits inits) {
        this(JobPosting.class, metadata, inits);
    }

    public QJobPosting(Class<? extends JobPosting> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.company = inits.isInitialized("company") ? new com.example.demo.domain.company.entity.QCompany(forProperty("company"), inits.get("company")) : null;
    }

}

