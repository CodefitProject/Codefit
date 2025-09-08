package com.example.demo.domain.application.dto;

import lombok.Data;

import java.util.List;

@Data
public class JobApplicationsRequestDto {
    private List<Long> applicationIds;
    private String applicationStatus;
    private boolean sendEmail;
    private String emailContent;
}
