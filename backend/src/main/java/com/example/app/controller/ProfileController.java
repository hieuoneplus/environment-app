package com.example.app.controller;

import com.example.app.model.dto.UserProfileDTO;
import com.example.app.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(@RequestParam("userId") String userId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(profileService.getProfile(userIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(
            @RequestParam("userId") String userId,
            @RequestBody UserProfileDTO profileDTO) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(profileService.updateProfile(userIdUUID, profileDTO));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }
}
