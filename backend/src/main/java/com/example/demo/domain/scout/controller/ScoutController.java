package com.example.demo.domain.scout.controller;

import com.example.demo.domain.application.dto.ApplicationResponseDto;
import com.example.demo.domain.scout.dto.ScoutAddRequestDto;
import com.example.demo.domain.scout.dto.ScoutRequestDto;
import com.example.demo.domain.scout.entity.ScoutRequests;
import com.example.demo.domain.scout.service.ScoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scout")
@RequiredArgsConstructor
@Slf4j
public class ScoutController {
    private final ScoutService scoutService;

    /**
     * 특정 공고에 대해 여러 사용자에게 스카우트 요청을 등록합니다.
     *
     * @param jobPostingId 공고 ID
     * @param requestDto 스카우트 대상 사용자 ID 배열
     */
    @PostMapping("/{jobPostingId}/recommend")
    public void insertScout(
            @PathVariable Long jobPostingId,
            @RequestBody ScoutAddRequestDto requestDto
            ) {
        scoutService.insertScout(jobPostingId, requestDto);
    }

    /**
     * 특정 공고에 아직 지원하지 않은 사용자 목록 조회
     *
     * @param jobPostingId 공고 ID
     * @param request 필터 조건 및 페이징 정보
     * @return 미지원자 목록 + 페이지 정보
     */
    @PostMapping("/{jobPostingId}")
    public ResponseEntity<ApplicationResponseDto> getScoutList(
            @PathVariable Long jobPostingId,
            @RequestBody ScoutRequestDto request
    ) {
        ApplicationResponseDto response = scoutService.getScoutList(
                jobPostingId,
                request.getPage(),
                request.getPageSize(),
                request.getScoutFilter(),
                String.join(",", request.getMbtiFilters()),
                request.getMbtiCount(),
                String.join(",", request.getTechStackFilter())
        );
        return ResponseEntity.ok(response);
    }
}
