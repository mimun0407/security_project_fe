import axiosClient from "./axiosClient";

const userService = {
    /**
     * Send OTP for forgot password
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    sendOtpForgot: async (email) => {
        // API endpoint: /user/send-otp-fp?email=...
        // Note: Using params for clearer query string handling, or direct string interpolation
        const response = await axiosClient.post(`/user/send-otp-fp?email=${email}`);
        return response.data;
    },

    /**
     * Verify OTP for forgot password
     * @param {string} email 
     * @param {string} otp 
     * @returns {Promise<Object>} Response data
     */
    verifyOtpForgot: async (email, otp) => {
        // API endpoint: /user/confirm-otp-fp?email=...&otp=...
        const response = await axiosClient.post(`/user/confirm-otp-fp?email=${email}&otp=${otp}`);
        return response.data;
    },

    /**
     * Send OTP for registration
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    sendOtpRegister: async (email) => {
        // API endpoint: /user/send-otp?email=...
        const response = await axiosClient.post(`/user/send-otp?email=${email}`);
        return response.data;
    },

    /**
     * Verify OTP for registration
     * @param {string} email 
     * @param {string} otp 
     * @returns {Promise<Object>} Response data
     */
    verifyOtpRegister: async (email, otp) => {
        // API endpoint: /user/verifi?email=...&otp=...
        const response = await axiosClient.post(`/user/verifi?email=${email}&otp=${otp}`);
        return response.data;
    },

    /**
     * Register new user
     * @param {Object} userData { name, password, rePassword, email }
     * @returns {Promise<Object>} Response data
     */
    register: async (userData) => {
        // API endpoint: /user
        // userData should match: { "name":..., "password":..., "rePassword":..., "email":... }
        // Note: The previous implementation used FormData and a specific structure. 
        // The user request shows a simple JSON object input:
        // { "name":..., "password":..., "rePassword":..., "email":... }
        // I will follow the user's input sample, but if backend requires FormData/Blob mix, I might need to adjust.
        // Given "phase 1" description, it sends JSON. Let's try sending JSON first as axiosClient is configured for JSON.

        const response = await axiosClient.post("/user", userData);
        return response.data;
    },

    // Placeholder for other user services
};

export default userService;
