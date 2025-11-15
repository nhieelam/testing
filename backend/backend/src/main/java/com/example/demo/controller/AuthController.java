package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public AuthController(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    // ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // check trùng username
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Username is already taken");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        userRepository.save(user);

        // Không trả mật khẩu về client
        return ResponseEntity.ok("Register successfully");
    }

    // ĐĂNG NHẬP
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    var userOpt = userRepository.findByUsername(req.getUsername());
    if (userOpt.isEmpty()) {
        return ResponseEntity.status(401).body("Invalid username or password");
    }

    User user = userOpt.get();

    if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
        return ResponseEntity.status(401).body("Invalid username or password");
    }

    String token = jwtService.generateToken(
            user.getId().toString(),
            user.getUsername()
    );

    LoginResponse response = new LoginResponse(
            token,
            user.getId().toString(),
            user.getUsername()
    );

    return ResponseEntity.ok(response);
}

}
