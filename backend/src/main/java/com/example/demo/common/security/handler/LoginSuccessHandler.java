package com.example.demo.common.security.handler;

import com.example.demo.common.security.dto.LoginResponse;
import com.example.demo.common.security.service.RedisService;
import com.example.demo.common.security.util.JwtUtil;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.common.security.service.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginSuccessHandler implements AuthenticationSuccessHandler {
    
    private final JwtUtil jwtUtil;
    private final RedisService redisService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                      Authentication authentication) throws IOException, ServletException {
        
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        BaseUser baseUser = customUserDetails.getBaseUser();
        String username = baseUser.getEmail();
        String role = baseUser.getUserRole().name();
        
        log.info("로그인 성공 - 사용자: {}, 역할: {}", username, role);
        
        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(username, role);
        String refreshToken = jwtUtil.generateRefreshToken(username);
        
        // Refresh Token을 Redis에 저장
        redisService.saveRefreshToken(username, refreshToken, 604800000L); // 7일
        
        // 응답 헤더에 토큰 추가
        response.setHeader("Authorization", "Bearer " + accessToken);
        
        // JSON 응답 (토큰 정보는 헤더로 전송)
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("{\"message\": \"로그인 성공\"}"); // Simple success message
        
        log.debug("로그인 응답 전송 완료 - 사용자: {}", username);
    }
}
