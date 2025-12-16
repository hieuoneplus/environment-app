package com.example.app.service;

import com.example.app.model.dto.UserProfileDTO;
import com.example.app.model.entity.User;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toDTO(user);
    }

    @Transactional
    public UserProfileDTO updateProfile(UUID userId, UserProfileDTO profileDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (profileDTO.getName() != null) {
            user.setName(profileDTO.getName());
        }
        if (profileDTO.getAddress() != null) {
            user.setAddress(profileDTO.getAddress());
        }
        if (profileDTO.getGender() != null) {
            user.setGender(profileDTO.getGender());
        }
        if (profileDTO.getDob() != null) {
            user.setDob(profileDTO.getDob());
        }
        if (profileDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(profileDTO.getAvatarUrl());
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    private UserProfileDTO toDTO(User user) {
        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAddress(),
                user.getGender(),
                user.getDob(),
                user.getGreenPoints(),
                user.getRank(),
                user.getStreak(),
                user.getAvatarUrl()
        );
    }
}
