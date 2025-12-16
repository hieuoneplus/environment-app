package com.example.app.model.rest;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

