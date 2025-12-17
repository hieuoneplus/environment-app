package com.example.app.controller;

import com.example.app.model.dto.RewardDTO;
import com.example.app.model.dto.UserRewardDTO;
import com.example.app.model.entity.UserReward;
import com.example.app.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    public ResponseEntity<List<RewardDTO>> getAllRewards(@RequestParam("userId") String userId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(rewardService.getAllRewards(userIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<RewardDTO>> getRewardsByCategory(
            @RequestParam("userId") String userId,
            @PathVariable("category") String category) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(rewardService.getRewardsByCategory(userIdUUID, category));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }

    @PostMapping("/{rewardId}/exchange")
    public ResponseEntity<UserReward> exchangeReward(
            @RequestParam("userId") String userId,
            @PathVariable("rewardId") String rewardId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            UUID rewardIdUUID = UUID.fromString(rewardId);
            return ResponseEntity.ok(rewardService.exchangeReward(userIdUUID, rewardIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format: " + e.getMessage());
        }
    }

    @GetMapping("/my-rewards")
    public ResponseEntity<List<UserRewardDTO>> getUserRewards(@RequestParam("userId") String userId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(rewardService.getUserRewards(userIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }
}
