// cypress/e2e/pages/LoginPage.ts
export class LoginPage {
  visit() {
    cy.visit("/login");
  }

  emailInput() {
    return cy.get('[data-text="login-username"]');       // chỉnh theo code của bạn
  }

  passwordInput() {
    return cy.get('[data-text="login-password"]');
  }

  submitButton() {
    return cy.get('[data-text="login-submit"]');
  }

  rememberMeCheckbox() {
    return cy.get('[data-text="login-remember"]');
  }

  showPasswordButton() {
    return cy.get('[data-text="toggle-password"]');
  }

  errorMessage() {
    return cy.get('[data-text="login-error"]');
  }

  validationMessage(field: "email" | "password") {
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
