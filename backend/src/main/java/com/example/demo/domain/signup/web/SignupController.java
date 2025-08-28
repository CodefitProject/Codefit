package com.example.demo.domain.signup.web;

import com.example.demo.domain.signup.service.SignupService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/codefit/signup")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    @GetMapping("/check-email")
    public Map<String, Object> checkEmail(@RequestParam String email) {
        boolean exists = signupService.existsEmail(email);
        Map<String, Object> res = new HashMap<>();
        res.put("role", exists ? "DUPLICATE" : "AVAILABLE");
        return res;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterPayload payload) {
        Long baseUserId = signupService.registerUser(
                payload.name, payload.birthDate, payload.gender, payload.phoneNumber,
                payload.email, payload.password, "1".equals(payload.emailConsent)
        );
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("baseUserId", baseUserId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody LocationPayload payload) {
        signupService.updatePreferredLocations(payload.baseUserId, payload.locationsCsv);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/salary")
    public ResponseEntity<?> updateSalary(@RequestBody SalaryPayload payload) {
        signupService.updateSalary(payload.baseUserId, payload.selectedSalary);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/career")
    public ResponseEntity<?> updateCareer(@RequestBody CareerPayload payload) {
        signupService.updateCareer(payload.baseUserId, payload.career, payload.bio);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/additional")
    public ResponseEntity<?> updateAdditional(@RequestBody AdditionalPayload payload) {
        signupService.updateAdditional(payload.baseUserId, payload.bio, payload.profileImageName);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @Data
    public static class RegisterPayload {
        public String name;
        public String birthDate;
        public String gender;
        public String phoneNumber;
        public String email;
        public String password;
        public String emailConsent; // '0' | '1'
    }

    @Data
    public static class LocationPayload {
        public Long baseUserId;
        public String locationsCsv;
    }

    @Data
    public static class SalaryPayload {
        public Long baseUserId;
        public String selectedSalary;
    }

    @Data
    public static class CareerPayload {
        public Long baseUserId;
        public String career;
        public String bio;
    }

    @Data
    public static class AdditionalPayload {
        public Long baseUserId;
        public String bio;
        public String profileImageName;
    }
}


