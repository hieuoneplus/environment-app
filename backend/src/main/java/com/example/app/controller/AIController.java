package com.example.app.controller;

import com.example.app.service.AIImageRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIImageRecognitionService aiService;

    @PostMapping("/detect")
    public ResponseEntity<Map<String, String>> detectObject(@RequestBody Map<String, String> request) {
        String imageBase64 = request.get("imageBase64");
        
        if (imageBase64 == null || imageBase64.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Image data is required");
            return ResponseEntity.badRequest().body(error);
        }

        String detected = aiService.detectObject(imageBase64);
        String normalized = aiService.normalizeDetectedObject(detected);

        Map<String, String> response = new HashMap<>();
        response.put("detectedObject", normalized);
        response.put("rawDetection", detected);
        
        return ResponseEntity.ok(response);
    }
}
