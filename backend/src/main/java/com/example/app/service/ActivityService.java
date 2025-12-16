package com.example.app.service;

import com.example.app.model.dto.ActivityRequestDTO;
import com.example.app.model.dto.ActivityResponseDTO;
import com.example.app.model.entity.Activity;
import com.example.app.model.entity.User;
import com.example.app.repo.ActivityRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final PointsService pointsService;

    @Transactional
    public ActivityResponseDTO recordActivity(UUID userId, ActivityRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setActivityType(request.getActivityType());
        activity.setDetectedObject(request.getDetectedObject());
        activity.setImageUrl(request.getImageUrl());
        activity.setDescription(buildDescription(request));

        Integer pointsEarned = calculatePoints(request);
        activity.setPointsEarned(pointsEarned);

        // Award points
        pointsService.addPoints(user, pointsEarned, request.getActivityType());

        Activity saved = activityRepository.save(activity);

        ActivityResponseDTO response = new ActivityResponseDTO();
        response.setId(saved.getId());
        response.setActivityType(saved.getActivityType());
        response.setDetectedObject(saved.getDetectedObject());
        response.setPointsEarned(saved.getPointsEarned());
        response.setDescription(saved.getDescription());
        response.setCreatedAt(saved.getCreatedAt());
        response.setNewTotalPoints(user.getGreenPoints());

        return response;
    }

    private String buildDescription(ActivityRequestDTO request) {
        switch (request.getActivityType()) {
            case "SCAN":
                return String.format("Đã quét và xác nhận: %s", request.getDetectedObject());
            case "LOCATION_CHECKIN":
                return "Đã check-in tại địa điểm";
            default:
                return "Hoạt động mới";
        }
    }

    private Integer calculatePoints(ActivityRequestDTO request) {
        switch (request.getActivityType()) {
            case "SCAN":
                // Points based on detected object
                switch (request.getDetectedObject()) {
                    case "water":
                    case "Bình nước":
                        return 50;
                    case "trash":
                    case "Rác":
                        return 100;
                    case "bus":
                    case "Xe buýt":
                        return 75;
                    default:
                        return 50;
                }
            case "LOCATION_CHECKIN":
                return 50; // Default location points
            default:
                return 0;
        }
    }
}
