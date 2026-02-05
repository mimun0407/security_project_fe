import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../auth/css/Login.css';

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Gọi API gửi mail reset password
            // Giả định backend endpoint: POST /api/v1/auth/forgot-password or user/forgot-password
            // Hiện tại mock success để demo UI

            // const res = await axios.post("http://localhost:8080/api/v1/auth/forgot-password", { email });

            // Giả lập delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSent(true);
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra! Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="instagram-login-container">
            <div className="instagram-login-content" style={{ display: 'flex', justifyContent: 'center' }}>

                <div className="login-card" style={{ textAlign: 'center', maxWidth: '400px' }}>

                    {/* Lock Icon */}
                    <div style={{ margin: '0 auto 20px', width: '90px', height: '90px', border: '2px solid #000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg aria-label="Lock Icon" color="#000" fill="#000" height="50" role="img" viewBox="0 0 96 96" width="50">
                            <circle cx="48" cy="48" fill="none" r="47" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
                            <path d="M66.098 48.014V34.545a18.098 18.098 0 1 0-36.196 0v13.469" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            <rect fill="none" height="28.098" rx="4" ry="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="45.197" x="25.402" y="48.014"></rect>
                        </svg>
                    </div>

                    <h4 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '10px', color: '#262626' }}>Trouble Logging In?</h4>

                    <p style={{ color: '#8e8e8e', fontSize: '14px', lineHeight: '18px', marginBottom: '25px' }}>
                        Enter your email and we'll send you a link to get back into your account.
                    </p>

                    {!isSent ? (
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

                            <button
                                type="submit"
                                className="login-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Login Link'}
                            </button>
                        </form>
                    ) : (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: '#0095f6', fontSize: '14px', marginBottom: '10px' }}>Email sent!</div>
                            <p style={{ color: '#8e8e8e', fontSize: '14px' }}>Check your email for the link to reset your password.</p>
                        </div>
                    )}

                    <div className="divider-container" style={{ margin: '20px 0' }}>
                        <div className="divider-line" style={{ backgroundColor: '#dbdbdb' }}></div>
                        <span className="divider-text" style={{ padding: '0 10px', backgroundColor: '#fff', color: '#8e8e8e', fontSize: '13px', fontWeight: '600', position: 'relative', top: '-10px' }}>OR</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <button onClick={() => navigate("/register")} style={{ border: 'none', background: 'none', color: '#262626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Create New Account</button>
                    </div>

                    <div style={{ borderTop: '1px solid #dbdbdb', margin: '0 -45px', paddingTop: '15px', backgroundColor: '#fafafa', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                        <button onClick={() => navigate("/login")} style={{ border: 'none', background: 'none', color: '#262626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Back to Login</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
