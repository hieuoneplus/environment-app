package com.example.app.repo;

import com.example.app.model.entity.UserReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserRewardRepository extends JpaRepository<UserReward, UUID> {
    
    @Query("SELECT ur FROM UserReward ur WHERE ur.user.id = :userId ORDER BY ur.createdAt DESC")
    List<UserReward> findByUserId(@Param("userId") UUID userId);
}
