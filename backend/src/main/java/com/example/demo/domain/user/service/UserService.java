package com.example.demo.domain.user.service;

import com.example.demo.domain.user.dto.UserDetailDto;
import com.example.demo.domain.user.dto.UserRegisterRequestDto;
import com.example.demo.domain.user.dto.UserUpdateRequest;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.userprofile.entity.UserProfile;
import com.example.demo.domain.userprofile.repository.UserProfileRepository;
import com.example.demo.domain.post.entity.TechStack;
import com.example.demo.domain.post.repository.TechStackRepository;
import com.example.demo.domain.baseuser.entity.BaseUserTechStack;
import com.example.demo.domain.baseuser.repository.BaseUserTechStackRepository;
import com.example.demo.domain.location.entity.Location;
import com.example.demo.domain.location.entity.UsersLocationsRelation;
import com.example.demo.domain.location.repository.UsersLocationsRelationRepository;
import com.example.demo.domain.location.repository.LocationRepository;
import com.example.demo.common.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    @Slf4j
    @Transactional
    public class UserService {

    private final BaseUserRepository baseUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    private final TechStackRepository techStackRepository;
    private final BaseUserTechStackRepository baseUserTechStackRepository;
    private final UsersLocationsRelationRepository usersLocationsRelationRepository;
    private final LocationRepository locationRepository;
    private final S3Service s3Service;
    
    public Map<String, Object> registerUser(UserRegisterRequestDto request) {
        
        // 중복 사용자 확인
        if (baseUserRepository.findByEmail(request.email()).isPresent()) {
            return createErrorResponse("이미 존재하는 사용자입니다.");
        }
        
        // 사용자 생성
        BaseUser user = BaseUser.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .userRole(com.example.demo.domain.baseuser.enums.UserRole.USER)
                .build();
        
        baseUserRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }


     @Transactional(readOnly = true)
        public UserDetailDto getUserDetail(Long userId) {
            BaseUser baseUser = baseUserRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            UserProfile userProfile = userProfileRepository.findByBaseUser_BaseUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            int isMbtiChecked = 0;
            int isCodeChecked = 0;
            String mbtiType = null;
            String preferredLocations = "";

            return UserDetailDto.builder()
                    .accountId(baseUser.getBaseUserId())
                    .name(baseUser.getName())
                    .email(baseUser.getEmail())
                    .career(userProfile.getCareer())
                    .currentPosition(userProfile.getCurrentPosition())
                    .yearSalary(userProfile.getYearSalary())
                    .bio(userProfile.getBio())
                    .isMbtiChecked(isMbtiChecked)
                    .isCodeChecked(isCodeChecked)
                    .mbtiType(mbtiType)
                    .preferredLocations(preferredLocations)
                    .build();
        }

    /**
     * 사용자 정보 조회 (수정용)
     * 프론트엔드에서 수정 페이지 진입 시 기존 값을 바인딩하기 위해 사용
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserForUpdate(Long baseUserId) {
        BaseUser baseUser = baseUserRepository.findById(baseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + baseUserId));

        UserProfile userProfile = userProfileRepository.findByBaseUser_BaseUserId(baseUserId)
                .orElse(null);

        // 사용자의 기술스택 조회
        List<BaseUserTechStack> userTechStacks = baseUserTechStackRepository.findByBaseUserBaseUserId(baseUserId);
        String techStack = userTechStacks.stream()
                .map(uts -> String.valueOf(uts.getTechStack().getTechStackId()))
                .collect(Collectors.joining(","));

        // 사용자의 선호 지역 조회
        List<UsersLocationsRelation> userLocations = usersLocationsRelationRepository.findAllByBaseUser_BaseUserId(baseUserId);
        String preferredLocations = userLocations.stream()
                .map(ul -> ul.getLocation().getLocationName())
                .collect(Collectors.joining(","));

        Map<String, Object> result = new HashMap<>();
        result.put("baseUserId", baseUser.getBaseUserId());
        result.put("email", baseUser.getEmail());
        result.put("name", baseUser.getName());
        
        if (userProfile != null) {
            result.put("career", userProfile.getCareer());
            result.put("currentPosition", userProfile.getCurrentPosition());
            result.put("yearSalary", userProfile.getYearSalary());
            result.put("bio", userProfile.getBio());
            result.put("resume_file_name", userProfile.getResumeFileName());
        } else {
            result.put("career", "");
            result.put("currentPosition", "");
            result.put("yearSalary", "");
            result.put("bio", "");
            result.put("resume_file_name", "");
        }
        
        // UsersLocationsRelation에서 조회한 선호 지역 사용
        result.put("preferredLocations", preferredLocations);
        
        result.put("techStack", techStack);
        result.put("testChecked", false); // 필요에 따라 구현
        
        return result;
    }

    /**
     * 기술스택 목록 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTechStacks() {
        List<TechStack> techStacks = techStackRepository.findAll();
        
        List<Map<String, Object>> techStackVoList = techStacks.stream()
                .map(ts -> {
                    Map<String, Object> techStackVo = new HashMap<>();
                    techStackVo.put("techStackId", String.valueOf(ts.getTechStackId()));
                    techStackVo.put("techStackName", ts.getTechStackName());
                    return techStackVo;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("techStackVoList", techStackVoList);
        
        return result;
    }

    /**
     * 사용자 정보 수정 (개인정보 + 이력서)
     */
    @Transactional
    public Map<String, Object> updateUserInfo(Long baseUserId, UserUpdateRequest request) {
        try {
            // 1. BaseUser 조회
            BaseUser baseUser = baseUserRepository.findById(baseUserId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + baseUserId));

            // 2. UserProfile 조회 또는 생성
            UserProfile userProfile = userProfileRepository.findByBaseUser_BaseUserId(baseUserId)
                    .orElse(UserProfile.builder()
                            .baseUser(baseUser)
                            .isProfileComplete(false)
                            .build());

            // 3. BaseUser 정보 업데이트
            baseUser.updateName(request.name());

            // 4. UserProfile 정보 업데이트
            userProfile.updateProfile(
                    request.career(),
                    request.currentPosition(),
                    request.yearSalary(),
                    request.bio()
            );

            // 5. 이력서 파일 처리 (S3 업로드)
            if (request.resumeFile() != null && !request.resumeFile().isEmpty()) {
                String resumeFileName = uploadResumeToS3(request.resumeFile(), baseUserId);
                userProfile.updateResumeFileName(resumeFileName);
            }

            // 6. 선호 지역 업데이트
            updateUserLocations(baseUser, request.preferredLocations());

            // 7. 기술 스택 업데이트
            updateUserTechStacks(baseUser, request.techStack());

            // 8. 저장
            baseUserRepository.save(baseUser);
            userProfileRepository.save(userProfile);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "사용자 정보가 성공적으로 수정되었습니다.");
            return result;

        } catch (Exception e) {
            log.error("사용자 정보 수정 실패: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "사용자 정보 수정에 실패했습니다: " + e.getMessage());
            return result;
        }
    }

    /**
     * S3에 이력서 파일 업로드
     */
    private String uploadResumeToS3(MultipartFile file, Long userId) {
        try {
            // 파일 검증
            if (!file.getContentType().equals("application/pdf")) {
                throw new RuntimeException("PDF 파일만 업로드 가능합니다.");
            }

            // S3 폴더 경로 설정
            String folderPath = "resumes/user_" + userId;
            
            // S3Service를 사용하여 파일 업로드
            String fileUrl = s3Service.uploadFile(file, folderPath);
            
            log.info("이력서 파일 업로드 완료 - 사용자: {}, URL: {}", userId, fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("S3 업로드 실패 - 사용자: {}, 오류: {}", userId, e.getMessage(), e);
            throw new RuntimeException("이력서 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 사용자 선호 지역 업데이트
     */
    private void updateUserLocations(BaseUser baseUser, String preferredLocations) {
        // 기존 지역 관계 삭제
        usersLocationsRelationRepository.deleteByBaseUser(baseUser);

        if (preferredLocations != null && !preferredLocations.trim().isEmpty()) {
            String[] locationNames = preferredLocations.split(",");
            
            for (String locationName : locationNames) {
                String trimmedName = locationName.trim();
                if (!trimmedName.isEmpty()) {
                    Location location = locationRepository.findByLocationName(trimmedName)
                            .orElseThrow(() -> new RuntimeException("지역을 찾을 수 없습니다: " + trimmedName));
                    
                    UsersLocationsRelation relation = UsersLocationsRelation.builder()
                            .baseUser(baseUser)
                            .location(location)
                            .build();
                    
                    usersLocationsRelationRepository.save(relation);
                }
            }
        }
    }

    /**
     * 사용자 기술 스택 업데이트
     */
    private void updateUserTechStacks(BaseUser baseUser, String techStack) {
        // 기존 기술스택 관계 삭제
        baseUserTechStackRepository.deleteByBaseUserId(baseUser.getBaseUserId());

        if (techStack != null && !techStack.trim().isEmpty()) {
            String[] techStackIds = techStack.split(",");
            
            for (String techStackId : techStackIds) {
                String trimmedId = techStackId.trim();
                if (!trimmedId.isEmpty()) {
                    TechStack tech = techStackRepository.findById(Long.valueOf(trimmedId))
                            .orElseThrow(() -> new RuntimeException("기술스택을 찾을 수 없습니다: " + trimmedId));
                    
                    BaseUserTechStack relation = BaseUserTechStack.builder()
                            .baseUser(baseUser)
                            .techStack(tech)
                            .build();
                    
                    baseUserTechStackRepository.save(relation);
                }
            }
        }
    }

    }