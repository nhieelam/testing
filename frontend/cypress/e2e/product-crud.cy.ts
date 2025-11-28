import { ProductListPage } from "./pages/products/ProductListPage";
import { ProductFormPage } from "./pages/products/ProductFormPage";

const listPage = new ProductListPage();
const formPage = new ProductFormPage();

const baseProducts = [
  { id: "1", name: "Coca Cola", description: "", price: 15000, stockQuantity: 10, status: "ACTIVE" },
  { id: "2", name: "Pepsi", description: "", price: 14000, stockQuantity: 20, status: "ACTIVE" },
];

describe("Product - E2E CRUD Scenarios", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((w) => {
      w.sessionStorage.setItem("token", "fake-token");
      w.sessionStorage.setItem("username", "lam123");
      w.sessionStorage.setItem("isAuthenticated", "true");
    });

    // mock API get products để luôn có data ổn định
    let products = [...baseProducts];

    cy.intercept("GET", "**/api/products", (req) => {
      req.reply({
        statusCode: 200,
        body: products,
      });
    }).as("getProducts");

    cy.intercept("POST", "**/api/products", (req) => {
      const newId = String(products.length + 1);
      const created = {
        id: newId,
        name: req.body.name,
        description: req.body.description ?? "",
        price: Number(req.body.price),
        stockQuantity: Number(req.body.stockQuantity),
        status: req.body.status ?? "ACTIVE",
      };
      products.push(created);
      req.reply({
        statusCode: 201,
        body: created,
      });
    }).as("createProduct");

    cy.intercept("PUT", "**/api/products/*", (req) => {
      const id = req.url.split("/").pop() || "";
      products = products.map((p) =>
        p.id === id
          ? {
              ...p,
              name: req.body.name ?? p.name,
              description: req.body.description ?? p.description,
              price: Number(req.body.price ?? p.price),
              stockQuantity: Number(req.body.stockQuantity ?? p.stockQuantity),
              status: req.body.status ?? p.status,
            }
          : p,
      );
      const updated = products.find((p) => p.id === id)!;
      req.reply({
        statusCode: 200,
        body: updated,
      });
    }).as("updateProduct");

    cy.intercept("DELETE", "**/api/products/*", (req) => {
      const id = req.url.split("/").pop() || "";
      products = products.filter((p) => p.id !== id);
      req.reply({
        statusCode: 204,
        body: null,
      });
    }).as("deleteProduct");

    listPage.visit();
    cy.wait("@getProducts");
  });

  // a) Test Create product flow (0.5 điểm)
  it("a) Create product flow", () => {
    listPage.createButton().click();

    formPage.fillForm({
      name: "Sting Dâu",
      price: 12000,
      quantity: 30,
    });
    formPage.submit();

    cy.wait("@createProduct");

    // quay lại list → kiểm tra row mới xuất hiện
    listPage.rowByName("Sting Dâu").should("exist");
  });

  // b) Test Read/List products (0.5 điểm)
  it("b) Read/List products", () => {
    // đã load data ở beforeEach
    listPage.rows().should("have.length", baseProducts.length);
    listPage.rowByName("Coca Cola").should("exist");
    listPage.rowByName("Pepsi").should("exist");
  });

  it("c) Update product", () => {
    listPage.editButtonFor("Coca Cola").click();

    listPage.inlinePriceInput("Coca Cola").clear().type("18000");
    listPage.inlineSaveButton("Coca Cola").click();

    cy.wait("@updateProduct");

    // kiểm tra UI đã update giá mới
    listPage
      .rowByName("Coca Cola")
      .should("contain", "18000");
  });

  // d) Test Delete product (0.5 điểm)
  it("d) Delete product", () => {
    // Xác nhận dialog trình duyệt
    cy.on("window:confirm", () => true);

    listPage.deleteButtonFor("Pepsi").click();

    cy.wait("@deleteProduct");

    listPage.rowByName("Pepsi").should("not.exist");
  });

  // e) Test Search/Filter functionality (0.5 điểm)
  it("e) Search / Filter products", () => {
    // gõ 'coca' → chỉ còn hàng Coca Cola
    listPage.search("coca");

    listPage.rows().should("have.length", 1);
    listPage.rowByName("Coca Cola").should("exist");
    listPage.rowByName("Pepsi").should("not.exist");
  });
});
