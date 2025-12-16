package com.example.app.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
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
}
