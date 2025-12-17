package com.example.app.repo;

import com.example.app.model.entity.UserHabit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserHabitRepository extends JpaRepository<UserHabit, UUID> {
    
    @Query("SELECT uh FROM UserHabit uh WHERE uh.user.id = :userId AND uh.activityDate = :date")
    List<UserHabit> findByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
    
    @Query("SELECT uh FROM UserHabit uh WHERE uh.user.id = :userId AND uh.habit.id = :habitId AND uh.activityDate = :date")
    Optional<UserHabit> findByUserIdAndHabitIdAndDate(@Param("userId") UUID userId, @Param("habitId") UUID habitId, @Param("date") LocalDate date);
    
    @Query("SELECT DISTINCT uh.habit.id FROM UserHabit uh WHERE uh.user.id = :userId")
    List<UUID> findSubscribedHabitIdsByUserId(@Param("userId") UUID userId);
}
