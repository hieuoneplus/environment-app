package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationDTO {
    private UUID id;
    private String name;
    private String type; // 'RECYCLE_STATION', 'BATTERY_COLLECTION', 'GREEN_STORE'
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer pointsAvailable;
    private String description;
    private String address;
}
