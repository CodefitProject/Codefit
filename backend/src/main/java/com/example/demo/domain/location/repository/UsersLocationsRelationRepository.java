package com.example.demo.domain.location.repository;

import com.example.demo.domain.location.entity.UsersLocationsRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersLocationsRelationRepository extends JpaRepository<UsersLocationsRelation, Long> {
}


