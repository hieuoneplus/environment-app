package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private UUID id;
    private String name;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer pointsAvailable;
    private String description;
    private String address;
    private String distance; // Formatted distance like "500m"
}
