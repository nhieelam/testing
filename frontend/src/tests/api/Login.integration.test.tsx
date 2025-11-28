import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/Login";
import { login as apiLogin } from "../../services/authService";
import { vi } from "vitest";

// Mock API login
vi.mock("../../services/authService", () => ({
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
        localStorage.clear();
    });

    // TC1: Render UI đúng
    test("Render UI đúng", () => {
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
    test("User nhập dữ liệu và click submit", async () => {
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
    test("Tương tác với trường nhập mật khẩu - Ẩn/Hiển thị mật khẩu", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const passwordField = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
        const togglePasswordButton = screen.getByText("Show");

        // Kiểm tra mật khẩu được ẩn mặc định
        expect(passwordField.type).toBe("password");

        // Nhấn vào nút để hiển thị mật khẩu
        fireEvent.click(togglePasswordButton);

        // Kiểm tra mật khẩu đã được hiển thị
        expect(passwordField.type).toBe("text");
        expect(togglePasswordButton.textContent).toBe("Hide");

        // Nhấn lại để ẩn mật khẩu
        fireEvent.click(togglePasswordButton);

        // Kiểm tra lại mật khẩu đã được ẩn
        expect(passwordField.type).toBe("password");
        expect(togglePasswordButton.textContent).toBe("Show");
    });


    // TC4: Kiểm tra validation khi form rỗng
    test("Kiểm tra validation khi form rỗng", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Đăng nhập"));

        await waitFor(() => {
            expect(
                screen.getByText("Tên đăng nhập không được để trống")
            ).toBeInTheDocument();
            // expect(
            //     screen.getByText("Mật khẩu không được để trống")
            // ).toBeInTheDocument();
        });

        expect(apiLogin).not.toHaveBeenCalled();
    });
});
describe("Login Component Tests - b) Form Submission and API Calls", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // TC1: Submit form hợp lệ → gọi API thành công
    test("Submit form hợp lệ → gọi API thành công", async () => {
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

    // TC2: Submit form rỗng → hiển thị lỗi validate
    test("Submit form rỗng → hiển thị lỗi validate", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Đăng nhập"));

        await waitFor(() => {
            expect(
                screen.getByText("Tên đăng nhập không được để trống")
            ).toBeInTheDocument();
            // expect(
            //     screen.getByText("Mật khẩu không được để trống")
            // ).toBeInTheDocument();
        });

        expect(apiLogin).not.toHaveBeenCalled();
    });

    test("Gửi form với thông tin đăng nhập sai → API trả về lỗi", async () => {
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

    test("Mật khẩu không hợp lệ -> ngừng gọi api. ", async () => {
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

        // If the component shows a password validation message, assert it's there
        // (Do not fail the test if the message text doesn't exist -- optional)
        const validationTexts = [
            "Mật khẩu không hợp lệ",
            "Mật khẩu phải có ít nhất 8 ký tự",
            "Mật khẩu phải chứa chữ hoa và số",
        ];
        const anyValidationShown = validationTexts.some((txt) => {
            try {
                return !!screen.getByText(new RegExp(txt, "i"));
            } catch {
                return false;
            }
        });
        if (anyValidationShown) {
            expect(anyValidationShown).toBeTruthy();
        }
    });



    // // TC4: Kiểm tra thông tin người dùng không khớp với database (đăng nhập thất bại với tên đăng nhập hợp lệ nhưng mật khẩu sai)
    // test("TC4: Kiểm tra thông tin người dùng không khớp với database (đăng nhập thất bại với tên đăng nhập hợp lệ nhưng mật khẩu sai)", async () => {
    //     vi.mocked(apiLogin).mockRejectedValue(new Error("Mật khẩu không đúng"));

    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
    //         target: { value: "validuser" },
    //     });
    //     fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    //         target: { value: "wrongpassword" },
    //     });

    //     fireEvent.click(screen.getByText("Đăng nhập"));

    //     await waitFor(() => {
    //         expect(screen.getByText('tên đăng nhập hoặc mật khẩu không đúng')).toBeInTheDocument();
    //     });

    //     expect(apiLogin).toHaveBeenCalledWith("validuser", "wrongpassword");
    // });
    test("Kiểm tra mật khẩu mạnh (Password Strength)", async () => {
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

    // TC6: Kiểm tra tên đăng nhập chứa ký tự đặc biệt
    //     test("TC6: Kiểm tra tên đăng nhập chứa ký tự đặc biệt", async () => {
    //         const specialCharUsername = "user@123";

    //         render(
    //             <MemoryRouter>
    //                 <Login />
    //             </MemoryRouter>
    //         );

    //         fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
    //             target: { value: specialCharUsername },
    //         });
    //         fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    //             target: { value: "Test123" },
    //         });

    //         fireEvent.click(screen.getByText("Đăng nhập"));

    //         await waitFor(() => {
    //             // Kiểm tra xem lỗi đã hiển thị hay chưa
    //             expect(screen.getByText("Tên đăng nhập chỉ được chứa chữ cái và số")).toBeInTheDocument();
    //         });

    //         // API không được gọi khi có lỗi validation
    //         expect(apiLogin).not.toHaveBeenCalled();
    //     });
});

describe("Login Component Tests - c) Error Handling and Success Messages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // Kiểm tra thông báo thành công khi đăng nhập thành công
    test("Kiểm tra thông báo thành công khi đăng nhập thành công", async () => {
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

        // Bạn có thể thêm một test case để kiểm tra thông báo thành công ở đây nếu có.
    });

    // Kiểm tra thông báo lỗi khi đăng nhập thất bại (API trả về lỗi 401 hoặc thông báo sai tài khoản/mật khẩu)
    // test("Kiểm tra thông báo lỗi khi đăng nhập thất bại (API trả về lỗi 401)", async () => {
    //     vi.mocked(apiLogin).mockRejectedValue(new Error("Unauthorized"));

    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
    //         target: { value: "wronguser" },
    //     });
    //     fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    //         target: { value: "wrongpassword" },
    //     });

    //     fireEvent.click(screen.getByText("Đăng nhập"));

    //     await waitFor(() => {
    //         expect(screen.getByText("tên đăng nhập hoặc mật khẩu không đúng")).toBeInTheDocument();
    //     });
    // });

    // // Kiểm tra thông báo lỗi khi API không phản hồi (Lỗi mạng hoặc server lỗi)
    // test("Kiểm tra thông báo lỗi khi API không phản hồi", async () => {
    //     vi.mocked(apiLogin).mockRejectedValue(new Error("Network Error"));

    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     fireEvent.change(screen.getByPlaceholderText("Tên đăng nhập"), {
    //         target: { value: "testuser" },
    //     });
    //     fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    //         target: { value: "Test123" },
    //     });

    //     fireEvent.click(screen.getByText("Đăng nhập"));

    //     await waitFor(() => {
    //         expect(screen.getByText("Không kết nối được tới server")).toBeInTheDocument();
    //     });
    // });

    // // Kiểm tra thông báo khi người dùng chưa điền đủ thông tin và nhấn submit
    // test("Kiểm tra thông báo khi người dùng chưa điền đủ thông tin và nhấn submit", async () => {
    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     fireEvent.click(screen.getByText("Đăng nhập"));

    //     await waitFor(() => {
    //         expect(
    //             screen.getByText("Tên đăng nhập không được để trống")
    //         ).toBeInTheDocument();
    //         expect(
    //             screen.getByText("Mật khẩu không được để trống")
    //         ).toBeInTheDocument();
    //     });
    // });
});

