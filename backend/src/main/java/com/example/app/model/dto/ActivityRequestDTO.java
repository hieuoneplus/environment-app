package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequestDTO {
    private String activityType; // 'SCAN', 'HABIT', 'LOCATION_CHECKIN'
    private String detectedObject; // For scans: 'water', 'trash', 'bus'
    private String imageUrl; // Base64 or URL
    private UUID habitId; // For habit completion
    private UUID locationId; // For location checkin
}
