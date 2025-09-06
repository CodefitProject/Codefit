package com.example.demo.domain.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDetailDto {
    private Long accountId;
    private String name;
    private String career;
    private String preferredLocations; // 임시로 추가
    private String currentPosition;
    private String yearSalary; // 타입 변환은 프론트에서
    private String email;
    private String bio;
    private int isMbtiChecked;
    private int isCodeChecked;
    private String mbtiType;
}
