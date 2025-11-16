export class LoginPage {
  visit() {
    cy.visit("/login");
  }

  getEmailInput() {
    return cy.get('input[name="email"]');
  }

  getPasswordInput() {
    return cy.get('input[name="password"]');
  }

  getSubmitButton() {
    return cy.get('button[type="submit"]');
  }

  getErrorMessage() {
    return cy.get('[data-test="login-error"]'); // tuỳ selector bạn đặt
  }

  fillEmail(email: string) {
    this.getEmailInput().clear().type(email);
  }

  fillPassword(password: string) {
    this.getPasswordInput().clear().type(password);
  }

  submit() {
    this.getSubmitButton().click();
  }
}
