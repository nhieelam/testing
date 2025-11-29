package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
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
import com.example.demo.util.XssSanitizer;

@RestController
@RequestMapping("/api/products")
@CrossOrigin // cho phép FE gọi từ domain khác (localhost:3000,...)
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * GET /api/products
     * 
     * Returns all products as JSON.
     * Product names are returned as plain text strings - no HTML transformation.
     * XSS protection is handled by frontend output escaping (React auto-escapes HTML).
     */
    @GetMapping
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable UUID id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)              // 200
                .orElse(ResponseEntity.notFound().build()); // 404
    }

    /**
     * POST /api/products
     * 
     * Creates a new product.
     * 
     * XSS Protection:
     * - Validates product name to reject dangerous HTML/script patterns
     * - Returns product as plain text JSON (no HTML transformation)
     * - Frontend is responsible for output escaping (React auto-escapes)
     * 
     * @param product The product to create
     * @return Created product or 400 Bad Request if validation fails
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product) {
        // Validate product name for XSS protection
        XssSanitizer.ValidationResult nameValidation = 
            XssSanitizer.validateProductName(product.getName());
        
        if (!nameValidation.isValid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(nameValidation.getErrorMessage());
        }

        // id sẽ tự random trong @PrePersist nếu null
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    /**
     * PUT /api/products/{id}
     * 
     * Updates an existing product.
     * 
     * XSS Protection:
     * - Validates product name to reject dangerous HTML/script patterns
     * - Returns product as plain text JSON (no HTML transformation)
     * - Frontend is responsible for output escaping (React auto-escapes)
     * 
     * @param id The product ID to update
     * @param payload The updated product data
     * @return Updated product, 400 Bad Request if validation fails, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @RequestBody Product payload
    ) {
        // Validate product name for XSS protection
        XssSanitizer.ValidationResult nameValidation = 
            XssSanitizer.validateProductName(payload.getName());
        
        if (!nameValidation.isValid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(nameValidation.getErrorMessage());
        }

        return productRepository.findById(id)
                .map(existing -> {
                    existing.setName(payload.getName());
                    existing.setDescription(payload.getDescription());
                    existing.setPrice(payload.getPrice());
                    existing.setStockQuantity(payload.getStockQuantity());
                    existing.setStatus(payload.getStatus());
                    return ResponseEntity.ok(productRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }
}
