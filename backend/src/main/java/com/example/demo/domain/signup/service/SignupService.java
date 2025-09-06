package com.example.demo.domain.signup.service;

import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.baseuser.enums.UserRole;
import com.example.demo.domain.baseuser.repository.BaseUserRepository;
import com.example.demo.domain.location.entity.Location;
import com.example.demo.domain.location.entity.UsersLocationsRelation;
import com.example.demo.domain.location.repository.LocationRepository;
import com.example.demo.domain.location.repository.UsersLocationsRelationRepository;
import com.example.demo.domain.userprofile.entity.UserProfile;
import com.example.demo.domain.userprofile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class SignupService {

    private final BaseUserRepository baseUserRepository;
    private final UserProfileRepository userProfileRepository;
    private final LocationRepository locationRepository;
    private final UsersLocationsRelationRepository ulrRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public boolean existsEmail(String email) {
        return baseUserRepository.findByEmail(email).isPresent();
    }

    @Transactional
    public Long registerUser(String name, String birthDate, String gender, String phoneNumber,
                             String email, String rawPassword, boolean emailConsent) {

        if (baseUserRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일");
        }
        BaseUser user = BaseUser.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .name(name)
                .userRole(UserRole.USER)
                .build();
        BaseUser saved = baseUserRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .baseUser(saved)
                .gender(gender)
                .mobile(phoneNumber)
                .isProfileComplete(false)
                .build();
        userProfileRepository.save(profile);

        return saved.getBaseUserId();
    }

    @Transactional
    public void updatePreferredLocations(Long baseUserId, String locationsCsv) {
        if (locationsCsv == null || locationsCsv.isBlank()) return;
        Arrays.stream(locationsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(name -> {
                    Location loc = locationRepository.findByLocationName(name)
                            .orElseGet(() -> locationRepository.save(
                                    Location.builder().locationName(name).build()));
                    UsersLocationsRelation rel = UsersLocationsRelation.builder()
                            .baseUser(BaseUser.builder().baseUserId(baseUserId).build())
                            .location(loc)
                            .build();
                    ulrRepository.save(rel);
                });
    }

    @Transactional
    public void updateSalary(Long baseUserId, String salaryRange) {
        userProfileRepository.findByBaseUser_BaseUserId(baseUserId).ifPresent(p -> {
            p.setYearSalary(salaryRange);
            userProfileRepository.save(p);
        });
    }

    @Transactional
    public void updateCareer(Long baseUserId, String career, String bio) {
        userProfileRepository.findByBaseUser_BaseUserId(baseUserId).ifPresent(p -> {
            p.setCareer(career);
            if (bio != null && !bio.isBlank()) p.setBio(bio);
            userProfileRepository.save(p);
        });
    }

    @Transactional
    public void updateAdditional(Long baseUserId, String bio, String profileImageName) {
        userProfileRepository.findByBaseUser_BaseUserId(baseUserId).ifPresent(p -> {
            if (bio != null) p.setBio(bio);
            if (profileImageName != null) p.setProfileImagePath(profileImageName);
            userProfileRepository.save(p);
        });
    }
}