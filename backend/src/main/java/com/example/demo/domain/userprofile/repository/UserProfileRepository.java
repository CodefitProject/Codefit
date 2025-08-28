package com.example.demo.domain.userprofile.repository;

import com.example.demo.domain.userprofile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByBaseUser_BaseUserId(Long baseUserId);
}


