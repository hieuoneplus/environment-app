package com.example.app.service;

import com.example.app.model.dto.*;
import com.example.app.model.entity.*;
import com.example.app.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final UserHabitRepository userHabitRepository;
    private final LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public HomeDashboardDTO getDashboard(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get greeting based on time
        String greeting = getGreeting();

        // Get today's habits
        List<HabitDTO> todayHabits = getTodayHabits(userId);

        // Get nearby locations (simplified - using default location for now)
        List<LocationDTO> nearbyLocations = getNearbyLocations(null, null);

        return new HomeDashboardDTO(
                user.getName(),
                greeting,
                user.getGreenPoints(),
                user.getRank(),
                user.getStreak(),
                todayHabits,
                nearbyLocations
        );
    }

    private String getGreeting() {
        int hour = java.time.LocalTime.now().getHour();
        if (hour < 12) {
            return "sáng lành";
        } else if (hour < 18) {
            return "chiều tốt";
        } else {
            return "tối tốt";
        }
    }

    private List<HabitDTO> getTodayHabits(UUID userId) {
        LocalDate today = LocalDate.now();
        List<Habit> allHabits = habitRepository.findByIsActiveTrue();
        
        return allHabits.stream().map(habit -> {
            UserHabit userHabit = userHabitRepository
                    .findByUserIdAndHabitIdAndDate(userId, habit.getId(), today)
                    .orElse(null);
            
            boolean completed = userHabit != null && userHabit.getCompleted();
            
            return new HabitDTO(
                    habit.getId(),
                    habit.getName(),
                    habit.getPoints(),
                    habit.getDescription(),
                    habit.getIconName(),
                    completed
            );
        }).collect(Collectors.toList());
    }

    private List<LocationDTO> getNearbyLocations(BigDecimal latitude, BigDecimal longitude) {
        List<Location> locations = locationRepository.findByIsActiveTrue();
        
        return locations.stream().map(location -> {
            String distance = calculateDistance(latitude, longitude, 
                    location.getLatitude(), location.getLongitude());
            
            return new LocationDTO(
                    location.getId(),
                    location.getName(),
                    location.getLatitude(),
                    location.getLongitude(),
                    location.getPointsAvailable(),
                    location.getDescription(),
                    location.getAddress(),
                    distance
            );
        }).collect(Collectors.toList());
    }

    private String calculateDistance(BigDecimal lat1, BigDecimal lng1, 
                                     BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return "N/A";
        }
        
        // Simplified distance calculation (Haversine formula)
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
}
