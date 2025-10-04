import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

function AdminMenu() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    isActive: true,
    password: "",
  });
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  // load danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/v1/user", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUsers(response.data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải user:", error);
      }
    };
    fetchUsers();
  }, []);

  // Xem chi tiết user
  const handleRead = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/v1/user/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSelectedUser(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Lỗi khi xem chi tiết:", error);
    }
  };

  // Update user (load dữ liệu vào form)
  const handleUpdate = (user) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      password: "",
    });
    setImage(null);
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  // Submit update
  const submitUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("name", formData.name);
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("isActive", formData.isActive);
      if (formData.password) form.append("password", formData.password);
      if (image) form.append("image", image);

      await axios.put(
        `http://localhost:8080/api/v1/user/${selectedUser.username}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      alert("Cập nhật thành công!");
      setShowUpdateModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi update:", error);
    }
  };

  // Delete user
  const handleDelete = async (username) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/v1/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert("Xóa thành công!");
      setUsers(users.filter((u) => u.username !== username));
    } catch (error) {
      console.error("Lỗi khi xóa user:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="container mt-4">
        {/* Tiêu đề + Nút */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Quản lý người dùng</h2>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => navigate("/createUser")}
            >
              <i className="bi bi-person-plus me-1"></i> Tạo User
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/history")}
            >
              <i className="bi bi-clock-history me-1"></i> Lịch sử
            </button>
          </div>
        </div>

        {/* Danh sách user */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td style={{ width: "80px" }}>
                    {user.imageUrl ? (
                      <img
                        src={`http://localhost:8080${user.imageUrl}`}
                        alt={user.username}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.roles && user.roles.length > 0
                      ? user.roles.join(", ")
                      : "No Role"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleRead(user.username)}
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleUpdate(user)}
                      title="Chỉnh sửa"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.username)}
                      title="Xóa"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {showDetailModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết người dùng</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>
                  <b>Tên:</b> {selectedUser.name}
                </p>
                <p>
                  <b>Username:</b> {selectedUser.username}
                </p>
                <p>
                  <b>Email:</b> {selectedUser.email}
                </p>
                <p>
                  <b>Roles:</b>{" "}
                  {selectedUser.roles?.length > 0
                    ? selectedUser.roles.join(", ")
                    : "No Role"}
                </p>
                <p>
                  <b>Trạng thái:</b>{" "}
                  {selectedUser.isActive ? "Hoạt động" : "Khoá"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal update */}
      {showUpdateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật User</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowUpdateModal(false)}
                />
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label>Tên</label>
                    <input
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label>Password (mới)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label>Ảnh đại diện</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Trạng thái</label>
                    <select
                      className="form-control"
                      value={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "true",
                        })
                      }
                    >
                      <option value={true}>Hoạt động</option>
                      <option value={false}>Khoá</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Đóng
                </button>
                <button className="btn btn-primary" onClick={submitUpdate}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default AdminMenu;
