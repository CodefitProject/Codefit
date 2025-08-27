package com.example.demo.domain.survey.repository;

import com.example.demo.domain.survey.entity.MbtiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * MBTI 결과 리포지토리
 * 
 * @author 배상현
 * @since 2025/01/21
 */
@Repository
public interface MbtiResultRepository extends JpaRepository<MbtiResult, Long> {

    /**
     * 사용자의 MBTI 결과 조회
     */
    Optional<MbtiResult> findByUserBaseUserId(Long userId);

    /**
     * 사용자의 MBTI 결과 존재 여부 확인
     */
    boolean existsByUserBaseUserId(Long userId);

    /**
     * 사용자의 MBTI 설문 완료 여부 확인
     */
    @Query("SELECT mr.isMbtiChecked FROM MbtiResult mr WHERE mr.user.baseUserId = :userId")
    Optional<Boolean> findMbtiCheckedStatusByUserId(@Param("userId") Long userId);

    /**
     * 사용자의 코드 분석 완료 여부 확인
     */
    @Query("SELECT mr.isCodeChecked FROM MbtiResult mr WHERE mr.user.baseUserId = :userId")
    Optional<Boolean> findCodeCheckedStatusByUserId(@Param("userId") Long userId);

    /**
     * 특정 MBTI 타입의 사용자 수 조회
     */
    long countByTypeCode(String typeCode);

    /**
     * 사용자의 MBTI 결과 삭제
     */
    void deleteByUserBaseUserId(Long userId);
}

