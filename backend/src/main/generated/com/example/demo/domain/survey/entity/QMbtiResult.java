package com.example.demo.domain.survey.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QMbtiResult is a Querydsl query type for MbtiResult
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMbtiResult extends EntityPathBase<MbtiResult> {

    private static final long serialVersionUID = 907930670L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMbtiResult mbtiResult = new QMbtiResult("mbtiResult");

    public final NumberPath<Double> abScore = createNumber("abScore", Double.class);

    public final DateTimePath<java.time.LocalDateTime> analyzedAt = createDateTime("analyzedAt", java.time.LocalDateTime.class);

    public final StringPath answerPattern = createString("answerPattern");

    public final StringPath axisContributions = createString("axisContributions");

    public final StringPath codeAnalysisComment = createString("codeAnalysisComment");

    public final StringPath codeAnalysisDetail = createString("codeAnalysisDetail");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Double> dfScore = createNumber("dfScore", Double.class);

    public final BooleanPath isCodeChecked = createBoolean("isCodeChecked");

    public final BooleanPath isMbtiChecked = createBoolean("isMbtiChecked");

    public final StringPath keyInsights = createString("keyInsights");

    public final NumberPath<Double> riScore = createNumber("riScore", Double.class);

    public final NumberPath<Double> stScore = createNumber("stScore", Double.class);

    public final StringPath typeCode = createString("typeCode");

    public final StringPath typeDescription = createString("typeDescription");

    public final NumberPath<Long> typeId = createNumber("typeId", Long.class);

    public final StringPath typeName = createString("typeName");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final com.example.demo.domain.baseuser.entity.QBaseUser user;

    public QMbtiResult(String variable) {
        this(MbtiResult.class, forVariable(variable), INITS);
    }

    public QMbtiResult(Path<? extends MbtiResult> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QMbtiResult(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QMbtiResult(PathMetadata metadata, PathInits inits) {
        this(MbtiResult.class, metadata, inits);
    }

    public QMbtiResult(Class<? extends MbtiResult> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.example.demo.domain.baseuser.entity.QBaseUser(forProperty("user")) : null;
    }

}

