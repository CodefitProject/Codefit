package com.example.demo.domain.baseuser.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import jakarta.annotation.Generated;
import com.querydsl.core.types.Path;


/**
 * QBaseUser is a Querydsl query type for BaseUser
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QBaseUser extends EntityPathBase<BaseUser> {

    private static final long serialVersionUID = 2094476133L;

    public static final QBaseUser baseUser = new QBaseUser("baseUser");

    public final NumberPath<Long> baseUserId = createNumber("baseUserId", Long.class);

    public final DateTimePath<java.time.LocalDateTime> createAt = createDateTime("createAt", java.time.LocalDateTime.class);

    public final StringPath email = createString("email");

    public final StringPath name = createString("name");

    public final StringPath password = createString("password");

    public final DateTimePath<java.time.LocalDateTime> updateAt = createDateTime("updateAt", java.time.LocalDateTime.class);

    public final EnumPath<com.example.demo.domain.baseuser.enums.UserRole> userRole = createEnum("userRole", com.example.demo.domain.baseuser.enums.UserRole.class);

    public QBaseUser(String variable) {
        super(BaseUser.class, forVariable(variable));
    }

    public QBaseUser(Path<? extends BaseUser> path) {
        super(path.getType(), path.getMetadata());
    }

    public QBaseUser(PathMetadata metadata) {
        super(BaseUser.class, metadata);
    }

}

