package com.example.demo.domain.user.service;

import com.example.demo.domain.user.dto.UserDetailDto;
import com.example.demo.domain.user.dto.UserRegisterRequestDto;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.userprofile.entity.UserProfile;
import com.example.demo.domain.userprofile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

    @Service
    @RequiredArgsConstructor
    @Slf4j
    @Transactional
    public class UserService {

    private final BaseUserRepository baseUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    
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

    }