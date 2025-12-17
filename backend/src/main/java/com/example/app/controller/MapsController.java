package com.example.app.controller;

import com.example.app.model.dto.MapLocationDTO;
import com.example.app.model.entity.MoveTracking;
import com.example.app.service.MapsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
public class MapsController {

    private final MapsService mapsService;

    @GetMapping("/locations")
    public ResponseEntity<List<MapLocationDTO>> getLocations(@RequestParam(value = "type", required = false) String type) {
        return ResponseEntity.ok(mapsService.getLocations(type));
    }

    @PostMapping("/tracking/start")
    public ResponseEntity<Map<String, Object>> startTracking(@RequestBody Map<String, Object> request) {
        UUID userId = UUID.fromString((String) request.get("userId"));
        String mode = (String) request.get("mode");
        BigDecimal startLat = new BigDecimal(request.get("startLatitude").toString());
        BigDecimal startLng = new BigDecimal(request.get("startLongitude").toString());

        MoveTracking tracking = mapsService.startTracking(userId, mode, startLat, startLng);

        Map<String, Object> response = new HashMap<>();
        response.put("trackingId", tracking.getId());
        response.put("startedAt", tracking.getStartedAt());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tracking/update")
    public ResponseEntity<Map<String, String>> updateTracking(@RequestBody Map<String, Object> request) {
        UUID userId = UUID.fromString((String) request.get("userId"));
        BigDecimal lat = new BigDecimal(request.get("latitude").toString());
        BigDecimal lng = new BigDecimal(request.get("longitude").toString());

        mapsService.updateTracking(userId, lat, lng);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @PostMapping("/tracking/stop")
    public ResponseEntity<Map<String, Object>> stopTracking(@RequestBody Map<String, Object> request) {
        UUID userId = UUID.fromString((String) request.get("userId"));

        MoveTracking tracking = mapsService.stopTracking(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("distance", tracking.getDistanceKm() != null ? tracking.getDistanceKm().doubleValue() : 0);
        response.put("pointsEarned", tracking.getPointsEarned());
        response.put("duration", tracking.getEndedAt() != null && tracking.getStartedAt() != null
                ? java.time.Duration.between(tracking.getStartedAt(), tracking.getEndedAt()).getSeconds()
                : 0);
        return ResponseEntity.ok(response);
    }
}
