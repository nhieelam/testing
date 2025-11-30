package com.example.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@DisplayName("Product API Endpoints Tests (/api/products)")
class ProductControllerIntegrationTest {

    private static final String API_PRODUCTS = "/api/products";
    private final UUID MOCKED_ID = UUID.fromString("11111111-2222-3333-4444-555555555555");
    private Product mockProduct;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        mockProduct = new Product(
                MOCKED_ID,
                "Laptop Gaming X",
                25000000.0,
                10,
                "Mô tả chi tiết");
        mockProduct.setStatus("ACTIVE");
    }

    // ==============a. Test POST /api/products (Create) (1 điểm) =============
    @Test
    @DisplayName("TC1: Tạo mới sản phẩm thành công (POST /api/products)")
    void testCreateProductSuccess() throws Exception {
        Product newProduct = new Product();
        newProduct.setName("Smartphone Y");
        newProduct.setPrice(15000000.0);
        newProduct.setStockQuantity(50);
        newProduct.setDescription("Mô tả sản phẩm mới");
        newProduct.setStatus("ACTIVE");

        Product savedProduct = new Product(
                UUID.randomUUID(),
                newProduct.getName(),
                newProduct.getPrice(),
                newProduct.getStockQuantity(),
                newProduct.getDescription());
        savedProduct.setStatus(newProduct.getStatus());

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        mockMvc.perform(post(API_PRODUCTS)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProduct)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Smartphone Y"))
                .andExpect(jsonPath("$.price").value(15000000.0))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(productRepository, times(1)).save(any(Product.class));
    }

    // ===============b.. Test GET /api/products (Read all) (1 điểm) ==========
    @Test
    @DisplayName("TC2: Lấy tất cả sản phẩm thành công (GET /api/products) - Trả về 200 OK")
    void testGetAllProductsSuccess() throws Exception {
        Product product2 = new Product(UUID.randomUUID(), "Tablet Z", 5000000.0, 20, "Mô tả tablet");
        List<Product> productList = Arrays.asList(mockProduct, product2);

        when(productRepository.findAll()).thenReturn(productList);

        mockMvc.perform(get(API_PRODUCTS)
                .contentType(MediaType.APPLICATION_JSON))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Laptop Gaming X"))
                .andExpect(jsonPath("$[1].name").value("Tablet Z"));

        verify(productRepository, times(1)).findAll();
    }

    // c. Test GET /api/products/{id} (Read one) (1 điểm) ===============
    @Test
    @DisplayName("TC3: Lấy sản phẩm theo ID thành công (GET /api/products/{id})")
    void testGetProductByIdSuccess() throws Exception {
        when(productRepository.findById(MOCKED_ID)).thenReturn(Optional.of(mockProduct));

        mockMvc.perform(get(API_PRODUCTS + "/{id}", MOCKED_ID)
                .contentType(MediaType.APPLICATION_JSON))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(MOCKED_ID.toString()))
                .andExpect(jsonPath("$.name").value("Laptop Gaming X"))
                .andExpect(jsonPath("$.price").value(25000000.0));

        verify(productRepository, times(1)).findById(MOCKED_ID);
    }

    // ==========d.Test PUT /api/products/{id} (Update) (1 điểm) =============
    @Test
    @DisplayName("TC4: Cập nhật sản phẩm thành công (PUT /api/products/{id})")
    void testUpdateProductSuccess() throws Exception {
        Product updatedPayload = new Product();
        updatedPayload.setName("Laptop Gaming X - Gen 2");
        updatedPayload.setPrice(28000000.0);
        updatedPayload.setStockQuantity(5);
        updatedPayload.setDescription("Đã nâng cấp");
        updatedPayload.setStatus("OUT_OF_STOCK");

        when(productRepository.findById(MOCKED_ID)).thenReturn(Optional.of(mockProduct));

        Product resultProduct = new Product(MOCKED_ID, updatedPayload.getName(), updatedPayload.getPrice(),
                updatedPayload.getStockQuantity(), updatedPayload.getDescription());
        resultProduct.setStatus(updatedPayload.getStatus());

        when(productRepository.save(any(Product.class))).thenReturn(resultProduct);

        mockMvc.perform(put(API_PRODUCTS + "/{id}", MOCKED_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPayload)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop Gaming X - Gen 2"))
                .andExpect(jsonPath("$.price").value(28000000.0))
                .andExpect(jsonPath("$.status").value("OUT_OF_STOCK"));

        verify(productRepository, times(1)).findById(MOCKED_ID);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    // ============e. Test DELETE /api/products/{id} ==========
    @Test
    @DisplayName("TC5: Xóa sản phẩm thành công (DELETE /api/products/{id})")
    void testDeleteProductSuccess() throws Exception {
        when(productRepository.existsById(MOCKED_ID)).thenReturn(true);

        mockMvc.perform(delete(API_PRODUCTS + "/{id}", MOCKED_ID))

                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(productRepository, times(1)).existsById(MOCKED_ID);
        verify(productRepository, times(1)).deleteById(MOCKED_ID);
    }

    @Test
    @DisplayName("TC6: Xóa sản phẩm không tồn tại -404 Not Found")
    void testDeleteProductNotFound() throws Exception {
        when(productRepository.existsById(any(UUID.class))).thenReturn(false);

        mockMvc.perform(delete(API_PRODUCTS + "/{id}", MOCKED_ID))

                .andExpect(status().isNotFound());

        verify(productRepository, times(1)).existsById(MOCKED_ID);
        verify(productRepository, never()).deleteById(any(UUID.class));
    }
}