import { ProductListPage } from "./pages/products/ProductListPage";
import { ProductFormPage } from "./pages/products/ProductFormPage";

const listPage = new ProductListPage();
const formPage = new ProductFormPage();

describe("Product - Create / Edit / Delete", () => {
  it("Create product successfully", () => {
    const newProduct = {
      id: "1",
      name: "Coca Cola",
      price: 15000,
      stockQuantity: 10,
      description: "Nước ngọt có gas",
      status: "ACTIVE",
    };

    cy.visit("/");
    cy.window().then((w) => {
      w.sessionStorage.setItem("token", "fake-token");
      w.sessionStorage.setItem("username", "lam123");
      w.sessionStorage.setItem("isAuthenticated", "true");
    });

    let getProductsCall = 0;

    cy.intercept("GET", "**/api/products", (req) => {
      getProductsCall += 1;
      if (getProductsCall === 1) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        req.reply({ statusCode: 200, body: [newProduct] });
      }
    }).as("getProducts");

    cy.intercept("POST", "**/api/products", (req) => {
      req.reply({ statusCode: 201, body: newProduct });
    }).as("createProduct");

    listPage.visit();
    listPage.createButton().click();

    formPage.fillForm({
      name: newProduct.name,
      price: newProduct.price,
      quantity: newProduct.stockQuantity,
    });
    formPage.submit();

    cy.wait("@createProduct");
    cy.wait("@getProducts");

    listPage.rowByName(newProduct.name).should("exist");
  });
});
