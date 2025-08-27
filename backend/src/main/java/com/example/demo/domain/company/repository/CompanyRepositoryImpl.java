package com.example.demo.domain.company.repository;

import com.example.demo.domain.baseuser.entity.QBaseUser;
import com.example.demo.domain.company.dto.CompanyInfoDto;
import com.example.demo.domain.company.entity.QCompany;
import com.example.demo.domain.company.enums.CompanyStatus;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CompanyRepositoryImpl implements CompanyRepositoryCustom {

    private final JPAQueryFactory queryFactory;


    @Override
    public Page<CompanyInfoDto> findActiveCompanyInfoWithUser(Pageable pageable) {
        QCompany company = QCompany.company;
        QBaseUser baseUser = QBaseUser.baseUser;

        List<CompanyInfoDto> content = queryFactory
                .select(Projections.constructor(
                        CompanyInfoDto.class,
                        company.companyId,
                        company.baseUser.name, // company 이름은 BaseUser.name 사용
                        company.logoPath,
                        baseUser.email,
                        baseUser.name
                ))
                .from(company)
                .join(company.baseUser, baseUser)
                .where(company.status.eq(CompanyStatus.ACTIVE))
                .orderBy(company.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(company.count())
                .from(company)
                .where(company.status.eq(CompanyStatus.ACTIVE))
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0);
    }
}