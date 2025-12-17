package com.example.app.repo;

import com.example.app.model.entity.MoveTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MoveTrackingRepository extends JpaRepository<MoveTracking, UUID> {
    Optional<MoveTracking> findByUserIdAndIsActiveTrue(UUID userId);
}
