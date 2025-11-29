// cypress/e2e/login.cy.ts
import { LoginPage } from "./pages/LoginPage";

const loginPage = new LoginPage();

describe("E2E - Login flow", () => {
  beforeEach(() => {
    // Luôn bắt đầu tại trang login
    loginPage.visit();

    // Clear storage mỗi test
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((w) => {
      w.sessionStorage.clear();
    });
  });

  it("a) Complete login flow with valid credentials", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",  
        userId: "9dc535e3-5565-4db1-9dda-560dabd8131a",
        username: "lam123",
      },
    }).as("loginRequest");

    loginPage.fillForm("lam123", "Password123"); 
    loginPage.submit();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/products");

    // kiểm tra token được lưu trong sessionStorage
    cy.window().then((w) => {
      const token = w.sessionStorage.getItem("token");
      expect(token).to.eq("fake-jwt-token");
    })

    cy.contains("Danh sách sản phẩm").should("be.visible");
  });


  // b) Test validation messages (0.5 điểm)
  it("b1) Hiển thị lỗi khi để trống tên đăng nhập và mật khẩu", () => {
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

  it("b2) Hiển thị lỗi khi tên đăng nhập không hợp lệ", () => {
    loginPage.fillForm("sai-dinh-dang", "Password123");
    loginPage.submit();

    loginPage
      .validationMessage("username")
      .should("be.visible")
      .and("contain", "tên đăng nhập không hợp lệ");
  });

  it("b3) Hiển thị lỗi khi mật khẩu quá ngắn", () => {
    loginPage.fillForm("admin1234", "123");
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải từ 6 đến 100 ký tự");
  });
  
  it("b4) Hiển thị lỗi khi mật khẩu không đúng định dạng", () => {
    loginPage.fillForm("lam123", "123...");
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải chứa cả chữ và số");
  });

  it("b5) Hiển thị lỗi khi mật khẩu quá dài", () => {
    loginPage.fillForm("admin1234", "a".repeat(101));
    loginPage.submit();

    loginPage
      .validationMessage("password")
      .should("be.visible")
      .and("contain", "Mật khẩu phải từ 6 đến 100 ký tự");
  });
  it("c1) Login thành công", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",  
        userId: "9dc535e3-5565-4db1-9dda-560dabd8131a",
        username: "lam123",
      },
    }).as("loginSuccess");

    loginPage.fillForm("lam123", "Password123");
    loginPage.submit();

    cy.wait("@loginSuccess");
    cy.url().should("include", "/products");
  });

  it("c2) Login sai mật khẩu -> hiển thị thông báo lỗi", () => {
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


  // d) Test UI elements interactions (0.5 điểm)
  it("d1) Nút show/hide password hoạt động đúng", () => {
    loginPage.passwordInput().type("Password123");

    // default là password
    loginPage.passwordInput().should("have.attr", "type", "password");

    // click icon show password
    loginPage.showPasswordButton().click();
    loginPage.passwordInput().should("have.attr", "type", "text");

    // click lần nữa để ẩn
    loginPage.showPasswordButton().click();
    loginPage.passwordInput().should("have.attr", "type", "password");
  });
});
