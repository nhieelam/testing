package com.example.demo.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    // khóa bí mật (demo thì để cứng, thực tế nên để trong biến môi trường)
    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // thời gian sống của token (ví dụ: 1 ngày)
    private final long expirationMs = 24 * 60 * 60 * 1000;

    public String generateToken(String userId, String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(userId) // thường là id user
                .addClaims(Map.of("username", username))
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey)
                .compact();
    }
}
