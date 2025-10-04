import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Check token khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    if (token && roles.length > 0) {
      if (roles.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth",
        {
          username,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { token, refreshToken, role } = response.data;

      // ✅ Lưu token + username vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(role));
      localStorage.setItem("username", username);

      // Điều hướng theo role
      if (role.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      alert("Đăng nhập thất bại!");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: "350px" }}>
          <h3 className="text-center mb-4">Đăng nhập</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Tên đăng nhập
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;