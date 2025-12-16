package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Data
public class Activity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", length = 50, nullable = false)
    private String activityType; // 'SCAN', 'HABIT', 'LOCATION_CHECKIN', 'REWARD_EXCHANGE'

    @Column(name = "detected_object")
    private String detectedObject; // For camera scans: 'water', 'trash', 'bus', etc.

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned = 0;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
