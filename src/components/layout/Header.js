import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../services/axiosClient";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await axiosClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  // ✅ Nếu đang ở trang login thì không hiển thị nút Logout
  const isLoginPage = location.pathname === "/";

  return (
    <header className="bg-dark text-white py-3">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="h3">My Website</h1>
        <nav>
          <ul className="nav">
            {!isLoginPage && (
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light ms-3"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
