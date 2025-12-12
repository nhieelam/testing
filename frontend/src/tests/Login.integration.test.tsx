import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { login as apiLogin } from "../services/authService";
import { vi } from "vitest";

// Mock API login
vi.mock("../services/authService", () => ({
  login: vi.fn(),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component Tests - a) Rendering and User Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC1: Render UI đúng
  test("TC1: UI của form đăng nhập được render đúng", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Đăng nhập tài khoản")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tên đăng nhập")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập")).toBeInTheDocument();
  });

  // TC2: User nhập dữ liệu và click submit
  test("TC2: Người dùng nhập dữ liệu và nhấn nút submit", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const user = screen.getByPlaceholderText("Tên đăng nhập");
    const pass = screen.getByPlaceholderText("••••••••");
    const submit = screen.getByText("Đăng nhập");

    fireEvent.change(user, { target: { value: "testuser" } });
    fireEvent.change(pass, { target: { value: "Test123" } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(submit).toHaveTextContent("Đang đăng nhập...");
    });
  });


  // TC3: Tương tác với trường nhập mật khẩu (tính năng ẩn/hiển thị mật khẩu)
  test("TC3: Kiểm tra tính năng ẩn/hiển thị mật khẩu trong trường nhập", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordField = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
    const togglePasswordButton = screen.getByText("Show");

    expect(passwordField.type).toBe("password");
    fireEvent.click(togglePasswordButton);
    expect(passwordField.type).toBe("text");
    expect(togglePasswordButton.textContent).toBe("Hide");
    fireEvent.click(togglePasswordButton);
    expect(passwordField.type).toBe("password");
    expect(togglePasswordButton.textContent).toBe("Show");
  });


  // TC4: Kiểm tra validation khi form rỗng
  test("TC4: Kiểm tra validation khi form rỗng", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      // expect(
      //     screen.getByText("Tên đăng nhập không được để trống")
      // ).toBeInTheDocument();
      // expect(
      //     screen.getByText("Mật khẩu không được để trống")
      // ).toBeInTheDocument();
      const usernameError = screen.getByText('Tên đăng nhập không được để trống');
      const passwordError = screen.getByText('Mật khẩu là bắt buộc');

      expect(usernameError).toBeInTheDocument();
      expect(passwordError).toBeInTheDocument();
    });

    expect(apiLogin).not.toHaveBeenCalled();
  });
});
describe("Login Component Tests - b) Form Submission and API Calls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC1: Submit form hợp lệ → gọi API thành công
  test("TC1: Gửi form hợp lệ và gọi API đăng nhập thành công", async () => {
    vi.mocked(apiLogin).mockResolvedValue({
      token: "mockToken",
      userId: "123",
      username: "testuser",
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Test123" },
    });

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("testuser", "Test123");
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });
  });


  test("TC2: Kiểm tra khi mật khẩu không hợp lệ -> không gọi API", async () => {
    const invalidPass = "short";
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: invalidPass },
    });

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(apiLogin).not.toHaveBeenCalled();
    });
    expect(screen.getByText(/Mật khẩu phải từ 6 đến 100 ký tự/i)).toBeInTheDocument();
  });



  test("TC3: Kiểm tra mật khẩu mạnh", async () => {
    const strongPassword = "StrongPass@123";

    vi.mocked(apiLogin).mockResolvedValue({
      token: "mockToken",
      userId: "123",
      username: "testuser",
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: strongPassword },
    });

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("testuser", strongPassword);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });
  });

});

describe("Login Component Tests - c) Error Handling and Success Messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Kiểm tra thông báo thành công khi đăng nhập thành công
  test("TC1: Kiểm tra thông báo thành công khi đăng nhập thành công", async () => {
    vi.mocked(apiLogin).mockResolvedValue({
      token: "mockToken",
      userId: "123",
      username: "testuser",
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Test123" },
    });

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });

  });
  test("TC2: Hiển thị thông báo lỗi khi gửi thông tin đăng nhập sai và API trả về lỗi", async () => {
    vi.mocked(apiLogin).mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "WrongPass1" },
    });

    fireEvent.click(screen.getByText("Đăng nhập"));

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("wronguser", "WrongPass1");
      expect(apiLogin).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/tên đăng nhập hoặc mật khẩu không đúng/i)
      ).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

});

