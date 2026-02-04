import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Kiểm tra token trong localStorage
  const token = localStorage.getItem("token");

  // Nếu có token -> Cho phép đi tiếp vào các route con (Outlet)
  // Nếu không -> Chuyển hướng về "/login"
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;