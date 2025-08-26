package com.example.demo.domain.location.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUsersLocationsRelation is a Querydsl query type for UsersLocationsRelation
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUsersLocationsRelation extends EntityPathBase<UsersLocationsRelation> {

    private static final long serialVersionUID = -1546109036L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUsersLocationsRelation usersLocationsRelation = new QUsersLocationsRelation("usersLocationsRelation");

    public final com.example.demo.domain.baseuser.entity.QBaseUser baseUser;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QLocation location;

    public QUsersLocationsRelation(String variable) {
        this(UsersLocationsRelation.class, forVariable(variable), INITS);
    }

    public QUsersLocationsRelation(Path<? extends UsersLocationsRelation> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUsersLocationsRelation(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUsersLocationsRelation(PathMetadata metadata, PathInits inits) {
        this(UsersLocationsRelation.class, metadata, inits);
    }

    public QUsersLocationsRelation(Class<? extends UsersLocationsRelation> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.baseUser = inits.isInitialized("baseUser") ? new com.example.demo.domain.baseuser.entity.QBaseUser(forProperty("baseUser")) : null;
        this.location = inits.isInitialized("location") ? new QLocation(forProperty("location")) : null;
    }

}

