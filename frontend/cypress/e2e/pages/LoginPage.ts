export class LoginPage {
  visit() {
    cy.visit("/login");
  }

  emailInput() {
    return cy.get('[data-text="login-username"]');     
  }

  passwordInput() {
    return cy.get('[data-text="login-password"]');
  }

  submitButton() {
    return cy.get('[data-text="login-submit"]');
  }

  showPasswordButton() {
    return cy.get('[data-text="toggle-password"]');
  }

  errorMessage() {
    return cy.get('[data-text="login-error"]');
  }

  validationMessage(field: "username" | "password") {
    return cy.get(`[data-text="login-${field}-error"]`);
  }

  fillForm(username: string, password: string) {
    this.emailInput().clear().type(username);
    this.passwordInput().clear().type(password);
  }

  submit() {
    this.submitButton().click();
  }
}
