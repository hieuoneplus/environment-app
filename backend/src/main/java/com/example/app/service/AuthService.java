package com.example.app.service;

import com.example.app.model.entity.User;
import com.example.app.model.rest.LoginRequest;
import com.example.app.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;

    public User register(User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalStateException("Email đã tồn tại");
        }
        return userRepo.save(user);
    }

    public User login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalStateException("Email không tồn tại"));

//        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Sai mật khẩu");
//        }
        if (!user.getPassword().equals(req.getPassword())) {
            throw new IllegalStateException("Sai mật khẩu");
        }
        return user;
    }

}
