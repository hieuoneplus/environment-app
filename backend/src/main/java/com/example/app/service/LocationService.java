package com.example.app.service;

import com.example.app.model.dto.LocationDTO;
import com.example.app.model.entity.Location;
import com.example.app.repo.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public List<LocationDTO> getNearbyLocations(BigDecimal latitude, BigDecimal longitude) {
        List<Location> locations = locationRepository.findByIsActiveTrue();
        
        // Calculate distance for each location if coordinates provided
        return locations.stream()
                .map(location -> {
                    LocationDTO dto = toDTO(location);
                    if (latitude != null && longitude != null && 
                        location.getLatitude() != null && location.getLongitude() != null) {
                        dto.setDistance(calculateDistance(latitude, longitude, 
                                location.getLatitude(), location.getLongitude()));
                    } else {
                        dto.setDistance("N/A");
                    }
                    return dto;
                })
                .sorted((a, b) -> {
                    // Sort by distance if available
                    if (a.getDistance() != null && b.getDistance() != null) {
                        return a.getDistance().compareTo(b.getDistance());
                    }
                    return 0;
                })
                .limit(10) // Limit to 10 nearest locations
                .collect(Collectors.toList());
    }
    
    private String calculateDistance(BigDecimal lat1, BigDecimal lng1, 
                                     BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return "N/A";
        }
        
        // Haversine formula for distance calculation
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lng2.doubleValue() - lng1.doubleValue());
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) * 
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        double distance = R * c; // Distance in km
        
        if (distance < 1) {
            return String.format("%.0fm", distance * 1000);
        } else {
            return String.format("%.1fkm", distance);
        }
    }

    @Transactional(readOnly = true)
    public LocationDTO getLocationById(UUID locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return toDTO(location);
    }

    private LocationDTO toDTO(Location location) {
        // Distance calculation would be done in the service that calls this
        return new LocationDTO(
                location.getId(),
                location.getName(),
                location.getLatitude(),
                location.getLongitude(),
                location.getPointsAvailable(),
                location.getDescription(),
                location.getAddress(),
                null // Distance calculated separately
        );
    }
}
