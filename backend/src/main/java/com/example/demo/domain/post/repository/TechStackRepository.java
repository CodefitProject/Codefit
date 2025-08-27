package com.example.demo.domain.post.repository;

import com.example.demo.domain.post.entity.TechStack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 기술 스택 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface TechStackRepository extends JpaRepository<TechStack, Long> {

    /**
     * 기술 스택 이름으로 조회
     */
    Optional<TechStack> findByTechStackName(String techStackName);

    /**
     * 기술 스택 이름 존재 여부 확인
     */
    boolean existsByTechStackName(String techStackName);

    /**
     * 모든 기술 스택을 이름 순으로 조회
     */
    List<TechStack> findAllByOrderByTechStackNameAsc();

    /**
     * 특정 기술 스택 ID 목록으로 조회
     */
    List<TechStack> findByTechStackIdIn(List<Long> techStackIds);
}

