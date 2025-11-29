export class HomePage {
  getWelcomeText() {
    return cy.get("[data-text='home-welcome']");
  }

  getLogoutButton() {
    return cy.get("[data-text='logout-button']");
  }
//
  clickLogout() {
    this.getLogoutButton().click();
  }
}
