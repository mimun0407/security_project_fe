// src/OAuth2RedirectHandler.js
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Phân tích các tham số trên URL
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const roles = params.get("roles");
    const email = params.get("email"); // <--- Backend vừa gửi thêm cái này

    if (token && refreshToken && email) {
      // 2. Lưu vào localStorage (Đúng key "email" mà UserMenu cần)
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", roles); // Lưu dạng chuỗi hoặc parse JSON tùy nhu cầu
      localStorage.setItem("email", email); // QUAN TRỌNG NHẤT

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