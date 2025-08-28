package com.example.demo.domain.company.service;

import com.example.demo.common.service.S3Service;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.enums.UserRole;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.company.dto.CompanyInfoDto;
import com.example.demo.domain.company.dto.CompanyListResponseDto;
import com.example.demo.domain.company.dto.CreateCompanyDto;
import com.example.demo.domain.company.entity.Company;
import com.example.demo.domain.company.enums.CompanyStatus;
import com.example.demo.domain.company.repository.CompanyRepository;
import com.example.demo.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final BaseUserRepository baseUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    public ResponseEntity<String> createCompany(CreateCompanyDto dto) {
        // 중복 검사
        if (companyRepository.existsByBaseUserEmail(dto.email())) {
            throw new BusinessException("이미 등록된 이메일입니다.");
        }
        
        if (companyRepository.existsByBusinessNumber(dto.businessNumber())) {
            throw new BusinessException("이미 등록된 사업자등록번호입니다.");
        }

        // S3에 파일 업로드
        String businessCertificatePath = null;
        String logoPath = null;
        
        try {
            // 사업자등록증 업로드 (필수)
            if (dto.businessCertificate() != null && !dto.businessCertificate().isEmpty()) {
                businessCertificatePath = s3Service.uploadFile(dto.businessCertificate(), "business_certificates");
                log.info("사업자등록증 업로드 성공: {}", businessCertificatePath);
            } else {
                throw new BusinessException("사업자등록증은 필수입니다.");
            }
            
            // 로고 업로드 (선택적)
            if (dto.logo() != null && !dto.logo().isEmpty()) {
                logoPath = s3Service.uploadFile(dto.logo(), "company_logos");
                log.info("회사 로고 업로드 성공: {}", logoPath);
            }
            
        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생: {}", e.getMessage(), e);
            
            // 업로드된 파일이 있다면 삭제 (롤백)
            if (businessCertificatePath != null) {
                try {
                    String fileKey = s3Service.extractFileKeyFromUrl(businessCertificatePath);
                    s3Service.deleteFile(fileKey);
                } catch (Exception deleteException) {
                    log.error("파일 삭제 실패: {}", deleteException.getMessage());
                }
            }
            
            if (logoPath != null) {
                try {
                    String fileKey = s3Service.extractFileKeyFromUrl(logoPath);
                    s3Service.deleteFile(fileKey);
                } catch (Exception deleteException) {
                    log.error("파일 삭제 실패: {}", deleteException.getMessage());
                }
            }
            
            throw new BusinessException("파일 업로드에 실패했습니다: " + e.getMessage());
        }

        // BaseUser 생성 및 저장
        BaseUser baseUser = BaseUser.builder()
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password())) // 비밀번호 암호화
                .name(dto.name())
                .userRole(UserRole.COMPANY) // 일반/기업 구분
                .build();

        baseUserRepository.save(baseUser); //BaseUser 저장

        // Entity 생성 및 저장
        Company company = Company.builder()
                .baseUser(baseUser)
                .businessNumber(dto.businessNumber())
                .industry(dto.industry())
                .empCount(dto.empCount())
                .description(dto.description())
                .businessCertificatePath(businessCertificatePath)
                .logoPath(logoPath)
                .build();

        Company savedCompany = companyRepository.save(company);
        return new ResponseEntity<>("회사 등록이 성공적으로 완료되었습니다. (ID: " + savedCompany.getCompanyId() + ")", org.springframework.http.HttpStatus.OK);
    }

    /**
     * 회사 삭제 시 S3에서 파일도 함께 삭제
     */
    @Transactional
    public void deleteCompanyWithFiles(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException("회사를 찾을 수 없습니다."));
        
        // S3에서 파일 삭제
        try {
            if (company.getBusinessCertificatePath() != null) {
                String fileKey = s3Service.extractFileKeyFromUrl(company.getBusinessCertificatePath());
                s3Service.deleteFile(fileKey);
            }
            
            if (company.getLogoPath() != null) {
                String fileKey = s3Service.extractFileKeyFromUrl(company.getLogoPath());
                s3Service.deleteFile(fileKey);
            }
        } catch (Exception e) {
            log.error("파일 삭제 실패: {}", e.getMessage());
            // 파일 삭제 실패는 데이터베이스 삭제를 막지 않음
        }
        
        // 데이터베이스에서 삭제
        companyRepository.delete(company);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return companyRepository.existsByBaseUserEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByBusinessNumber(String businessNumber) {
        return companyRepository.existsByBusinessNumber(businessNumber);
    }

    @Transactional(readOnly = true)
    public CompanyListResponseDto getCompaniesForMainPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Company> companies = companyRepository.findAllByStatusOrderByCreatedAtDesc(CompanyStatus.ACTIVE, pageable);
        
        // 전체 활성 회사 수 조회
        Long totalCount = companyRepository.countByStatus(CompanyStatus.ACTIVE);
        
        List<CompanyInfoDto> companyInfoList = companies.stream()
                .map(CompanyInfoDto::from)
                .toList();
        
        return CompanyListResponseDto.builder()
                .totalCount(totalCount)
                .companies(companyInfoList)
                .build();
    }
}
