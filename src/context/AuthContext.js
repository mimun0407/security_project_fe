import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../services/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Auth State from LocalStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");
            const email = localStorage.getItem("email");
            const roles = localStorage.getItem("roles");

            if (token && (username || email)) {
                setIsAuthenticated(true);
                // We can optionally fetch fresh user data here if needed
                // For now, restore basic info from what we stored (if any)
                // Or better: Just explicitly fetch user profile if we have a username
                if (username) {
                    try {
                        const res = await axiosClient.get(`/user/${username}`);
                        setUser(res.data);
                    } catch (error) {
                        console.warn("Failed to fetch user profile on init", error);
                        // If token invalid, maybe logout? For now, keep it simple.
                    }
                } else {
                    setUser({ username, email, roles: roles ? JSON.parse(roles) : [] });
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (data) => {
        // data: { token, refreshToken, roles, username, email, ... }
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("roles", JSON.stringify(data.role)); // Note: key is 'role' from backend?
        localStorage.setItem("username", data.username);
        if (data.email) localStorage.setItem("email", data.email);

        setIsAuthenticated(true);
        setUser({
            username: data.username,
            email: data.email,
            roles: data.role
        });
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
        // Optional: Call API to revoke token
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
