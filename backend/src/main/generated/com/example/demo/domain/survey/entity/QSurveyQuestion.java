package com.example.demo.domain.survey.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;


/**
 * QSurveyQuestion is a Querydsl query type for SurveyQuestion
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSurveyQuestion extends EntityPathBase<SurveyQuestion> {

    private static final long serialVersionUID = 1041272455L;

    public static final QSurveyQuestion surveyQuestion = new QSurveyQuestion("surveyQuestion");

    public final StringPath axis = createString("axis");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final BooleanPath isActive = createBoolean("isActive");

    public final NumberPath<Integer> options = createNumber("options", Integer.class);

    public final NumberPath<Long> questionId = createNumber("questionId", Long.class);

    public final StringPath questionText = createString("questionText");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QSurveyQuestion(String variable) {
        super(SurveyQuestion.class, forVariable(variable));
    }

    public QSurveyQuestion(Path<? extends SurveyQuestion> path) {
        super(path.getType(), path.getMetadata());
    }

    public QSurveyQuestion(PathMetadata metadata) {
        super(SurveyQuestion.class, metadata);
    }

}

