import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BQMusicLogo from "../../components/common/BQMusicLogo";
import { useAuth } from "../../context/AuthContext";
import '../auth/css/Login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Xử lý Đăng nhập Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  // 2. Xử lý Đăng nhập bằng Form (Email/Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { token, refreshToken, role, idUser, email: resEmail } = response.data;

      // Login via AuthContext
      login({
        token,
        refreshToken,
        role: role,
        idUser,
        email: resEmail || email
      });

      // Navigate based on role
      if (role && role.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      alert("Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="instagram-login-container">
      <div className="instagram-login-content">

        {/* Cột bên trái: Giới thiệu */}
        <div className="welcome-section">
          <div className="instagram-logo">
            <BQMusicLogo />
          </div>
          <h1 className="welcome-title">
            Where Listeners Become <span className="highlight-text">a Community</span>.
          </h1>
        </div>

        {/* Cột bên phải: Form đăng nhập */}
        <div className="login-section">
          <div className="login-card">
            <h2 className="login-title">Log into BQMUSIC</h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="divider-container" style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div className="divider-line" style={{ flex: 1, height: '1px', backgroundColor: '#dbdbdb' }}></div>
              <span className="divider-text" style={{ margin: '0 15px', color: '#8e8e8e', fontWeight: 'bold', fontSize: '13px' }}>OR</span>
              <div className="divider-line" style={{ flex: 1, height: '1px', backgroundColor: '#dbdbdb' }}></div>
            </div>

            {/* Nút Đăng nhập Google */}
            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#385185'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
                <path d="M23 12.27c0-.76-.07-1.49-.2-2.19H12v4.15h6.18c-.27 1.4-1.09 2.59-2.31 3.38l3.66 2.84C21.46 18.7 23 15.8 23 12.27z" fill="#4285F4" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09L2.18 7.07C1.43 8.55 1 10.22 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 23c2.97 0 5.45-.98 7.27-2.65l-3.66-2.84c-1.02.69-2.32 1.09-3.61 1.09-2.86 0-5.29-1.93-6.16-4.53l-3.66 2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              </svg>
              Log in with Google
            </button>

            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ display: 'block', textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#00376b', textDecoration: 'none', cursor: 'pointer' }}>
              Forgot password?
            </a>

            <div className="signup-box" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
              Don't have an account? <button onClick={() => navigate("/register")} style={{ border: 'none', background: 'none', color: '#0095f6', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;