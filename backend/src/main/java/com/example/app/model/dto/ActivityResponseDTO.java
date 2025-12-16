package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponseDTO {
    private UUID id;
    private String activityType;
    private String detectedObject;
    private Integer pointsEarned;
    private String description;
    private LocalDateTime createdAt;
    private Integer newTotalPoints;
}
