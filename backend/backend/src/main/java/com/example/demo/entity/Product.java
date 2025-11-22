package com.example.demo.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price")
    private Double price; // <-- Dùng Double, không dùng BigDecimal

    @Column(name = "stock_quantity")
    private Integer stockQuantity; // <-- Tên này khớp với DB

    @Column(name = "status")
    private String status;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdByUser; 

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // --- Constructors cho File Test ---
    public Product() {} // Constructor rỗng

    // Constructor 5 tham số (Bỏ category)
    public Product(UUID id, String name, Double price, Integer stockQuantity, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
    }
    
    // --- Getters và Setters (BẮT BUỘC) ---
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; } // <-- Phải là Double

    // Method này bị thiếu trong code của bạn
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}