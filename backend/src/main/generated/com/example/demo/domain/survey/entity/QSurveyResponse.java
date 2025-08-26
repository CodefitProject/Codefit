package com.example.demo.domain.survey.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSurveyResponse is a Querydsl query type for SurveyResponse
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSurveyResponse extends EntityPathBase<SurveyResponse> {

    private static final long serialVersionUID = 1866819298L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSurveyResponse surveyResponse = new QSurveyResponse("surveyResponse");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> responseId = createNumber("responseId", Long.class);

    public final StringPath responses = createString("responses");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public final com.example.demo.domain.baseuser.entity.QBaseUser user;

    public QSurveyResponse(String variable) {
        this(SurveyResponse.class, forVariable(variable), INITS);
    }

    public QSurveyResponse(Path<? extends SurveyResponse> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSurveyResponse(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSurveyResponse(PathMetadata metadata, PathInits inits) {
        this(SurveyResponse.class, metadata, inits);
    }

    public QSurveyResponse(Class<? extends SurveyResponse> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new com.example.demo.domain.baseuser.entity.QBaseUser(forProperty("user")) : null;
    }

}

