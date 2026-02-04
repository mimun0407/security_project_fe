// UserMenu.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

function UserMenu() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username");
  const username = paramUsername || storedUsername;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // edit state & form
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    isActive: true,
    imageFile: null,
    imagePreview: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !username) {
      console.error("Thiếu token hoặc username, chuyển về login");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const data = res.data;
        setUser(data);

        setForm((f) => ({
          ...f,
          name: data.name || "",
          email: data.email || "",
          isActive: data.isActive ?? true,
          imagePreview: data.imageUrl ? `http://localhost:8080${data.imageUrl}` : null,
        }));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [paramUsername, navigate, username]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingPosts(true);
      try {
        const res = await axios.get("http://localhost:8080/api/v1/posts/my", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPosts(res.data.content || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // cleanup preview URL nếu là object URL
  useEffect(() => {
    return () => {
      if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imagePreview]);

  const onChangeField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview: previewUrl }));
  };

  const handleEditClick = () => setEditMode(true);

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        isActive: user.isActive ?? true,
        imageFile: null,
        imagePreview: user.imageUrl ? `http://localhost:8080${user.imageUrl}` : null,
      });
    }
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        alert("Không có token hoặc user");
        return;
      }

      // JSON phải khớp với UserUpdateRequest
      const payload = {
        name: form.name,
        username: user.username, // bắt buộc vì request có field này
        email: form.email,
        isActive: form.isActive,
        ...(form.password ? { password: form.password } : {}),
      };

      const fd = new FormData();
      fd.append(
        "user",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      if (form.imageFile) {
        fd.append("image", form.imageFile);
      }

      await axios.put(`http://localhost:8080/api/v1/user/${user.username}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const res = await axios.get(`http://localhost:8080/api/v1/user/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(res.data);

      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
        isActive: res.data.isActive ?? true,
        imageFile: null,
        imagePreview: res.data.imageUrl
          ? `http://localhost:8080${res.data.imageUrl}`
          : null,
      });

      setEditMode(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi khi update user:", err);
      const msg = err?.response?.data?.message || "Cập nhật thất bại";
      alert(msg);
    }
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (!user) return <div className="text-center mt-5">Không tìm thấy thông tin user</div>;

  return (
    <>
      <Header />
      <div className="container mt-5">
        <div className="row">
          {/* User Info Card */}
          <div className="col-md-4">
            <div className="card p-4 shadow-lg" style={{ borderRadius: "15px" }}>
              <div className="text-center">
                <img
                  src={form.imagePreview || "/placeholder-avatar.png"}
                  alt="User Avatar"
                  className="rounded-circle shadow-sm mb-3"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <h4 className="mb-3">{user.username}</h4>
              </div>

              {editMode ? (
                <>
                  <div className="mb-2">
                    <label className="form-label">Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => onChangeField("name", e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => onChangeField("email", e.target.value)}
                    />
                  </div>

                  <div className="mb-2 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => onChangeField("isActive", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Kích hoạt tài khoản
                    </label>
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Mật khẩu (để trống nếu không đổi)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(e) => onChangeField("password", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ảnh đại diện</label>
                    <input type="file" accept="image/*" className="form-control" onChange={onSelectImage} />
                    {form.imageFile && <div className="small mt-1">File: {form.imageFile.name}</div>}
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-success" onClick={handleSave}>
                      Lưu
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <b>👤 Username:</b> {user.username}
                  </p>
                  <p>
                    <b>📧 Email:</b> {user.email}
                  </p>
                  <p>
                    <b>⚡ Trạng thái:</b> {user.isActive ? "Đang hoạt động" : "Bị khóa"}
                  </p>

                  <div className="d-grid gap-2">
                    <button className="btn btn-warning" onClick={handleEditClick}>
                      Sửa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="col-md-8">
            <div className="card shadow-lg p-4" style={{ borderRadius: "15px" }}>
              <h4 className="mb-4">📝 Bài viết của tôi ({posts.length})</h4>
              
              {loadingPosts ? (
                <div className="text-center">Đang tải bài viết...</div>
              ) : posts.length === 0 ? (
                <div className="text-center text-muted">Chưa có bài viết nào</div>
              ) : (
                <div className="row g-3">
                  {posts.map((post) => (
                    <div key={post.id} className="col-12">
                      <div className="card shadow-sm" style={{ borderRadius: "10px" }}>
                        <div className="card-body">
                          {/* Post Header */}
                          <div className="d-flex align-items-center mb-3">
                            <img
                              src={post.authorAvatar ? `http://localhost:8080${post.authorAvatar}` : "/placeholder-avatar.png"}
                              alt={post.authorName}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <div>
                              <strong>{post.authorName}</strong>
                              <div className="text-muted small">@{user.username}</div>
                            </div>
                          </div>

                          {/* Post Content */}
                          {post.content && (
                            <p className="mb-3">{post.content}</p>
                          )}

                          {/* Post Image */}
                          {post.imageUrl && (
                            <img
                              src={`http://localhost:8080${post.imageUrl}`}
                              alt="Post"
                              className="img-fluid rounded mb-3"
                              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                            />
                          )}

                          {/* Music Link */}
                          {post.musicLink && (
                            <div className="mb-3">
                              <audio controls className="w-100">
                                <source src={`http://localhost:8080${post.musicLink}`} type="audio/mpeg" />
                                Trình duyệt của bạn không hỗ trợ phát nhạc.
                              </audio>
                            </div>
                          )}

                          {/* Post Footer */}
                          <div className="d-flex align-items-center text-muted">
                            <span className="me-3">
                              ❤️ {post.likes} lượt thích
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserMenu;