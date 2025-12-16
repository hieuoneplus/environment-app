package com.example.app.service;

import com.example.app.model.dto.RewardDTO;
import com.example.app.model.entity.Reward;
import com.example.app.model.entity.User;
import com.example.app.model.entity.UserReward;
import com.example.app.repo.RewardRepository;
import com.example.app.repo.UserRepository;
import com.example.app.repo.UserRewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRepository userRepository;
    private final UserRewardRepository userRewardRepository;
    private final PointsService pointsService;

    @Transactional(readOnly = true)
    public List<RewardDTO> getAllRewards(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return rewardRepository.findByIsActiveTrue().stream()
                .map(reward -> toDTO(reward, user.getGreenPoints()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RewardDTO> getRewardsByCategory(UUID userId, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Reward> rewards;
        if ("all".equals(category)) {
            rewards = rewardRepository.findByIsActiveTrue();
        } else {
            rewards = rewardRepository.findByIsActiveTrueAndCategory(category);
        }

        return rewards.stream()
                .map(reward -> toDTO(reward, user.getGreenPoints()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserReward exchangeReward(UUID userId, UUID rewardId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Reward not found"));

        if (!reward.getIsActive()) {
            throw new RuntimeException("Reward is not available");
        }

        if (user.getGreenPoints() < reward.getPoints()) {
            throw new RuntimeException("Insufficient points");
        }

        // Check stock if applicable
        if (reward.getStockQuantity() != null && reward.getStockQuantity() <= 0) {
            throw new RuntimeException("Reward is out of stock");
        }

        // Deduct points
        pointsService.deductPoints(user, reward.getPoints());

        // Create user reward record
        UserReward userReward = new UserReward();
        userReward.setUser(user);
        userReward.setReward(reward);
        userReward.setPointsSpent(reward.getPoints());
        userReward.setStatus("PENDING");

        // Update stock if applicable
        if (reward.getStockQuantity() != null) {
            reward.setStockQuantity(reward.getStockQuantity() - 1);
            rewardRepository.save(reward);
        }

        return userRewardRepository.save(userReward);
    }

    private RewardDTO toDTO(Reward reward, Integer userPoints) {
        return new RewardDTO(
                reward.getId(),
                reward.getName(),
                reward.getPoints(),
                reward.getCategory(),
                reward.getImageUrl(),
                reward.getImageEmoji(),
                reward.getDescription(),
                userPoints >= reward.getPoints()
        );
    }
}
