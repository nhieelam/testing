package com.example.demo.service;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User mockUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");
        mockUser.setPasswordHash("hashedPassword123"); //

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Password123");
    }

    @Test
    @DisplayName("TC1: Login thành công")
    void testAuthenticate_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("Password123", "hashedPassword123")).thenReturn(true);
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("mock.jwt.token");

        LoginResponse response = authService.authenticate(loginRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        verify(jwtService, times(1)).generateToken(anyString(), anyString());
    }

    @Test
    @DisplayName("TC2: Login thất bại - User không tồn tại")
    void testAuthenticate_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticate(loginRequest);
        });

        assertEquals("Invalid username or password", exception.getMessage());
    }

    @Test
    @DisplayName("TC3: Login thất bại - Sai Password")
    void testAuthenticate_WrongPassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("Password123", "hashedPassword123")).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticate(loginRequest);
        });

        assertEquals("Invalid username or password", exception.getMessage());
    }
    @Test
    @DisplayName("TC4: Register thành công")
    void testRegister_Success() {
        com.example.demo.dto.RegisterRequest req = new com.example.demo.dto.RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("pass123");
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPass");
        authService.register(req);
        verify(userRepository, times(1)).save(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    @DisplayName("TC5: Register thất bại - Username đã tồn tại")
    void testRegister_UsernameTaken() {
        com.example.demo.dto.RegisterRequest req = new com.example.demo.dto.RegisterRequest();
        req.setUsername("existinguser");
        req.setPassword("pass123");

        when(userRepository.findByUsername("existinguser")).thenReturn(Optional.of(mockUser));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.register(req);
        });

        assertEquals("Username is already taken", exception.getMessage());
        
        verify(userRepository, times(0)).save(org.mockito.ArgumentMatchers.any(User.class));
    }
}