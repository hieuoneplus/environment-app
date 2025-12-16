package com.example.app.repo;

import com.example.app.model.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RewardRepository extends JpaRepository<Reward, UUID> {
    List<Reward> findByIsActiveTrue();
    List<Reward> findByIsActiveTrueAndCategory(String category);
}
