// cypress/e2e/pages/products/ProductListPage.ts

export class ProductListPage {
  visit() {
    cy.visit("/products");   // chỉnh lại route đúng với app của bạn
  }

  // Table / list
  rows() {
    return cy.get('[data-text="product-row"]');
  }

  rowByName(name: string) {
    // Tìm cell chứa tên, sau đó lấy ra cả dòng (tr) tương ứng
    return cy
      .contains('[data-text="product-row"] td, [data-text="product-row"] th', name)
      .closest('[data-text="product-row"]');
  }

  // Buttons / actions
  createButton() {
    return cy.get('[data-text="product-create-button"]');
  }

  editButtonFor(name: string) {
    return this.rowByName(name).find('[data-text="product-edit-button"]');
  }

  deleteButtonFor(name: string) {
    // Tìm đúng row chứa tên, rồi tìm nút xóa trong dòng đó
    return cy
      .contains('[data-text="product-row"] td, [data-text="product-row"] th', name)
      .closest('[data-text="product-row"]')
      .find('[data-text="product-delete-button"]');
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
