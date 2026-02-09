import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BQMusicLogo from "../../components/common/BQMusicLogo";
import '../auth/css/Login.css';
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Steps: 1 = Email, 2 = OTP, 3 = Details
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Step 1: Email
    const [email, setEmail] = useState("");

    // Step 2: OTP
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(90); // 90 seconds
    const [canResend, setCanResend] = useState(false);

    // Step 3: Details
    const [form, setForm] = useState({
        name: "",
        password: "",
        rePassword: "",
    });

    // Timer logic for OTP
    useEffect(() => {
        let interval = null;
        if (step === 2 && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timeLeft]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await userService.sendOtpRegister(email);
            if (response && response.success) {
                setStep(2);
                setTimeLeft(90);
                setCanResend(false);
            } else {
                if (response.code === "E001") {
                    setErrorMessage("Invalid Email format or Email already exists.");
                } else {
                    setErrorMessage(response.message || "Failed to send OTP.");
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await userService.verifyOtpRegister(email, otp);
            if (response && response.success) {
                setStep(3);
            } else {
                setErrorMessage(response.message || "Invalid OTP.");
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Failed to verify OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.rePassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const userData = {
                ...form,
                email: email
            };

            const response = await userService.register(userData);

            if (response && response.success) {
                setSuccessMessage("Registration successful! Logging in...");

                // Auto Login
                try {
                    const loginRes = await axios.post(
                        "http://localhost:8080/api/v1/auth",
                        { email: email, password: form.password },
                        {
                            headers: { "Content-Type": "application/json" },
                            withCredentials: true,
                        }
                    );

                    const { token, refreshToken, role, idUser, email: resEmail } = loginRes.data;

                    login({
                        token,
                        refreshToken,
                        role: role,
                        idUser,
                        email: resEmail || email
                    });

                    // Redirect based on role or to home
                    setTimeout(() => {
                        if (role && role.includes("ADMIN")) {
                            navigate("/admin");
                        } else {
                            navigate("/user");
                        }
                    }, 1000);

                } catch (loginErr) {
                    console.error("Auto login failed", loginErr);
                    setSuccessMessage("Registration successful! Please login manually.");
                    setTimeout(() => navigate("/login"), 2000);
                }

            } else {
                setErrorMessage(response.message || "Registration failed.");
            }

        } catch (err) {
            console.error(err);
            setErrorMessage("Registration failed due to server error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const response = await userService.sendOtpRegister(email);
            if (response && response.success) {
                setTimeLeft(90);
                setCanResend(false);
                setSuccessMessage("OTP Resent!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setErrorMessage(response.message || "Failed to resend OTP.");
            }
        } catch (err) {
            setErrorMessage("Failed to resend OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="instagram-login-container">
            <div className="instagram-login-content">
                {/* Left Side */}
                <div className="welcome-section">
                    <div className="instagram-logo">
                        <BQMusicLogo />
                    </div>
                    <h1 className="welcome-title">
                        Join the <span className="highlight-text">Community</span> today.
                    </h1>
                </div>

                {/* Right Side */}
                <div className="login-section">
                    <div className="login-card">
                        <h2 className="login-title">
                            {step === 1 && "Create Account"}
                            {step === 2 && "Enter OTP"}
                            {step === 3 && "Finalize Account"}
                        </h2>

                        {errorMessage && (
                            <div className="alert-message alert-error">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="alert-message alert-success">
                                {successMessage}
                            </div>
                        )}

                        {/* Step 1: Email Input */}
                        {step === 1 && (
                            <form onSubmit={handleEmailSubmit} className="login-form">
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="login-button" disabled={isLoading}>
                                    {isLoading ? 'Sending OTP...' : 'Next'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <form onSubmit={handleOtpSubmit} className="login-form">
                                <div className="alert-message alert-success" style={{ marginBottom: '15px' }}>
                                    <div>OTP sent to <strong>{email}</strong></div>
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }}
                                    />
                                </div>

                                <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '14px', color: '#8e8e8e' }}>
                                    {timeLeft > 0 ? (
                                        <span>Resend OTP in {timeLeft}s</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            style={{ border: 'none', background: 'none', color: '#0095f6', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                <button type="submit" className="login-button" disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(""); setErrorMessage(""); }}
                                    style={{ border: 'none', background: 'none', color: '#8e8e8e', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Change Email
                                </button>
                            </form>
                        )}

                        {/* Step 3: User Details */}
                        {step === 3 && (
                            <form onSubmit={handleRegisterSubmit} className="login-form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>



                                <div className="form-group">
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        placeholder="Password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <input
                                        type="password"
                                        name="rePassword"
                                        className="form-input"
                                        placeholder="Confirm Password"
                                        value={form.rePassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button type="submit" className="login-button" disabled={isLoading}>
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>
                        )}

                        <div className="signup-box" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                            Have an account? <button onClick={() => navigate("/login")} style={{ border: 'none', background: 'none', color: '#0095f6', fontWeight: 'bold', cursor: 'pointer' }}>Log in</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
