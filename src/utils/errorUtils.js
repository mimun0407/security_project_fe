/**
 * Error Codes Mapping
 * Maps backend error codes to user-friendly messages.
 */
export const ERROR_CODES = {
    // AUTH / USER
    AUTH_INVALID_CREDENTIALS: "Mật khẩu không đúng. Vui lòng thử lại.",
    AUTH_NF_001: "Tài khoản không tồn tại.",
    USER_NF_001: "Không tìm thấy người dùng.",
    USER_NF_002: "Người dùng đích không tồn tại.",
    USER_NF_003: "Người dùng của token này không tồn tại.",
    USER_NOT_EXIST: "Người dùng không tồn tại.",
    USER_EXIST_001: "Tên đăng nhập hoặc Email đã tồn tại.",
    ROLE_NF_001: "Lỗi hệ thống: Không tìm thấy quyền mặc định.",
    REFRESH_TOKEN_NF: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
    REFRESH_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    REGISTER_INVALID: "Email chưa được xác thực hoặc phiên đăng ký đã hết hạn.",

    // PASSWORD / OTP / EMAIL
    PASSWORD_INVALID: "Mật khẩu không khớp.",
    PASSWORD_NOT_MATCH: "Mật khẩu nhập lại không khớp.",
    RESET_INVALID: "Phiên đổi mật khẩu không hợp lệ hoặc đã hết hạn.",
    OTP_EXIST: "Vui lòng đợi 90 giây trước khi yêu cầu OTP mới.",
    OTP_INVALID: "Mã xác thực không đúng.",
    OTP_EXPIRED: "Mã xác thực đã hết hạn hoặc không tồn tại.",
    SMS_EXIST: "Vui lòng đợi 90 giây trước khi gửi lại tin nhắn.",
    EMAIL_SEND_FAILED: "Không thể gửi email xác thực. Vui lòng thử lại sau.",

    // SOCIAL
    FOLLOW_SELF_ERR: "Bạn không thể tự theo dõi chính mình.",
    FOLLOW_EXIST_ERR: "Bạn đã theo dõi người dùng này rồi.",
    FOLLOW_RELATION_NF: "Bạn chưa theo dõi người dùng này.",
    POST_NF_001: "Không tìm thấy bài viết.",

    // FILE / SYSTEM
    FILE_UPLOAD_ERR: "Lỗi khi lưu ảnh mới.",
    FILE_UPLOAD_ERR_001: "Lỗi khi lưu ảnh.",
    FILE_UPLOAD_ERR_002: "Lỗi khi lưu file nhạc.",
    FILE_INTEGRITY_ERR: "Lỗi file: Kiểm tra toàn vẹn thất bại.",
    FILE_HASH_ERR: "Lỗi hệ thống: Tính toán mã băm thất bại.",
    FILE_NF_ERR: "Lỗi hệ thống: File ảnh bị thiếu trên server."
};

/**
 * Helper function to extract and map error message from API response
 * @param {Object} error - The error object from axios or try-catch block
 * @param {string} defaultMessage - Fallback message if no specific code is found
 * @returns {string} The user-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.") => {
    if (!error) return defaultMessage;

    // 1. Check for specific error code in response data
    // Assuming backend returns { code: "ERROR_CODE", message: "Dev message" }
    const responseData = error.response?.data;
    const code = responseData?.code || responseData?.errorCode; // Adjust based on actual backend field

    if (code && ERROR_CODES[code]) {
        return ERROR_CODES[code];
    }

    // 2. Fallback to backend message if no code mapping found but message exists
    if (responseData?.message) {
        return responseData.message;
    }

    // 3. Check for specific HTTP status codes if no specific app code
    const status = error.response?.status;
    if (status === 401) return "Phiên đăng nhập hết hạn hoặc thông tin không đúng.";
    if (status === 403) return "Bạn không có quyền thực hiện hành động này.";
    if (status === 500) return "Lỗi hệ thống. Vui lòng thử lại sau.";

    // 4. Default generic message
    return defaultMessage;
};
