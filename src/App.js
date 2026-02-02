import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axiosClient from "./axiosClient";

import List from "./List";
import Login from "./Login";
import UserMenu from "./UserMenu";
import AdminMenu from "./AdminMenu";
import History from "./History";
import CreateUser from "./CreateUser";
import NewFeed from "./NewFeed";

function AppRoutes() {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   axiosClient
  //     .get("/auth/me")
  //     .then((res) => {
  //       const roles = res.data.roles;
  //       localStorage.setItem("roles", JSON.stringify(roles));

  //       if (roles.includes("ADMIN")) {
  //         navigate("/admin");
  //       } else {
  //         navigate("/user");
  //       }
  //     })
  //     .catch(() => {
  //       // interceptor đã xử lý
  //     });
  // }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/list" element={<List />} />
      <Route path="/admin" element={<AdminMenu />} />
      <Route path="/user" element={<UserMenu />} />
      <Route path="/history" element={<History />} />
      <Route path="/createUser" element={<CreateUser />} />
      <Route path="/newF" element={<NewFeed />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}