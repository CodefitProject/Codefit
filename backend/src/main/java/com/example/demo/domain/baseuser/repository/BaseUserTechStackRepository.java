package com.example.demo.domain.baseuser.repository;

import com.example.demo.domain.baseuser.entity.BaseUserTechStack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 사용자 - 기술 스택 중간 테이블 Repository
 *
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface BaseUserTechStackRepository extends JpaRepository<BaseUserTechStack, Long> {

    /**
     * 특정 사용자의 모든 기술 스택 관계 조회
     */
    List<BaseUserTechStack> findByBaseUserBaseUserId(Long baseUserId);

    /**
     * 특정 기술 스택을 보유한 모든 사용자 관계 조회
     */
    List<BaseUserTechStack> findByTechStackTechStackId(Long techStackId);

    /**
     * 특정 사용자의 모든 기술 스택 관계 삭제
     */
    @Modifying
    @Query("DELETE FROM BaseUserTechStack buts WHERE buts.baseUser.baseUserId = :baseUserId")
    void deleteByBaseUserId(@Param("baseUserId") Long baseUserId);

    /**
     * 특정 사용자와 기술 스택 조합이 존재하는지 확인
     */
    boolean existsByBaseUserBaseUserIdAndTechStackTechStackId(Long baseUserId, Long techStackId);
}
