package com.example.demo.domain.post.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QJobApplication is a Querydsl query type for JobApplication
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QJobApplication extends EntityPathBase<JobApplication> {

    private static final long serialVersionUID = 985509696L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QJobApplication jobApplication = new QJobApplication("jobApplication");

    public final NumberPath<Long> applicationId = createNumber("applicationId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> appliedAt = createDateTime("appliedAt", java.time.LocalDateTime.class);

    public final QJobPosting jobPosting;

    public final StringPath status = createString("status");

    public final com.example.demo.domain.baseuser.entity.QBaseUser user;

    public QJobApplication(String variable) {
        this(JobApplication.class, forVariable(variable), INITS);
    }

    public QJobApplication(Path<? extends JobApplication> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QJobApplication(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QJobApplication(PathMetadata metadata, PathInits inits) {
        this(JobApplication.class, metadata, inits);
    }

    public QJobApplication(Class<? extends JobApplication> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.jobPosting = inits.isInitialized("jobPosting") ? new QJobPosting(forProperty("jobPosting"), inits.get("jobPosting")) : null;
        this.user = inits.isInitialized("user") ? new com.example.demo.domain.baseuser.entity.QBaseUser(forProperty("user")) : null;
    }

}

