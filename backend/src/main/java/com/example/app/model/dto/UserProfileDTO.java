package com.example.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UUID id;
    private String name;
    private String email;
    private String address;
    private String gender;
    private LocalDate dob;
    private Integer greenPoints;
    private String rank;
    private Integer streak;
    private String avatarUrl;
}
