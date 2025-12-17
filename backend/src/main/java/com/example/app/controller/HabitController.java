package com.example.app.controller;

import com.example.app.model.dto.HabitDTO;
import com.example.app.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @GetMapping
    public ResponseEntity<List<HabitDTO>> getAllHabits() {
        return ResponseEntity.ok(habitService.getAllHabits());
    }

    @PostMapping("/{habitId}/toggle")
    public ResponseEntity<HabitDTO> toggleHabit(
            @RequestParam("userId") String userId,
            @PathVariable("habitId") String habitId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            UUID habitIdUUID = UUID.fromString(habitId);
            return ResponseEntity.ok(habitService.toggleHabit(userIdUUID, habitIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format: " + e.getMessage());
        }
    }

    @PostMapping("/{habitId}/subscribe")
    public ResponseEntity<HabitDTO> subscribeToHabit(
            @RequestParam("userId") String userId,
            @PathVariable("habitId") String habitId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            UUID habitIdUUID = UUID.fromString(habitId);
            return ResponseEntity.ok(habitService.subscribeToHabit(userIdUUID, habitIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format: " + e.getMessage());
        }
    }
}
