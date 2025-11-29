package com.example.demo.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JwtService;

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

    /**
     * ĐĂNG NHẬP
     * 
     * Security Notes:
     * - Uses Spring Data JPA's findByUsername() which automatically uses parameterized queries
     * - SQL injection is prevented because user input is bound as a parameter, not concatenated into SQL
     * - Password comparison uses PasswordEncoder.matches() with hashed passwords (bcrypt)
     * - Generic error message prevents username enumeration attacks
     * 
     * @param req LoginRequest containing username and password
     * @return LoginResponse with JWT token on success, 401 with generic error on failure
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // Spring Data JPA's findByUsername() uses parameterized queries automatically
        // Example generated query: SELECT * FROM users WHERE username = ? 
        // The username parameter is safely bound, preventing SQL injection
        var userOpt = userRepository.findByUsername(req.getUsername());
        if (userOpt.isEmpty()) {
            // Generic error message prevents username enumeration
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        User user = userOpt.get();

        // Password comparison using bcrypt - safe from timing attacks
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            // Same generic error message for consistency
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
