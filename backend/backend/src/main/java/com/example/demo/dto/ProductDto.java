package com.example.demo.dto;

import java.util.UUID;

public class ProductDto {
    private UUID id;
    private String name;
    private Double price;     // <-- Dùng Double
    private Integer quantity; // <-- DTO dùng "quantity"
    private String description;

    // Constructor rỗng
    public ProductDto() {}

    // Constructor 5 tham số (Bỏ category)
    public ProductDto(UUID id, String name, Double price, Integer quantity, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }

    // --- Getters và Setters (BỔ SUNG CÁC GETTER CÒN THIẾU) ---
    public UUID getId() { return id; }
    public String getName() { return name; }
    public Integer getQuantity() { return quantity; }
    
    // THÊM 2 METHOD NÀY VÀO
    public Double getPrice() { return price; }
    public String getDescription() { return description; }
}