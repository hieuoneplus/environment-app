package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardDTO {
    private UUID id;
    private String name;
    private Integer points;
    private String category;
    private String imageUrl;
    private String imageEmoji;
    private String description;
    private Boolean canAfford;
}
