package com.example.app.service;

import com.example.app.model.dto.ActivityRequestDTO;
import com.example.app.model.dto.ActivityResponseDTO;
import com.example.app.model.entity.Activity;
import com.example.app.model.entity.User;
import com.example.app.repo.ActivityRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final PointsService pointsService;
    private final AIImageRecognitionService aiService;

    @Transactional
    public ActivityResponseDTO recordActivity(UUID userId, ActivityRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If image provided but no detected object, use AI to detect
        String detectedObject = request.getDetectedObject();
        if (request.getImageUrl() != null && (detectedObject == null || detectedObject.isEmpty())) {
            log.info("No detected object provided, using AI detection");
            String aiDetected = aiService.detectObject(request.getImageUrl());
            if (aiDetected != null) {
                detectedObject = aiService.normalizeDetectedObject(aiDetected);
                log.info("AI detected: {}", detectedObject);
            }
        }

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setActivityType(request.getActivityType());
        activity.setDetectedObject(detectedObject);
        // Truncate imageUrl if too long (for base64, consider uploading to storage instead)
        String imageUrl = request.getImageUrl();
        if (imageUrl != null && imageUrl.length() > 10000) {
            log.warn("Image URL very long ({} chars), consider uploading to storage", imageUrl.length());
            // For now, keep it but log warning
        }
        activity.setImageUrl(imageUrl);
        activity.setDescription(buildDescription(request, detectedObject));

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

    private String buildDescription(ActivityRequestDTO request, String detectedObject) {
        switch (request.getActivityType()) {
            case "SCAN":
                String objectName = detectedObject != null ? detectedObject : "đối tượng";
                return String.format("Đã quét và xác nhận: %s", objectName);
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
