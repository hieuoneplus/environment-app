package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String address;
    private String gender;
    private LocalDate dob;

    @Column(unique = true)
    private String email;

    private String password;

    // Green points system
    @Column(name = "green_points")
    private Integer greenPoints = 0;

    @Column(name = "rank", length = 100)
    private String rank = "Mầm Non Tích Cực";

    @Column(name = "streak")
    private Integer streak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
