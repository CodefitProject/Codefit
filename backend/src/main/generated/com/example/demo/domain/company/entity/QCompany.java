package com.example.demo.domain.company.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCompany is a Querydsl query type for Company
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCompany extends EntityPathBase<Company> {

    private static final long serialVersionUID = -62775789L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCompany company = new QCompany("company");

    public final com.example.demo.domain.baseuser.entity.QBaseUser baseUser;

    public final StringPath businessCertificatePath = createString("businessCertificatePath");

    public final StringPath businessNumber = createString("businessNumber");

    public final NumberPath<Long> companyId = createNumber("companyId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final StringPath description = createString("description");

    public final StringPath empCount = createString("empCount");

    public final StringPath industry = createString("industry");

    public final StringPath logoPath = createString("logoPath");

    public final EnumPath<com.example.demo.domain.company.enums.CompanyStatus> status = createEnum("status", com.example.demo.domain.company.enums.CompanyStatus.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QCompany(String variable) {
        this(Company.class, forVariable(variable), INITS);
    }

    public QCompany(Path<? extends Company> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCompany(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCompany(PathMetadata metadata, PathInits inits) {
        this(Company.class, metadata, inits);
    }

    public QCompany(Class<? extends Company> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.baseUser = inits.isInitialized("baseUser") ? new com.example.demo.domain.baseuser.entity.QBaseUser(forProperty("baseUser")) : null;
    }

}

