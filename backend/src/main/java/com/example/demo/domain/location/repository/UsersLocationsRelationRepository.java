package com.example.demo.domain.location.repository;

import com.example.demo.domain.baseuser.entity.BaseUser;
import com.example.demo.domain.location.entity.UsersLocationsRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsersLocationsRelationRepository extends JpaRepository<UsersLocationsRelation, Long> {
    List<UsersLocationsRelation> findAllByBaseUser_BaseUserId(Long baseUserId);
    void deleteByBaseUser(BaseUser baseUser);
}


