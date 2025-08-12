package com.example.demo.domain.company.service;

import com.example.demo.domain.company.dto.CreateCompanyDto;
import com.example.demo.domain.company.entity.Company;
import com.example.demo.domain.company.repository.CompanyRepository;
import com.example.demo.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public ResponseEntity<String> createCompany(CreateCompanyDto dto) {
        // 중복 검사
        if (companyRepository.existsByEmail(dto.email())) {
            throw new BusinessException("이미 등록된 이메일입니다.");
        }
        
        if (companyRepository.existsByBusinessNumber(dto.businessNumber())) {
            throw new BusinessException("이미 등록된 사업자등록번호입니다.");
        }

        // 파일 저장
        String businessCertificatePath = saveFile(dto.businessCertificate(), "business_certificates");
        String logoPath = dto.logo() != null ? saveFile(dto.logo(), "logos") : null;

        // Entity 생성 및 저장
        Company company = Company.builder()
                .email(dto.email())
                .password(dto.password()) // TODO: 암호화 처리 필요
                .name(dto.name())
                .businessNumber(dto.businessNumber())
                .industry(dto.industry())
                .empCount(dto.empCount())
                .description(dto.description())
                .businessCertificatePath(businessCertificatePath)
                .logoPath(logoPath)
                .build();

        Company savedCompany = companyRepository.save(company);
        return new ResponseEntity<>("회사 등록이 성공적으로 완료되었습니다. (ID: " + savedCompany.getId() + ")", org.springframework.http.HttpStatus.OK);
    }

    private String saveFile(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir, directory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 파일명 생성 (UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                    : "";
            String fileName = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return directory + "/" + fileName;
        } catch (IOException e) {
            throw new BusinessException("파일 저장 중 오류가 발생했습니다.");
        }
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return companyRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByBusinessNumber(String businessNumber) {
        return companyRepository.existsByBusinessNumber(businessNumber);
    }
}
