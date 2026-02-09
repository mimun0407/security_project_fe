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
            const email = localStorage.getItem("email");
            const roles = localStorage.getItem("roles");
            const idUser = localStorage.getItem("idUser");

            if (token && email) {
                setIsAuthenticated(true);
                // We could fetch profile by idUser or email if needed. For now restore from localStorage.
                setUser({
                    email,
                    idUser,
                    roles: roles ? JSON.parse(roles) : []
                });
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (data) => {
        // data: { token, refreshToken, role, idUser, email }
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("roles", JSON.stringify(data.role)); // Backend returns "role" (array), we store as "roles"
        localStorage.setItem("idUser", data.idUser);
        localStorage.setItem("email", data.email);

        setIsAuthenticated(true);
        setUser({
            email: data.email,
            idUser: data.idUser,
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
