// package com.example.demo.model;

// import java.util.UUID;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.Id;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "users")
// public class User {

//     @Id
//     @Column(name = "id", columnDefinition = "uuid")
//     private UUID id;

//     @Column(name = "username", nullable = false, unique = true)
//     private String username;

//     @Column(name = "password_hash", nullable = false)
//     private String passwordHash;

//     @PrePersist
//     public void prePersist() {
//         if (this.id == null) {
//             this.id = UUID.randomUUID();
//         }
//     }

//     public User() {
//     }

//     public User(UUID id, String username, String passwordHash) {
//         this.id = id;
//         this.username = username;
//         this.passwordHash = passwordHash;
//     }

//     // getters & setters
//     public UUID getId() {
//         return id;
//     }

//     public void setId(UUID id) {
//         this.id = id;
//     }

//     public String getUsername() {
//         return username;
//     }

//     public void setUsername(String username) {
//         this.username = username;
//     }

//     public String getPasswordHash() {
//         return passwordHash;
//     }

//     public void setPasswordHash(String passwordHash) {
//         this.passwordHash = passwordHash;
//     }
// }
