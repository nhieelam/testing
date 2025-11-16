export class HomePage {
  getWelcomeText() {
    return cy.get("[data-test='home-welcome']");
  }

  getLogoutButton() {
    return cy.get("[data-test='logout-button']");
  }

  clickLogout() {
    this.getLogoutButton().click();
  }
}
