package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomeDashboardDTO {
    private String userName;
    private String greeting;
    private Integer greenPoints;
    private String rank;
    private Integer streak;
    private List<HabitDTO> todayHabits;
    private List<LocationDTO> nearbyLocations;
}
