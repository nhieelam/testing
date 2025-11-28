import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      apiUrl: "http://localhost:8080/api",
      testUserEmail: "test@example.com",
      testUserPassword: "123456",
    },
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  env: {
    API_URL: "http://localhost:8080/api"
  }
});
