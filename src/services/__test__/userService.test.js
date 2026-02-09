import axiosClient from "../axiosClient";
import userService from "../userService";

jest.mock("../axiosClient");

describe("userService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("sendOtpRegister", () => {
        it("should call axiosClient.post with correct email", async () => {
            const email = "test@example.com";
            const mockResponse = { data: { success: true, message: "OTP sent" } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await userService.sendOtpRegister(email);

            expect(axiosClient.post).toHaveBeenCalledWith(`/user/send-otp?email=${email}`);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe("verifyOtpRegister", () => {
        it("should call axiosClient.post with correct email and otp", async () => {
            const email = "test@example.com";
            const otp = "123456";
            const mockResponse = { data: { success: true, message: "OTP verified" } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await userService.verifyOtpRegister(email, otp);

            expect(axiosClient.post).toHaveBeenCalledWith(`/user/verifi?email=${email}&otp=${otp}`);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe("register", () => {
        it("should call axiosClient.post with user data", async () => {
            const userData = {
                name: "Test User",
                password: "password123",
                rePassword: "password123",
                email: "test@example.com"
            };
            const mockResponse = { data: { success: true, message: "Register success" } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await userService.register(userData);

            expect(axiosClient.post).toHaveBeenCalledWith("/user", userData);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe("sendOtpForgot", () => {
        it("should call axiosClient.post with correct email", async () => {
            const email = "test@example.com";
            const mockResponse = { data: { success: true, message: "OTP sent" } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await userService.sendOtpForgot(email);

            expect(axiosClient.post).toHaveBeenCalledWith(`/user/send-otp-fp?email=${email}`);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe("verifyOtpForgot", () => {
        it("should call axiosClient.post with correct email and otp", async () => {
            const email = "test@example.com";
            const otp = "123456";
            const mockResponse = { data: { success: true, message: "OTP verified" } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await userService.verifyOtpForgot(email, otp);

            expect(axiosClient.post).toHaveBeenCalledWith(`/user/confirm-otp-fp?email=${email}&otp=${otp}`);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
