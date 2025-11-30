package com.example.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController Login Endpoint Tests")
class AuthControllerLoginIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    // ======a. Test POST /api/auth/login endpoint ===============

    @Test
    @DisplayName("TC1: Đăng nhập thành công, trả về 200 và LoginResponse")
    void testLoginSuccess() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("Test@123");

        LoginResponse mockResponse = new LoginResponse(
                "mocked_jwt_token",
                "uuid-123",
                "testuser");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))

                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("mocked_jwt_token"))
                .andExpect(jsonPath("$.userId").value("uuid-123"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("TC2: Đăng nhập thất bại (Sai thông tin), trả về 401 Unauthorized")
    void testLoginFailureInvalidCredentials() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("wronguser");
        request.setPassword("WrongPass123");

        final String errorMessage = "Invalid username or password";

        when(authService.authenticate(any(LoginRequest.class)))
                .thenThrow(new RuntimeException(errorMessage));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))

                .andExpect(status().isUnauthorized())
                .andExpect(content().string(errorMessage));
    }

    @Test
    @DisplayName("TC3: Đăng nhập thất bại (Dữ liệu không hợp lệ), trả về 401 Unauthorized")
    void testLoginFailureInvalidData() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("a");
        request.setPassword("1");

        final String errorMessage = "Username phai co tu 3-50 ky tu";

        when(authService.authenticate(any(LoginRequest.class)))
                .thenThrow(new RuntimeException(errorMessage));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))

                .andExpect(status().isUnauthorized())
                .andExpect(content().string(errorMessage));
    }

    // ============b. Test response structure và status codes =======

    @Test
    @DisplayName("TC4: Kiểm tra Response Structure đúng format (Thành công)")
    void testResponseStructureOnSuccess() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("user_structure");
        request.setPassword("Valid@123");

        LoginResponse mockResponse = new LoginResponse(
                "valid_token_123",
                "uuid-structure",
                "user_structure");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.username").exists());
    }

    @Test
    @DisplayName("TC5: Kiểm tra HTTP Status Code 200 khi thành công")
    void testStatusCode200OnSuccess() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("status_check");
        request.setPassword("Status@123");

        LoginResponse mockResponse = new LoginResponse(
                "token_status_200",
                "uuid-status",
                "status_check");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))

                .andExpect(status().isOk());
    }

    // ===========c. Test CORS và Headers =================

    @Test
    @DisplayName("TC6: Kiểm tra CORS Header (Access-Control-Allow-Origin)")
    void testCorsHeaderExistence() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("cors_user");
        request.setPassword("Cors@123");

        // Mock successful login response
        LoginResponse mockResponse = new LoginResponse(
                "cors_token",
                "uuid-cors",
                "cors_user");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Origin", "http://external-domain.com"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }
}