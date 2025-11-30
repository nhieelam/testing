package com.example.demo.service;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.Product;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceMockTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product mockProduct;
    private ProductDto mockProductDto;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        // Setup Entity
        mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setName("Laptop Dell");
        mockProduct.setPrice(15000000.0);
        mockProduct.setStockQuantity(10);
        mockProduct.setDescription("Laptop chính hãng");

        // Setup DTO
        mockProductDto = new ProductDto(
            productId, 
            "Laptop Dell", 
            15000000.0, 
            10, 
            "Laptop chính hãng"
        );
    }

    // --- 1. Test Create Product ---
    @Test
    @DisplayName("TC1: Tạo sản phẩm thành công")
    void testCreateProduct_Success() {
        when(productMapper.toEntity(any(ProductDto.class))).thenReturn(mockProduct);
        when(productRepository.save(any(Product.class))).thenReturn(mockProduct);
        when(productMapper.toDto(any(Product.class))).thenReturn(mockProductDto);

        ProductDto result = productService.createProduct(mockProductDto);

        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    // --- 2. Test Get Product By ID ---
    @Test
    @DisplayName("TC2: Lấy sản phẩm theo ID - Tìm thấy")
    void testGetProductById_Found() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toDto(mockProduct)).thenReturn(mockProductDto);

        ProductDto result = productService.getProductById(productId);

        assertNotNull(result);
        assertEquals(productId, result.getId());
    }

    @Test
    @DisplayName("TC3: Lấy sản phẩm theo ID - Không tìm thấy")
    void testGetProductById_NotFound() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            productService.getProductById(productId);
        });

        assertTrue(exception.getMessage().contains("Product not found"));
    }

    // --- 3. Test Update Product ---
    @Test
    @DisplayName("TC4: Cập nhật sản phẩm thành công")
    void testUpdateProduct_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(any(Product.class))).thenReturn(mockProduct);
        when(productMapper.toDto(any(Product.class))).thenReturn(mockProductDto);

        ProductDto result = productService.updateProduct(productId, mockProductDto);

        assertNotNull(result);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    // --- BỔ SUNG: Test Update Product Not Found (Để phủ kín nhánh elseThrow) ---
    @Test
    @DisplayName("TC4-B: Cập nhật thất bại - ID không tồn tại")
    void testUpdateProduct_NotFound() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(productId, mockProductDto);
        });

        assertTrue(exception.getMessage().contains("Product not found"));
        // Đảm bảo không bao giờ gọi save nếu không tìm thấy
        verify(productRepository, never()).save(any(Product.class));
    }

    // --- 4. Test Delete Product ---
    @Test
    @DisplayName("TC5: Xóa sản phẩm thành công")
    void testDeleteProduct_Success() {
        when(productRepository.existsById(productId)).thenReturn(true);

        productService.deleteProduct(productId);

        verify(productRepository, times(1)).deleteById(productId);
    }

    @Test
    @DisplayName("TC6: Xóa sản phẩm thất bại - ID không tồn tại")
    void testDeleteProduct_NotFound() {
        when(productRepository.existsById(productId)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(productId);
        });

        verify(productRepository, never()).deleteById(any());
    }

    // --- 5. Test Get All (Pagination) ---
    @Test
    @DisplayName("TC7: Lấy tất cả sản phẩm có phân trang")
    void testGetAllProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> pageEntity = new PageImpl<>(Collections.singletonList(mockProduct));

        when(productRepository.findAll(pageable)).thenReturn(pageEntity);
        when(productMapper.toDto(any(Product.class))).thenReturn(mockProductDto);

        Page<ProductDto> resultPage = productService.getAllProducts(pageable);

        assertNotNull(resultPage);
        assertEquals(1, resultPage.getTotalElements());
        verify(productRepository, times(1)).findAll(pageable);
    }
}