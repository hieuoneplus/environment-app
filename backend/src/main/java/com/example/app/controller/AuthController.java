package com.example.app.controller;

import com.example.app.model.dto.UserProfileDTO;
import com.example.app.model.rest.LoginRequest;
import com.example.app.repo.UserRepository;
import com.example.app.service.AuthService;
import com.example.app.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.app.model.entity.User;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final ProfileService profileService;
//    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

//        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User registeredUser = service.register(user);
        UserProfileDTO profileDTO = profileService.getProfile(registeredUser.getId());
        return ResponseEntity.ok(profileDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = service.login(req);
        UserProfileDTO profileDTO = profileService.getProfile(user.getId());
        return ResponseEntity.ok(profileDTO);
    }
}
