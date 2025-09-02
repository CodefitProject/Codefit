package com.example.demo.domain.codeanalysis.controller;

import com.example.demo.common.security.service.CustomUserDetails;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.domain.codeanalysis.service.CodeAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/private/code_analysis")
@RequiredArgsConstructor
public class CodeAnalysisController {

    private final CodeAnalysisService codeAnalysisService;

    /**
     * 코드 분석 요청
     */
    @PostMapping
    public ResponseEntity<CodeAnalysisResponseDto> analyzeCode(
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        return codeAnalysisService.analyzeCodeWithResponse(userDetails, files);
    }

    /**
     * 사용자의 코드 분석 히스토리 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<CodeAnalysis>> getAnalysisHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        return codeAnalysisService.getAnalysisHistoryWithResponse(userDetails);
    }

    /**
     * 사용자의 최신 분석 결과 조회
     */
    @GetMapping("/latest")
    public ResponseEntity<CodeAnalysis> getLatestAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        return codeAnalysisService.getLatestAnalysisWithResponse(userDetails);
    }
}