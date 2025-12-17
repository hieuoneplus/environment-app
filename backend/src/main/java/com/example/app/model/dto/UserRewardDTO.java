package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRewardDTO {
    private UUID id;
    private RewardDTO reward;
    private Integer pointsSpent;
    private String status; // PENDING, REDEEMED, EXPIRED
    private LocalDateTime redeemedAt;
    private LocalDateTime createdAt;
}
