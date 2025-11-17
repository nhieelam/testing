// cypress/e2e/pages/products/ProductFormPage.ts

export class ProductFormPage {
  nameInput() {
    return cy.get('[data-text="product-name-input"]');
  }

  priceInput() {
    return cy.get('[data-text="product-price-input"]');
  }

  quantityInput() {
    return cy.get('[data-text="product-quantity-input"]');
  }

  submitButton() {
    return cy.get('[data-text="product-submit-button"]');
  }

  cancelButton() {
    return cy.get('[data-text="product-cancel-button"]');
  }

  validationMessage(field: "name" | "price" | "quantity") {
    return cy.get(`[data-text="product-${field}-error"]`);
  }

  fillForm(data: {
    name?: string;
    price?: string | number;
    quantity?: string | number;
  }) {
    if (data.name !== undefined) {
      this.nameInput().clear().type(String(data.name));
    }
    if (data.price !== undefined) {
      this.priceInput().clear().type(String(data.price));
    }
    if (data.quantity !== undefined) {
      this.quantityInput().clear().type(String(data.quantity));
    }
  }

  submit() {
    this.submitButton().click();
  }
}
