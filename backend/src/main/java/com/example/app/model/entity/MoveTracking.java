package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "move_tracking")
@Data
public class MoveTracking {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "mode", length = 20, nullable = false)
    private String mode; // 'WALK', 'BIKE'

    @Column(name = "start_latitude", precision = 10, scale = 8)
    private BigDecimal startLatitude;

    @Column(name = "start_longitude", precision = 11, scale = 8)
    private BigDecimal startLongitude;

    @Column(name = "end_latitude", precision = 10, scale = 8)
    private BigDecimal endLatitude;

    @Column(name = "end_longitude", precision = 11, scale = 8)
    private BigDecimal endLongitude;

    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "points_earned")
    private Integer pointsEarned = 0;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
