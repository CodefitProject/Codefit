package com.example.demo.domain.application.controller;

import com.example.demo.domain.application.dto.ApplicationResponseDto;
import com.example.demo.domain.application.dto.JobApplicationsRequestDto;
import com.example.demo.domain.application.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/application")
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * 특정 공고에 지원한 사용자 목록 조회
     *
     * @param jobPostingId 공고 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param pageSize 페이지당 항목 수 (기본값: 10)
     * @param status 상태(필터링) (기본값: "")
     * @return 지원자 목록 + 페이지 정보
     */
    @GetMapping("/{jobPostingId}")
    public ResponseEntity<ApplicationResponseDto> getApplicationList(
            @PathVariable Long jobPostingId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "") String status
    ) {
        ApplicationResponseDto response = applicationService.getApplicationList(jobPostingId, page, pageSize, status);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/{jobPostingId}/status")
    public ResponseEntity<Void> modifyApplicationStatus(
            @PathVariable Long jobPostingId,
            @RequestBody JobApplicationsRequestDto request
    ) {
        applicationService.modifyStatus(jobPostingId, request);
        return ResponseEntity.ok().build();
    }

}