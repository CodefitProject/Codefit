package com.example.demo.domain.user.controller;

import com.example.demo.common.security.dto.RegisterRequest;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.enums.UserRole;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.user.dto.UserDetailDto;
import com.example.demo.domain.user.dto.UserUpdateRequest;
import com.example.demo.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final BaseUserRepository baseUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // 유저 상세정보 가져오기
    @GetMapping("/api/user/detail/{userId}")
    public ResponseEntity<UserDetailDto> getUserDetail(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(userService.getUserDetail(userId));
    }

    // 사용자 정보 조회 (수정용)
    @GetMapping("/api/users/{baseUserId}")
    public ResponseEntity<?> getUserForUpdate(@PathVariable("baseUserId") Long baseUserId) {
        return ResponseEntity.ok(userService.getUserForUpdate(baseUserId));
    }

    // 전체 기술스택 목록 조회
    @GetMapping("/api/techstacks")
    public ResponseEntity<?> getTechStacks() {
        return ResponseEntity.ok(userService.getTechStacks());
    }

    // 사용자 정보 수정 (개인정보 + 이력서)
    @PatchMapping("/api/users/{baseUserId}")
    public ResponseEntity<?> updateUserInfo(
            @PathVariable("baseUserId") Long baseUserId,
            UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserInfo(baseUserId, request));
    }

    /**
     * 사용자 등록
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        log.debug("사용자 등록 요청: {}", request.getEmail());

        // 중복 사용자 확인
        if (baseUserRepository.existsByEmail(request.getEmail())) {
            log.error("이미 존재하는 사용자: {}", request.getEmail());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("이미 존재하는 사용자입니다."));
        }

        // 사용자 생성
        BaseUser user = BaseUser.builder()
                .name(request.getUsername()) // request.username is intended for user's name
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.USER)
                .build();

        baseUserRepository.save(user);

        log.info("사용자 등록 성공: {}", request.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "사용자 등록이 완료되었습니다.");
        response.put("username", user.getEmail()); // user.getUsername() returns email
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}
