package com.example.demo.domain.scout.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ScoutRequestDto {
    private Long jobPostingId;
    private int page;
    private int pageSize;
    private String scoutFilter;
    private String mbtiFilters[];
    private int mbtiCount;
    private String techStackFilter[];
}

