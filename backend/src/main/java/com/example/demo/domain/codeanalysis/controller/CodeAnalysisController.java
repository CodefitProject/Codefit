package com.example.demo.domain.codeanalysis.controller;

import com.example.demo.common.security.service.CustomUserDetails;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisCompleteDto;
import com.example.demo.domain.codeanalysis.dto.CodeAnalysisResponseDto;
import com.example.demo.domain.codeanalysis.entity.CodeAnalysis;
import com.example.demo.domain.codeanalysis.service.CodeAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/private/code_analysis")
@RequiredArgsConstructor
public class CodeAnalysisController {

    private final CodeAnalysisService codeAnalysisService;

    //코드 분석 요청
    @PostMapping
    public ResponseEntity<CodeAnalysisCompleteDto> analyzeCode(
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails userDetails){

        Long baseUserId = userDetails.baseUser().getBaseUserId();
        System.out.println("=== 컨트롤러에서 받은 baseUserId: " + baseUserId);
        System.out.println("=== CustomUserDetails: " + userDetails);
        System.out.println("=== BaseUser: " + userDetails.baseUser());
        
        return ResponseEntity.ok(codeAnalysisService.analyzeCode(baseUserId, files));
      }

    //분석 결과 조회
    @GetMapping("/{analysisId}")
    public ResponseEntity<CodeAnalysisResponseDto> getAnalysisResultSecure(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        return ResponseEntity.ok(codeAnalysisService.getAnalysisResultByUser(
            analysisId, 
            userDetails.baseUser().getBaseUserId()
        ));
    }
}