package com.example.app.controller;

import com.example.app.model.dto.ActivityRequestDTO;
import com.example.app.model.dto.ActivityResponseDTO;
import com.example.app.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponseDTO> recordActivity(
            @RequestParam("userId") String userId,
            @RequestBody ActivityRequestDTO request) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(activityService.recordActivity(userIdUUID, request));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }
}
