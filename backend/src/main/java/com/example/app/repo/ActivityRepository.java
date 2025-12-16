package com.example.app.repo;

import com.example.app.model.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Activity> findByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId AND DATE(a.createdAt) = :date ORDER BY a.createdAt DESC")
    List<Activity> findByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
