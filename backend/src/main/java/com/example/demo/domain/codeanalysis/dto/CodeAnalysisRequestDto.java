package com.example.demo.domain.codeanalysis.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record CodeAnalysisRequestDto(
    List<MultipartFile> files
) {}