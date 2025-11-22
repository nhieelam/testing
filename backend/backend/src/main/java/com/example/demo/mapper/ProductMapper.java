package com.example.demo.mapper;

import org.springframework.stereotype.Component;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.Product;

@Component
public class ProductMapper {

    public Product toEntity(ProductDto dto) {
        if (dto == null) return null;
        
        Product entity = new Product();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPrice(dto.getPrice()); // Dùng Double
        entity.setStockQuantity(dto.getQuantity()); 
        entity.setDescription(dto.getDescription());
        
        return entity;
    }

    public ProductDto toDto(Product entity) {
        if (entity == null) return null;

        // Dùng constructor 5 tham số của DTO
        return new ProductDto(
                entity.getId(),
                entity.getName(),
                entity.getPrice(), // Dùng Double
                entity.getStockQuantity(), 
                entity.getDescription()
        );
    }
}