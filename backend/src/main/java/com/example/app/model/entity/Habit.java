package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "habits")
@Data
public class Habit {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer points;

    @Column(length = 500)
    private String description;

    @Column(name = "icon_name")
    private String iconName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
