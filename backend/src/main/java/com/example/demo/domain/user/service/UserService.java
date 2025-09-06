package com.example.demo.domain.user.service;

import com.example.demo.domain.user.dto.UserDetailDto;
import com.example.demo.domain.user.dto.UserRegisterRequestDto;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    }