package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "rewards")
@Data
public class Reward {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer points;

    @Column(length = 50)
    private String category; // 'voucher', 'plant', etc.

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_emoji")
    private String imageEmoji; // For emoji representation

    @Column(length = 1000)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "stock_quantity")
    private Integer stockQuantity; // null means unlimited
}
