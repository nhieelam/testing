// Tên file: backend/backend/src/test/java/com/example/demo/controller/AuthControllerTest.java
package com.example.demo.controller;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthController authController;

    private User mockUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");
        mockUser.setPasswordHash("hashedPassword123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password123");
    }

    @Test
    @DisplayName("Mock: Đăng nhập thành công")
    void testLoginSuccess() {

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(mockUser));
        
   
        when(passwordEncoder.matches("Password123", "hashedPassword123"))
                .thenReturn(true);
       
        when(jwtService.generateToken(anyString(), anyString()))
                .thenReturn("mock.jwt.token");

       
        ResponseEntity<?> responseEntity = authController.login(loginRequest);

     
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        LoginResponse responseBody = (LoginResponse) responseEntity.getBody();
        assertNotNull(responseBody);
        assertEquals("mock.jwt.token", responseBody.getToken());
        assertEquals("testuser", responseBody.getUsername());

      
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(passwordEncoder, times(1)).matches("Password123", "hashedPassword123");
        verify(jwtService, times(1)).generateToken(mockUser.getId().toString(), "testuser");
    }

    @Test
    @DisplayName("Mock: Đăng nhập thất bại - Sai Username")
    void testLoginFail_UserNotFound() {

        when(userRepository.findByUsername("wronguser"))
                .thenReturn(Optional.empty());

        loginRequest.setUsername("wronguser");


        ResponseEntity<?> responseEntity = authController.login(loginRequest);

  
        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
        assertEquals("Invalid username or password", responseEntity.getBody());


        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(anyString(), anyString());
    }

    @Test
    @DisplayName("Mock: Đăng nhập thất bại - Sai Password")
    void testLoginFail_WrongPassword() {
 
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(mockUser));
        
    
        when(passwordEncoder.matches("wrongPassword", "hashedPassword123"))
                .thenReturn(false);

        loginRequest.setPassword("wrongPassword");

        ResponseEntity<?> responseEntity = authController.login(loginRequest);

       
        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
        assertEquals("Invalid username or password", responseEntity.getBody());


        verify(jwtService, never()).generateToken(anyString(), anyString());
    }
}