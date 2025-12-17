package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "locations")
@Data
public class Location {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "points_available", nullable = false)
    private Integer pointsAvailable = 50;

    @Column(length = 500)
    private String description;

    @Column(name = "address")
    private String address;

    @Column(name = "location_type", length = 50)
    private String locationType; // 'RECYCLE_STATION', 'BATTERY_COLLECTION', 'GREEN_STORE'

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
