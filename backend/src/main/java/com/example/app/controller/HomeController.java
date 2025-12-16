package com.example.app.controller;

import com.example.app.model.dto.HomeDashboardDTO;
import com.example.app.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/dashboard")
    public ResponseEntity<HomeDashboardDTO> getDashboard(@RequestParam("userId") String userId) {
        try {
            UUID userIdUUID = UUID.fromString(userId);
            return ResponseEntity.ok(homeService.getDashboard(userIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid userId format: " + userId);
        }
    }
}
