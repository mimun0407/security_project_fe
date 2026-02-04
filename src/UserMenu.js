// UserMenu.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

function UserMenu() {
  // 1. Đổi cách lấy tham số: Ưu tiên lấy email
  const { email: paramEmail } = useParams(); 
  const navigate = useNavigate();
  
  // Lấy email từ localStorage
  const storedEmail = localStorage.getItem("email"); 
  
  // Biến định danh chính bây giờ là email
  const userEmail = paramEmail || storedEmail;

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

  // ✅ HÀM HELPER XỬ LÝ URL ẢNH
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Nếu là URL đầy đủ (http/https) từ Google thì dùng luôn
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Nếu là đường dẫn local thì ghép với localhost
    return `http://localhost:8080${imageUrl}`;
  };

  // --- FETCH USER INFO ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token || !userEmail) {
      console.error("Thiếu token hoặc email, chuyển về login");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/user/${userEmail}`, {
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
          imagePreview: getImageUrl(data.imageUrl), // ✅ Sử dụng hàm helper
        }));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [paramEmail, navigate, userEmail]);

  // --- FETCH POSTS ---
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

  // cleanup preview URL
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
        imagePreview: getImageUrl(user.imageUrl), // ✅ Sử dụng hàm helper
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

      const payload = {
        name: form.name,
        username: user.username, 
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

      await axios.put(`http://localhost:8080/api/v1/user/${user.email}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // Fetch lại user sau khi update
      const res = await axios.get(`http://localhost:8080/api/v1/user/${user.email}`, {
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
        imagePreview: getImageUrl(res.data.imageUrl), // ✅ Sử dụng hàm helper
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
                  src={form.imagePreview || "/placeholder-avatar.png"} // ✅ Đã xử lý qua getImageUrl trong form
                  alt="User Avatar"
                  className="rounded-circle shadow-sm mb-3"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <h4 className="mb-3">{user.name || user.email}</h4>
              </div>

              {editMode ? (
                <>
                  <div className="mb-2">
                    <label className="form-label">Tên hiển thị</label>
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
                      disabled
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
                    <label className="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      placeholder="Để trống nếu không đổi"
                      onChange={(e) => onChangeField("password", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ảnh đại diện</label>
                    <input type="file" accept="image/*" className="form-control" onChange={onSelectImage} />
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
                    <b>👤 Tên:</b> {user.name}
                  </p>
                  <p>
                    <b>📧 Email:</b> {user.email}
                  </p>
                  <p>
                    <b>⚡ Trạng thái:</b> {user.isActive ? "Đang hoạt động" : "Bị khóa"}
                  </p>

                  <div className="d-grid gap-2">
                    <button className="btn btn-warning" onClick={handleEditClick}>
                      Sửa thông tin
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
                          <div className="d-flex align-items-center mb-3">
                            <img
                              src={getImageUrl(post.authorAvatar) || "/placeholder-avatar.png"} // ✅ Sử dụng hàm helper
                              alt={post.authorName}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <div>
                              <strong>{post.authorName}</strong>
                              <div className="text-muted small">{post.createdAt || "Vừa xong"}</div>
                            </div>
                          </div>

                          {post.content && (
                            <p className="mb-3">{post.content}</p>
                          )}

                          {post.imageUrl && (
                            <img
                              src={getImageUrl(post.imageUrl)} // ✅ Sử dụng hàm helper
                              alt="Post"
                              className="img-fluid rounded mb-3"
                              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                            />
                          )}

                          {post.musicLink && (
                            <div className="mb-3">
                              <audio controls className="w-100">
                                <source src={`http://localhost:8080${post.musicLink}`} type="audio/mpeg" />
                                Trình duyệt của bạn không hỗ trợ phát nhạc.
                              </audio>
                            </div>
                          )}

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