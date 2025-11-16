import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";

const loginPage = new LoginPage();
const homePage = new HomePage();

describe("Login E2E", () => {
  it("Đăng nhập thành công", () => {
    loginPage.visit();
    loginPage.fillEmail("user@test.com");
    loginPage.fillPassword("Password123");
    loginPage.submit();

    homePage.getWelcomeText().should("contain", "Chào mừng");
  });

  it("Hiển thị lỗi khi nhập sai mật khẩu", () => {
    loginPage.visit();
    loginPage.fillEmail("user@test.com");
    loginPage.fillPassword("sai-mk");
    loginPage.submit();

    loginPage.getErrorMessage().should("be.visible");
  });
});
