package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitDTO {
    private UUID id;
    private String name;
    private Integer points;
    private String description;
    private String iconName;
    private Boolean completed;
}
