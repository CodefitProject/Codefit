package com.example.demo.domain.application.service;

import com.example.demo.common.email.service.EmailService;
import com.example.demo.domain.application.dto.*;
import com.example.demo.domain.application.repository.ApplicationRepository;
import com.example.demo.domain.post.entity.JobApplication;
import com.example.demo.domain.post.repository.JobApplicationRepository;
import com.example.demo.domain.post.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final EmailService emailService;

    //공고 지원자 가져오기
    public ApplicationResponseDto getApplicationList(Long jobPostingId, int page, int pageSize, String applicationStatus) {
        List<ApplicationDto> applicants = applicationRepository.findApplicantsByJobPostingId(jobPostingId, page, pageSize, applicationStatus);
        int totalCount = applicationRepository.countApplicantsByJobPostingId(jobPostingId, applicationStatus);
        int totalPage = (int) Math.ceil((double) totalCount / pageSize);

        return ApplicationResponseDto.builder()
                .result(applicants)
                .currentPage(page)
                .totalPage(Math.max(totalPage, 1))
                .totalCount(totalCount)
                .build();
    }


    //이력서 합격, 불합격 수정
    @Transactional
    public void modifyStatus(Long jobPostingId, JobApplicationsRequestDto request) {
        jobApplicationRepository.updateApplicationStatus(request.getApplicationIds(), request.getApplicationStatus());

        if (request.isSendEmail()) {
            List<JobApplication> applications = jobApplicationRepository.findAllById(request.getApplicationIds());
            List<String> emails = applications.stream()
                    .map(app -> app.getUser().getEmail())
                    .filter(Objects::nonNull)
                    .toList();

            CompanyOwnerInfoProjection projection = jobPostingRepository.findCompanyOwnerInfo(jobPostingId);
            CompanyOwnerInfoDto dto = new CompanyOwnerInfoDto(
                    projection.getEmail(),
                    projection.getName(),
                    projection.getBaseUserId(),
                    projection.getCompanyId()
            );

            emailService.sendBulkEmailWithCompanyInfo(
                    emails,
                    request.getEmailContent(),
                    request.getApplicationStatus(),
                    dto
            );
        }
    }




}