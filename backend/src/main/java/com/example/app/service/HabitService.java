package com.example.app.service;

import com.example.app.model.dto.HabitDTO;
import com.example.app.model.entity.Habit;
import com.example.app.model.entity.User;
import com.example.app.model.entity.UserHabit;
import com.example.app.repo.HabitRepository;
import com.example.app.repo.UserHabitRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserHabitRepository userHabitRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    @Transactional(readOnly = true)
    public List<HabitDTO> getAllHabits() {
        return habitRepository.findByIsActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HabitDTO toggleHabit(UUID userId, UUID habitId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        LocalDate today = LocalDate.now();
        UserHabit userHabit = userHabitRepository
                .findByUserIdAndHabitIdAndDate(userId, habitId, today)
                .orElse(null);

        boolean wasCompleted = userHabit != null && userHabit.getCompleted();
        boolean nowCompleted = !wasCompleted;

        if (userHabit == null) {
            userHabit = new UserHabit();
            userHabit.setUser(user);
            userHabit.setHabit(habit);
            userHabit.setActivityDate(today);
        }

        userHabit.setCompleted(nowCompleted);

        if (nowCompleted && !wasCompleted) {
            // Award points
            pointsService.addPoints(user, habit.getPoints(), "HABIT_COMPLETED");
            userHabit.setPointsAwarded(habit.getPoints());
        } else if (!nowCompleted && wasCompleted) {
            // Deduct points if unchecking
            pointsService.deductPoints(user, habit.getPoints());
            userHabit.setPointsAwarded(0);
        }

        userHabitRepository.save(userHabit);

        HabitDTO dto = toDTO(habit);
        dto.setCompleted(nowCompleted);
        return dto;
    }

    private HabitDTO toDTO(Habit habit) {
        return new HabitDTO(
                habit.getId(),
                habit.getName(),
                habit.getPoints(),
                habit.getDescription(),
                habit.getIconName(),
                false
        );
    }
}
