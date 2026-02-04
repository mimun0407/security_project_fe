import { BrowserRouter, Routes, Route } from "react-router-dom";
import List from "./List";
import Login from "./Login";
import UserMenu from "./UserMenu";
import AdminMenu from "./AdminMenu";
import History from "./History";
import CreateUser from "./CreateUser";
import NewFeed from "./NewFeed";
import OAuth2RedirectHandler from "./OAuth2RedirectHandler";
import PrivateRoute from "./PrivateRoute"; 

function AppRoutes() {
  return (
    <Routes>
      {/* --- CÁC ROUTE CÔNG KHAI (KHÔNG CẦN LOGIN) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/createUser" element={<CreateUser />} />
      <Route path="/oauth2/callback" element={<OAuth2RedirectHandler />} />

      {/* --- CÁC ROUTE CẦN ĐĂNG NHẬP (PROTECTED ROUTES) --- */}
      {/* Bọc tất cả các route cần bảo vệ vào trong PrivateRoute */}
      <Route element={<PrivateRoute />}>
          <Route path="/list" element={<List />} />
          <Route path="/admin" element={<AdminMenu />} />
          <Route path="/user" element={<UserMenu />} />
          <Route path="/history" element={<History />} />
          <Route path="/newF" element={<NewFeed />} />
      </Route>

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