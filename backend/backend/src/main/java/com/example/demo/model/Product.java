// package com.example.demo.model;

// import java.math.BigDecimal;
// import java.util.UUID;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.Id;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "products") // đúng tên table trên Supabase
// public class Product {

//     @Id
//     @Column(name = "id", columnDefinition = "uuid")
//     private UUID id;

//     @Column(name = "name", nullable = false)
//     private String name;

//     @Column(name = "description", columnDefinition = "text")
//     private String description;

//     @Column(name = "price", precision = 10, scale = 2)
//     private BigDecimal price;

//     @Column(name = "stock_quantity")
//     private Integer stockQuantity;

//     @Column(name = "status")
//     private String status;

//     // ----- lifecycle: tự set id nếu chưa có -----
//     @PrePersist
//     public void prePersist() {
//         if (this.id == null) {
//             this.id = UUID.randomUUID();
//         }
//     }

//     // ----- constructors -----
//     public Product() {
//     }

//     public Product(UUID id, String name, String description, BigDecimal price,
//                    Integer stockQuantity, String status) {
//         this.id = id;
//         this.name = name;
//         this.description = description;
//         this.price = price;
//         this.stockQuantity = stockQuantity;
//         this.status = status;
//     }

//     // ----- getters & setters -----
//     public UUID getId() {
//         return id;
//     }

//     public void setId(UUID id) {
//         this.id = id;
//     }

//     public String getName() {
//         return name;
//     }

//     public void setName(String name) {
//         this.name = name;
//     }

//     public String getDescription() {
//         return description;
//     }

//     public void setDescription(String description) {
//         this.description = description;
//     }

//     public BigDecimal getPrice() {
//         return price;
//     }

//     public void setPrice(BigDecimal price) {
//         this.price = price;
//     }

//     public Integer getStockQuantity() {
//         return stockQuantity;
//     }

//     public void setStockQuantity(Integer stockQuantity) {
//         this.stockQuantity = stockQuantity;
//     }

//     public String getStatus() {
//         return status;
//     }

//     public void setStatus(String status) {
//         this.status = status;
//     }
// }
