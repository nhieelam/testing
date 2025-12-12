import { LoginPage } from "./pages/LoginPage";

const loginPage = new LoginPage();

describe("E2E - Login flow", () => {
  beforeEach(() => {
    loginPage.visit();

    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((w) => {
      w.sessionStorage.clear();
    });
  });

  it("Hiển thị lỗi khi để trống tên đăng nhập và mật khẩu", () => {
    loginPage.submit();

    loginPage
      .validationMessage("username")
      .should("be.visible")
      .and("contain", "Tên đăng nhập không được để trống");
    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu là bắt buộc");
  });

  it("Hiển thị lỗi khi tên đăng nhập không hợp lệ", () => {
    loginPage.fillForm("sai-dinh-dang", "Password123");
    loginPage.submit();

    loginPage
      .validationMessage("username")
      .should("be.visible")
      .and("contain", "tên đăng nhập không hợp lệ");
  });

  it("Hiển thị lỗi khi mật khẩu quá ngắn", () => {
    loginPage.fillForm("admin1234", "123");
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải từ 6 đến 100 ký tự");
  });
  
  it("Hiển thị lỗi khi mật khẩu không đúng định dạng", () => {
    loginPage.fillForm("lam123", "123...");
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải chứa cả chữ và số");
  });

  it("Hiển thị lỗi khi mật khẩu quá dài", () => {
    loginPage.fillForm("admin1234", "a".repeat(101));
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải từ 6 đến 100 ký tự");
  });


  it("Login sai mật khẩu -> hiển thị thông báo lỗi", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: { message: "Invalid username or password" },
    }).as("loginError");

    loginPage.fillForm("lam123", "Wrongpass1");
    loginPage.submit();

    cy.wait("@loginError");

    loginPage
      .errorMessage()
      .should("be.visible")
      .and("contain", "tên đăng nhập hoặc mật khẩu không đúng");
  });


  it("Nút show/hide password hoạt động đúng", () => {
    loginPage.passwordInput().type("Password123");

    loginPage.passwordInput().should("have.attr", "type", "password");

    loginPage.showPasswordButton().click();
    loginPage.passwordInput().should("have.attr", "type", "text");

    loginPage.showPasswordButton().click();
    loginPage.passwordInput().should("have.attr", "type", "password");
  });
});
