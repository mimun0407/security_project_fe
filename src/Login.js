import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import './Login.css';
import BQMusicLogo from "./BQMusicLogo";
import Logo from "./Logo";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(role));
      localStorage.setItem("username", username);

      if (role.includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      alert("Đăng nhập thất bại!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="instagram-login-container">
      <div className="instagram-login-content">
        {/* Left Side - Welcome Section */}
        <div className="welcome-section">
          <div className="instagram-logo">
            <BQMusicLogo/>
          </div>
          <h1 className="welcome-title">
            Where Listeners Become <span className="highlight-text">a Community</span>.
          </h1>
          
        </div>

        {/* Right Side - Login Form */}
        <div className="login-section">
          <div className="login-card">
            <h2 className="login-title">Log into BQMUSIC</h2>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Mobile number, username or email"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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

            <a href="#" className="forgot-password">Forgot password?</a>

            <div className="divider-container">
              <div className="divider-line"></div>
            </div>

            <button className="facebook-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Log in with Facebook
            </button>
            <button className="facebook-login">
             <svg width="24" height="24" viewBox="0 0 24 24"> 
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" /> <path d="M23 12.27c0-.76-.07-1.49-.2-2.19H12v4.15h6.18c-.27 1.4-1.09 2.59-2.31 3.38l3.66 2.84C21.46 18.7 23 15.8 23 12.27z" fill="#4285F4" /> <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09L2.18 7.07C1.43 8.55 1 10.22 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
             <path d="M12 23c2.97 0 5.45-.98 7.27-2.65l-3.66-2.84c-1.02.69-2.32 1.09-3.61 1.09-2.86 0-5.29-1.93-6.16-4.53l-3.66 2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /> 
             </svg>
              Log in with Facebook
            </button>
            <button className="create-account">
              Create new account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;