package com.example.demo.common.security.handler;

import com.example.demo.common.security.dto.LoginResponse;
import com.example.demo.common.security.service.RedisService;
import com.example.demo.common.security.util.JwtUtil;
import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.company.entity.Company;
import com.example.demo.domain.company.repository.CompanyRepository;
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
    private final ObjectMapper objectMapper;
    private final CompanyRepository companyRepository;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                      Authentication authentication) throws IOException, ServletException {
        
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        BaseUser baseUser = customUserDetails.baseUser();
        String email = baseUser.getEmail();
        String role = baseUser.getUserRole().name();
        long baseUserId = baseUser.getBaseUserId();
        String name = baseUser.getName();
        log.info("로그인 성공 - 사용자: {}, 역할: {}", email, role);
        
        // COMPANY 역할인 경우 companyId 가져오기
        Long companyId = null;
        if ("COMPANY".equals(role)) {
            try {
                Company company = companyRepository.findByBaseUserBaseUserId(Long.valueOf(baseUserId))
                    .orElse(null);
                if (company != null) {
                    companyId = company.getCompanyId();
                    log.info("기업 사용자 - companyId: {}", companyId);
                }
            } catch (Exception e) {
                log.warn("companyId 가져오기 실패: {}", e.getMessage());
            }
        }
        
        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(email, role, baseUserId, name, companyId);
        String refreshToken = jwtUtil.generateRefreshToken(email);
        
        // Refresh Token을 Redis에 저장
        redisService.saveRefreshToken(email, refreshToken, 604800000L); // 7일
        
        // 응답 헤더에 토큰 추가
        response.setHeader("Authorization", "Bearer " + accessToken);
        response.setHeader("X-Refresh-Token", refreshToken);

        // JSON 응답
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .username(email)
                .role(role)
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(loginResponse));
        
        log.debug("로그인 응답 전송 완료 - 사용자: {}", name);
    }
}
