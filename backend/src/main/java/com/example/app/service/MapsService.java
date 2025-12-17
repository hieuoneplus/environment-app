package com.example.app.service;

import com.example.app.model.dto.MapLocationDTO;
import com.example.app.model.entity.Location;
import com.example.app.model.entity.MoveTracking;
import com.example.app.model.entity.User;
import com.example.app.repo.LocationRepository;
import com.example.app.repo.MoveTrackingRepository;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MapsService {

    private final LocationRepository locationRepository;
    private final MoveTrackingRepository moveTrackingRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    @Transactional(readOnly = true)
    public List<MapLocationDTO> getLocations(String type) {
        List<Location> locations;
        
        if (type != null && !type.isEmpty() && !"all".equals(type)) {
            locations = locationRepository.findByIsActiveTrueAndLocationType(type);
        } else {
            locations = locationRepository.findByIsActiveTrue();
        }
        
        return locations.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MoveTracking startTracking(UUID userId, String mode, BigDecimal startLat, BigDecimal startLng) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // End any existing active tracking
        moveTrackingRepository.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    existing.setEndedAt(LocalDateTime.now());
                    moveTrackingRepository.save(existing);
                });

        MoveTracking tracking = new MoveTracking();
        tracking.setUser(user);
        tracking.setMode(mode);
        tracking.setStartLatitude(startLat);
        tracking.setStartLongitude(startLng);
        tracking.setIsActive(true);
        tracking.setStartedAt(LocalDateTime.now());

        return moveTrackingRepository.save(tracking);
    }

    @Transactional
    public void updateTracking(UUID userId, BigDecimal latitude, BigDecimal longitude) {
        moveTrackingRepository.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(tracking -> {
                    // Update end position (will be used to calculate distance)
                    // Also accumulate distance incrementally
                    if (tracking.getEndLatitude() != null && tracking.getEndLongitude() != null) {
                        // Calculate incremental distance
                        double incrementalDistance = calculateDistance(
                            tracking.getEndLatitude().doubleValue(),
                            tracking.getEndLongitude().doubleValue(),
                            latitude.doubleValue(),
                            longitude.doubleValue()
                        );
                        
                        // Add to existing distance
                        BigDecimal currentDistance = tracking.getDistanceKm() != null 
                            ? tracking.getDistanceKm() 
                            : BigDecimal.ZERO;
                        tracking.setDistanceKm(currentDistance.add(BigDecimal.valueOf(incrementalDistance))
                            .setScale(2, RoundingMode.HALF_UP));
                    }
                    
                    tracking.setEndLatitude(latitude);
                    tracking.setEndLongitude(longitude);
                    moveTrackingRepository.save(tracking);
                });
    }

    @Transactional
    public MoveTracking stopTracking(UUID userId) {
        MoveTracking tracking = moveTrackingRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new RuntimeException("No active tracking found"));

        tracking.setIsActive(false);
        tracking.setEndedAt(LocalDateTime.now());

        // Use accumulated distance from updates, or calculate from start/end if not available
        BigDecimal finalDistance;
        if (tracking.getDistanceKm() != null && tracking.getDistanceKm().compareTo(BigDecimal.ZERO) > 0) {
            // Use accumulated distance from updates
            finalDistance = tracking.getDistanceKm();
        } else if (tracking.getStartLatitude() != null && tracking.getStartLongitude() != null &&
                   tracking.getEndLatitude() != null && tracking.getEndLongitude() != null) {
            // Calculate from start to end position
            double distance = calculateDistance(
                tracking.getStartLatitude().doubleValue(),
                tracking.getStartLongitude().doubleValue(),
                tracking.getEndLatitude().doubleValue(),
                tracking.getEndLongitude().doubleValue()
            );
            finalDistance = BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
            tracking.setDistanceKm(finalDistance);
        } else {
            finalDistance = BigDecimal.ZERO;
        }
        
        // Calculate points: 10 GP per km (minimum 0.1 km to earn points)
        int points = 0;
        if (finalDistance.compareTo(new BigDecimal("0.1")) >= 0) {
            points = finalDistance.multiply(new BigDecimal("10")).intValue();
        }
        tracking.setPointsEarned(points);
        
        // Award points to user
        if (points > 0) {
            User user = tracking.getUser();
            pointsService.addPoints(user, points, "LOCATION_CHECKIN");
            userRepository.save(user);
            log.info("Awarded {} GP to user {} for {} km of movement", points, userId, finalDistance);
        }

        return moveTrackingRepository.save(tracking);
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private MapLocationDTO toDTO(Location location) {
        return new MapLocationDTO(
                location.getId(),
                location.getName(),
                location.getLocationType(),
                location.getLatitude(),
                location.getLongitude(),
                location.getPointsAvailable(),
                location.getDescription(),
                location.getAddress()
        );
    }
}
