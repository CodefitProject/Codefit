package com.example.demo.domain.codeanalysis.repository;

import com.example.demo.domain.codeanalysis.entity.UsersMbtiTypes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersMbtiTypesRepository extends JpaRepository<UsersMbtiTypes, Long> {
    Optional<UsersMbtiTypes> findByBaseUser_BaseUserId(Long baseUserId);
}