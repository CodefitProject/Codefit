package com.example.demo.domain.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ApplicationResponseDto {
    private List<ApplicationDto> result;
    private int currentPage;
    private int totalPage;
    private int totalCount;
}
