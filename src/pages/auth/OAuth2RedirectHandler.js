// src/pages/auth/OAuth2RedirectHandler.js
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // 1. Phân tích các tham số trên URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const roles = params.get("roles");
    const email = params.get("email");

    if (token && refreshToken && email) {
      // 2. Login qua Context
      login({
        token,
        refreshToken,
        role: roles, // Backend trả về string? AuthContext expect mảng/chuỗi tùy logic. Nếu là chuỗi thì OK.
        username: email, // Google login thường dùng email làm username hoặc backend trả về riêng? Tạm dùng email.
        email
      });

      console.log("Login Google thành công, đang chuyển hướng...");

      // 3. Điều hướng dựa trên Role (Logic giống Login thường)
      if (roles && roles.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } else {
      // Nếu thiếu thông tin thì đá về login
      console.error("Thiếu thông tin xác thực từ Google");
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h3>Đang xử lý đăng nhập...</h3>
    </div>
  );
};

export default OAuth2RedirectHandler;