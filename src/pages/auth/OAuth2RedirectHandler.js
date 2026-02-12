// src/pages/auth/OAuth2RedirectHandler.js
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processLogin = async () => {
      // 1. Phân tích tham số URL
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const refreshToken = params.get("refreshToken");
      const error = params.get("error");
      const emailParam = params.get("email");

      // 2. Xử lý lỗi từ Backend trả về (nếu có)
      if (error) {
        console.error("Lỗi OAuth2:", error);
        alert("Đăng nhập Google thất bại: " + error);
        navigate("/login");
        return;
      }

      // 3. Kiểm tra token
      if (token && refreshToken) {
        try {
          // 4. GỌI API LẤY THÔNG TIN USER ĐỂ XÁC THỰC
          // Dùng token vừa nhận được để gọi API
          // Email có thể lấy từ param hoặc đợi response từ API user

          let targetEmail = emailParam;

          // Nếu không có email trên param, ta vẫn thử gọi endpoint user (nếu backend hỗ trợ /me)
          // Nhưng ở đây ta giả sử backend trả về email trên URL hoặc ta cần nó để gọi API /user/{email}

          if (!targetEmail) {
            throw new Error("Không tìm thấy email trong phản hồi OAuth2");
          }

          const userRes = await axios.get(`http://localhost:8080/api/v1/user/${targetEmail}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const userData = userRes.data;

          if (!userData || !userData.email) {
            throw new Error("Không lấy được thông tin người dùng");
          }

          console.log("Xác thực người dùng thành công:", userData);

          // 5. Login qua Context với thông tin đầy đủ
          login({
            token,
            refreshToken,
            role: userData.role || ["USER"], // Fallback role
            idUser: userData.idUser || userData.email, // Đảm bảo có idUser
            email: userData.email
          });

          // 6. Chuyển hướng
          const roles = userData.role || [];
          if (roles.includes("ADMIN")) {
            navigate("/admin");
          } else {
            navigate("/newF");
          }

        } catch (err) {
          console.error("Lỗi xác thực người dùng sau khi OAuth2:", err);
          // Fallback: Proceed with params from URL if fetch fails
          // This allows the user to at least get into the app, even if profile loading might fail later.
          login({
            token,
            refreshToken,
            role: ["USER"], // Fallback role if not in params/fetched
            idUser: emailParam,
            email: emailParam
          });

          navigate("/newF");
        }
      } else {
        console.error("Thiếu token từ Google");
        navigate("/login");
      }
    };

    processLogin();
  }, [location, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <div className="spinner" style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <h3 style={{ color: '#262626', fontWeight: '600' }}>Đang xử lý đăng nhập...</h3>
    </div>
  );
};

export default OAuth2RedirectHandler;