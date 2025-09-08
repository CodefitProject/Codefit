package com.example.demo.domain.scout.repository;

import com.example.demo.domain.scout.entity.ScoutRequests;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScoutRequestsRepository extends JpaRepository<ScoutRequests, Integer> {
}
