package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.User;   
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin // cho phép FE call từ domain khác (localhost:3000, v.v.)
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET /api/users  -> lấy tất cả user
    @GetMapping
    public List<User> getAll() {
        return userRepository.findAll();
    }

    // GET /api/users/{id} -> lấy user theo id
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/users -> tạo user mới
    @PostMapping
    public User create(@RequestBody User user) {
        // hiện tại expect passwordHash đã được hash sẵn
        // sau này nếu muốn gửi plain password thì mình sẽ thêm bước hash bằng BCrypt
        return userRepository.save(user);
    }

    // PUT /api/users/{id} -> cập nhật user
    @PutMapping("/{id}")
    public ResponseEntity<User> update(
            @PathVariable UUID id,
            @RequestBody User payload
    ) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setUsername(payload.getUsername());
                    existing.setPasswordHash(payload.getPasswordHash());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/users/{id} -> xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
