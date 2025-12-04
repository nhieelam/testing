# Testing Project — Product CRUD + Auth

## Giới thiệu

Đây là ứng dụng web **Fullstack** gồm chức năng **Login** và **Product CRUD**, được xây dựng nhằm thực hành **Testing theo TDD** trên cả **frontend** và **backend**.

Hệ thống gồm:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Spring Boot + Java
- **Tests**: Unit Test, Integration Test, Mock Test, E2E (Cypress)


---

## 1.1 Tổng quan về Dự án

Đây là một ứng dụng web có các chức năng:

* **Login** – hệ thống đăng nhập + validation
* **Product Management** – CRUD sản phẩm
* **Frontend:** React 18+
* **Backend:** Spring Boot 3.2+
* **Testing theo TDD:** gồm Unit test, Integration test, Mock test

---

## 1.2 Công nghệ sử dụng

### 1.2.1 Frontend

* React 18+
* React Testing Library
* Jest
* Axios
* CSS3 + Animations

### 1.2.2 Backend

* Spring Boot 3.2+
* Java 17+
* JUnit 5
* Mockito
* Maven
* Spring Data JPA

---

## 1.3 Cấu trúc dự án

```
tetsing/
 |-- frontend/
 |   |-- src/
 |   |-- assets/
 |   |   |-- react.svg
 |   |-- services/
 |   |   |-- authService.ts
 |   |   |-- productService.ts
 |   |-- tests/
 |   |   |-- auth.test.ts
 |   |   |-- authValidation.test.ts
 |   |   |-- Login.integration.test.tsx
 |   |   |-- Login.mock.test.tsx
 |   |   |-- LoginUtils.test.ts
 |   |   |-- LoginValidation.test.tsx
 |   |   |-- Product.mock.test.tsx
 |   |   |-- ProductForm.integration.test.tsx
 |   |   |-- ProductForm.test.tsx
 |   |   |-- productUtils.test.ts
 |   |   |-- productValidation.test.ts
 |   |-- pages/
 |   |   |-- Login.tsx
 |   |   |-- NotFoundPage.tsx
 |   |   |-- Products.tsx
 |   |   |-- Register.tsx
 |   |-- utils/
 |   |   |-- auth.ts
 |   |   |-- loginUtils.ts
 |   |   |-- authValidation.ts
 |   |   |-- loginUtils.ts
 |   |   |-- productUtils.ts
 |   |   |-- productValidation.ts
 |   |   |-- register.ts
 |   |-- App.css
 |   |-- App.jsx
 |   |-- index.css
 |   |-- main.tsx
 |   |-- setupTests.ts
 |
 |-- backend/
 |   |-- backend/
 |   |-- src/
 |   |-- main/
 |   |-- java/come/example/demo/
 |   |   |-- config/
 |   |   |   |-- PasswordConfig.java
 |   |   |-- dto/
 |   |   |   |-- LoginRequest.java
 |   |   |   |-- LoginReponse.java
 |   |   |   |-- ProductDto.java
 |   |   |   |-- RegisterRequest.java
 |   |   |-- controller/
 |   |   |-- entity/
 |   |   |   |-- Product.java
 |   |   |   |-- User.java
 |   |   |-- mapper/
 |   |   |   |-- ProductMapper.java
 |   |   |-- repository/
 |   |   |-- service/
 |   |   |   |-- AuthService.java
 |   |   |   |-- ProductService.java
 |   |   |   |-- JwtService.java
 |   |-- test/
 |   |   |-- java/com/example/demo/
 |   |   |   |-- controller/
 |   |   |   |   |-- AuthControllerMockTest.java
 |   |   |   |   |-- ProductControllerIntegrationTest.java
 |   |   |   |   |-- AuthControllerIntegrationTest.java
 |   |   |   |-- service/
 |   |   |       |-- AuthServiceTest.java
 |   |   |       |-- ProductServiceMockTest.java
 |   |   |       |-- ProductServiceTest.java
 |   |   |-- TestingApplicationTests.java
```

---

---

## 2. Cài đặt

### 2.1 Yêu cầu môi trường

* **Node.js 18+**
* **Java 17+**
* **Maven 3.9+**
* **PostgreSQL / Supabase**

---

## 3. Cách chạy dự án

### 3.1 Chạy Backend (Spring Boot)

1. Vào thư mục backend:

```bash
cd backend/backend
```

2. Chạy lệnh:

   ```bash
mvn spring-boot:run
# hoặc
./mvnw spring-boot:run
   ```
3. Server chạy tại:

   ```
   http://localhost:8080
   ```

---

### 3.2 Chạy Frontend (React + Vite)

1. Vào thư mục frontend:

```bash
cd frontend
```

2. Cài package:

   ```bash
   npm install
   ```
3. Chạy dự án:

   ```bash
   npm run dev
   ```
4. Truy cập giao diện web tại:

   ```
   http://localhost:5173
   ```

---

### 3.3 Chạy Cypress (E2E Test)

1. Vào thư mục frontend:

```bash
cd frontend
```
2. Chạy:

   ```bash
   npx cypress open
# hoặc
   npm run test:e2e
   ```
   
   
3. Chọn **E2E** và chạy test.

---

## 3.4 Chạy Test

### Frontend (React + Jest + RTL)

1. Vào thư mục frontend:

```bash
cd frontend
```
2. Chạy lệnh:

   ```bash
   npm run test
   ```

---

### Backend (Spring Boot + JUnit + Mockito)

1. Vào thư mục backend:

```bash
cd backend/backend
```
2. Chạy lệnh:

   ```bash
   mvn test
   ```

---
