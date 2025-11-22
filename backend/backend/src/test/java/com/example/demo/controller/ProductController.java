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

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin 
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable UUID id) { 
        return productRepository.findById(id) 
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(
            @PathVariable UUID id, 
            @RequestBody Product payload
    ) {
        return productRepository.findById(id) 
                .map(existing -> {
                    existing.setName(payload.getName());
                    existing.setDescription(payload.getDescription());
                    existing.setPrice(payload.getPrice());
                    // SỬA Ở ĐÂY: Dùng đúng tên method từ Entity
                    existing.setStockQuantity(payload.getStockQuantity()); 
                    existing.setStatus(payload.getStatus());
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) { 
        if (!productRepository.existsById(id)) { 
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id); 
        return ResponseEntity.noContent().build();
    }
}