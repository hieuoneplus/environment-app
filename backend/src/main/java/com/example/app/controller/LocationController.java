package com.example.app.controller;

import com.example.app.model.dto.LocationDTO;
import com.example.app.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/nearby")
    public ResponseEntity<List<LocationDTO>> getNearbyLocations(
            @RequestParam(value = "latitude", required = false) BigDecimal latitude,
            @RequestParam(value = "longitude", required = false) BigDecimal longitude) {
        return ResponseEntity.ok(locationService.getNearbyLocations(latitude, longitude));
    }

    @GetMapping("/{locationId}")
    public ResponseEntity<LocationDTO> getLocation(@PathVariable("locationId") String locationId) {
        try {
            UUID locationIdUUID = UUID.fromString(locationId);
            return ResponseEntity.ok(locationService.getLocationById(locationIdUUID));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid locationId format: " + locationId);
        }
    }
}
