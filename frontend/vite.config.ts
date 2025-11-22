// vitest.config.ts  (hoặc vite.config.ts nếu bạn gộp chung)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';   // hoặc 'tailwindcss/vite' tùy phiên bản

export default defineConfig({
  plugins: [
    react({
      // React Compiler (experimental) – giữ nguyên nếu bạn đang dùng
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(), // Tailwind CSS plugin cho Vite
  ],

  // Cấu hình test – quan trọng nhất để hết lỗi vi + globals
  test: {
    globals: true,                    // cho phép dùng vi, test, describe, expect... mà KHÔNG CẦN import
    environment: 'jsdom',             // bắt buộc với React Testing Library
    setupFiles: './src/setupTests.ts', // file bạn đã tạo (chứa @testing-library/jest-dom)

    // Các tùy chọn bổ sung thường dùng (khuyên thêm luôn)
    mockReset: true,               // tự động reset mock giữa các test
    clearMocks: true,                 // tự động clear mocks giữa các test
    restoreMocks: true,               // restore mock về trạng thái gốc
    css: true,                        // hỗ trợ import css trong test (nếu có)
    include: ['**/*.{test,spec}.{ts,tsx}'], // pattern mặc định
    // coverage: { provider: 'v8' },  // nếu bạn dùng coverage sau này thì bật
    deps: {
      optimizer: {
        web: {
          exclude: ['../services/productService'],
        },
      },
    },
  },
});