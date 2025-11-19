package com.example.demo.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductController productController;

    private Product mockProduct;
    private UUID mockId;

    @BeforeEach
    void setUp() {
        mockId = UUID.randomUUID();
        mockProduct = new Product(
                mockId, 
                "Laptop", 
                "Mock Laptop", 
                new BigDecimal("1500.00"), 
                10, 
                "ACTIVE"
        );
    }

    // 
    @Test
    @DisplayName("Mock: Lấy tất cả sản phẩm")
    void testGetAllProducts() {
        List<Product> mockList = List.of(mockProduct);
        when(productRepository.findAll()).thenReturn(mockList);

        List<Product> result = productController.getAll();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Laptop", result.get(0).getName());
        
        verify(productRepository, times(1)).findAll();
    }

    // 
    @Test
    @DisplayName("Mock: Lấy sản phẩm bằng ID thành công")
    void testGetProductById_Found() {
        when(productRepository.findById(mockId))
                .thenReturn(Optional.of(mockProduct));

        ResponseEntity<Product> response = productController.getById(mockId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockProduct, response.getBody());
        verify(productRepository, times(1)).findById(mockId);
    }

    @Test
    @DisplayName("Mock: Lấy sản phẩm bằng ID thất bại (Not Found)")
    void testGetProductById_NotFound() {
        when(productRepository.findById(mockId)).thenReturn(Optional.empty());

        ResponseEntity<Product> response = productController.getById(mockId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(productRepository, times(1)).findById(mockId);
    }

    // 
    @Test
    @DisplayName("Mock: Tạo sản phẩm mới")
    void testCreateProduct() {
        when(productRepository.save(any(Product.class)))
                .thenReturn(mockProduct);

        Product newProduct = new Product(null, "Laptop", "Mock Laptop", new BigDecimal("1500.00"), 10, "ACTIVE");

        Product result = productController.create(newProduct);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    // 
    @Test
    @DisplayName("Mock: Xóa sản phẩm thành công")
    void testDeleteProduct_Success() {

        when(productRepository.existsById(mockId)).thenReturn(true);
        doNothing().when(productRepository).deleteById(mockId);

        ResponseEntity<Void> response = productController.delete(mockId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(productRepository, times(1)).existsById(mockId);
        verify(productRepository, times(1)).deleteById(mockId);
    }

    @Test
    @DisplayName("Mock: Xóa sản phẩm thất bại (Not Found)")
    void testDeleteProduct_NotFound() {
        when(productRepository.existsById(mockId)).thenReturn(false);

        ResponseEntity<Void> response = productController.delete(mockId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(productRepository, never()).deleteById(any(UUID.class));
    }
}