package com.example.app.service;

import com.example.app.model.entity.Activity;
import com.example.app.model.entity.User;
import com.example.app.repo.ActivityRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PointsService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    @Transactional
    public void addPoints(User user, Integer points, String activityType) {
        if (points == null || points <= 0) {
            return;
        }

        user.setGreenPoints(user.getGreenPoints() + points);
        updateStreak(user);
        updateRank(user);
        userRepository.save(user);

        // Record activity
        Activity activity = new Activity();
        activity.setUser(user);
        activity.setActivityType(activityType);
        activity.setPointsEarned(points);
        activityRepository.save(activity);
    }

    @Transactional
    public void deductPoints(User user, Integer points) {
        if (points == null || points <= 0) {
            return;
        }

        int newPoints = Math.max(0, user.getGreenPoints() - points);
        user.setGreenPoints(newPoints);
        updateRank(user);
        userRepository.save(user);
    }

    private void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate();

        if (lastActivity == null) {
            user.setStreak(1);
        } else {
            LocalDate yesterday = today.minusDays(1);
            if (lastActivity.equals(yesterday) || lastActivity.equals(today)) {
                // Continue streak
                if (lastActivity.equals(yesterday)) {
                    user.setStreak(user.getStreak() + 1);
                }
            } else {
                // Reset streak
                user.setStreak(1);
            }
        }

        user.setLastActivityDate(today);
    }

    private void updateRank(User user) {
        int points = user.getGreenPoints();
        String rank;

        if (points < 100) {
            rank = "Mầm Non Tích Cực";
        } else if (points < 500) {
            rank = "Cây Con Xanh Tươi";
        } else if (points < 1000) {
            rank = "Cây Trưởng Thành";
        } else if (points < 2000) {
            rank = "Rừng Xanh Bảo Vệ";
        } else if (points < 5000) {
            rank = "Đại Sứ Môi Trường";
        } else {
            rank = "Huyền Thoại Xanh";
        }

        user.setRank(rank);
    }
}
