package com.example.demo.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse authenticate(LoginRequest request) {
        // 1. Tìm user theo username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        // 2. Nếu không tồn tại user
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOptional.get();

        // 3. Kiểm tra password (request pass vs DB hash)
        boolean isMatch = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!isMatch) {
            throw new RuntimeException("Invalid username or password");
        }

        // 4. Sinh Token
        String token = jwtService.generateToken(user.getId().toString(), user.getUsername());

        // 5. Trả về Response
        return new LoginResponse(token, user.getId().toString(), user.getUsername());
    }
}