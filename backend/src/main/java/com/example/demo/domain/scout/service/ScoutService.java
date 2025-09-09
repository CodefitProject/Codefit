package com.example.demo.domain.scout.service;

import com.example.demo.common.email.service.EmailService;
import com.example.demo.domain.application.dto.ApplicationDto;
import com.example.demo.domain.application.dto.ApplicationResponseDto;
import com.example.demo.domain.application.dto.CompanyOwnerInfoDto;
import com.example.demo.domain.application.dto.CompanyOwnerInfoProjection;
import com.example.demo.domain.application.repository.ApplicationRepository;
import com.example.demo.domain.post.entity.JobApplication;
import com.example.demo.domain.post.entity.JobPosting;
import com.example.demo.domain.post.repository.JobApplicationRepository;
import com.example.demo.domain.post.repository.JobPostingRepository;
import com.example.demo.domain.scout.dto.ScoutAddRequestDto;
import com.example.demo.domain.scout.entity.ScoutRequests;
import com.example.demo.domain.scout.repository.ScoutRequestsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoutService {
    private final ScoutRequestsRepository scoutRequestsRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EmailService emailService;

    //스카웃 하기
    public void insertScout(Long jobPostingId, ScoutAddRequestDto requestDto) {
        for (Long userId : requestDto.getUserIdList()) {
            ScoutRequests request = new ScoutRequests(jobPostingId, userId);
            scoutRequestsRepository.save(request);
        }

        if (requestDto.isSendEmail()) {
            CompanyOwnerInfoProjection projection = jobPostingRepository.findCompanyOwnerInfo(jobPostingId);
            CompanyOwnerInfoDto dto = new CompanyOwnerInfoDto(
                    projection.getEmail(),
                    projection.getName(),
                    projection.getBaseUserId(),
                    projection.getCompanyId()
            );

            emailService.sendBulkEmailWithCompanyInfo(
                    Arrays.asList(requestDto.getEmailList()),
                    requestDto.getEmailContent(),
                    "SCOUT",
                    dto
            );
        }
    }


    //공고에 지원하지 않은 사람 가져오기
    public ApplicationResponseDto getScoutList(Long jobPostingId,
                                               int page,
                                               int pageSize,
                                               String scoutFilter,
                                               String mbtiFilters,
                                               int mbtiCount,
                                               String techStackFilter) {

        Optional<JobPosting> jobPosting = jobPostingRepository.findById(jobPostingId);

        String raw = jobPosting.get().getPreferredDeveloperTypes();
        mbtiFilters = mbtiCount == 0 ? "" : raw.replaceAll("[\\[\\]\"]", "");

        List<ApplicationDto> scoutList = applicationRepository.findUnappliedUsersByJobPostingId(jobPostingId,
                page,
                pageSize,
                scoutFilter,
                mbtiFilters,
                mbtiCount,
                techStackFilter);
        int totalCount = applicationRepository.countScoutListByJobPostingId(jobPostingId, scoutFilter, mbtiFilters, mbtiCount, techStackFilter);
        int totalPage = (int) Math.ceil((double) totalCount / pageSize);

        return ApplicationResponseDto.builder()
                .result(scoutList)
                .currentPage(page)
                .totalPage(Math.max(totalPage, 1))
                .totalCount(totalCount)
                .build();
    }
}