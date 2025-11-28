// cypress/e2e/security.cy.ts

// Thay lại URL cho đúng backend của bạn
const API_BASE_URL = 'http://localhost:8080/api';

function loginAndGetToken() {
  // đổi email/username + password cho đúng user thật của bạn
  const body = {
    username: 'lam123',
    password: 'Password123',
  };

  return cy
    .request({
      method: 'POST',
      url: `${API_BASE_URL}/auth/login`,
      body,
      failOnStatusCode: false,
    })
    .then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('token');
      return res.body.token as string;
    });
}

describe('Security tests', () => {
  // ========= 1) SQL Injection =========
  it('should not allow SQL Injection on login', () => {
    cy.request({
      method: 'POST',
      url: `${API_BASE_URL}/auth/login`,
      failOnStatusCode: false, // để không làm test fail nếu status != 2xx
      body: {
        username: "' OR '1'='1",
        password: 'anything',
      },
    }).then((res) => {
      // Kỳ vọng: không đăng nhập được
      expect([400, 401]).to.include(res.status);
      expect(res.body).not.to.have.property('token');
    });
  });

  // ========= 2) XSS =========
  it('should escape dangerous HTML in product name (prevent XSS)', () => {
    loginAndGetToken().then((token) => {
      const dangerousName = `<script>alert('xss')</script>`;

      // Tạo product với tên có script tag
      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/products`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          name: dangerousName,
          price: 15000,
          description: 'xss test from Cypress',
        },
      }).then((res) => {
        // Tạo sản phẩm vẫn có thể OK,
        // quan trọng là không được execute script khi render
        expect([200, 201]).to.include(res.status);
      });

      // Vào trang products và kiểm tra UI
      cy.visit('http://localhost:3000/products'); // sửa lại cho đúng URL frontend của bạn

      // Nếu app có alert, mình sẽ bắt event window:alert
      let alertCalled = false;
      cy.on('window:alert', () => {
        alertCalled = true;
      });

      // Kiểm tra có hiển thị text HTML, nhưng không chạy script
      cy.contains(dangerousName); // text xuất hiện như chuỗi
      cy.wrap(null).then(() => {
        expect(alertCalled, 'no alert should be triggered').to.equal(false);
      });
    });
  });

  // ========= 3) CSRF-ish / Auth required for state-changing operations =========
  // Với JWT ở header, CSRF chủ yếu là việc không được cho tạo product
  // khi không có Authorization.
  it('should not allow creating product without auth (CSRF / auth required)', () => {
    cy.request({
      method: 'POST',
      url: `${API_BASE_URL}/products`,
      failOnStatusCode: false,
      body: {
        name: 'CSRF Attack Product',
        price: 9999,
      },
    }).then((res) => {
      // Kỳ vọng: backend từ chối vì không có token
      expect([401, 403]).to.include(res.status);
    });
  });

  // ========= 4) Authentication bypass attempts =========
  it('should not allow accessing protected products API without token', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE_URL}/products`,
      failOnStatusCode: false,
    }).then((res) => {
      expect([401, 403]).to.include(res.status);
    });
  });

  it('should not allow accessing protected products API with fake token', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE_URL}/products`,
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer fake.token.here',
      },
    }).then((res) => {
      expect([401, 403]).to.include(res.status);
    });
  });
});
