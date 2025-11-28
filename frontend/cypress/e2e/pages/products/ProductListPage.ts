/// <reference types="cypress" />
// cypress/e2e/pages/products/ProductListPage.ts
declare const cy: any;

export class ProductListPage {
  visit() {
    cy.visit("/products");   // chỉnh lại route đúng với app của bạn
  }

  // Table / list
  rows() {
    return cy.get('[data-text="product-row"]');
  }

  rowByName(name: string) {
    const selector = '[data-text="product-row"]';
    const inputSelector = '[data-text="product-inline-name-input"]';

    return cy
      .get(selector)
      .filter((_, row) => {
        const text = (row.textContent || '').toLowerCase();
        const input = row.querySelector(inputSelector) as HTMLInputElement | null;
        const inputValue = input?.value.toLowerCase() || '';
        return text.includes(name.toLowerCase()) || inputValue.includes(name.toLowerCase());
      })
      .first();
  }

  // Buttons / actions
  createButton() {
    return cy.get('[data-text="product-create-button"]');
  }

  editButtonFor(name: string) {
    return this.rowByName(name).find('[data-text="product-edit-button"]');
  }

  deleteButtonFor(name: string) {
    return this.rowByName(name).find('[data-text="product-delete-button"]');
  }

  inlinePriceInput(name: string) {
    return this.rowByName(name).find('[data-text="product-inline-price-input"]');
  }

  inlineSaveButton(name: string) {
    return this.rowByName(name).find('[data-text="product-inline-save-button"]');
  }

  confirmDeleteButton() {
    return cy.get('[data-text="confirm-delete-button"]');
  }

  // Search / filter
  searchInput() {
    return cy.get('[data-text="product-search-input"]');
  }

  search(name: string) {
    this.searchInput().clear().type(name);
  }
}
