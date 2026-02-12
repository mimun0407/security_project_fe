// UserMenu.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/layout/Header";
// Footer is removed from render as per previous design choice, but keeping import if needed or removing it.
// import Footer from "../../components/layout/Footer"; 
import "./css/Profile.css";

function UserMenu() {
  // 1. Lấy userId từ URL (param name khớp với AppRoutes: userId)
  const params = useParams();

  // Clean up userId if it contains "userId=" prefix
  let userIdFromUrl = params.userId;
  if (userIdFromUrl && userIdFromUrl.startsWith("userId=")) {
    userIdFromUrl = userIdFromUrl.replace("userId=", "");
  }

  const navigate = useNavigate();

  // Lấy idUser từ localStorage (dự phòng)
  const storedIdUser = localStorage.getItem("idUser");

  // Biến định danh chính bây giờ là userId
  const targetId = userIdFromUrl || storedIdUser;

  const [user, setUser] = useState(null);
  console.log("user", user);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ... (state for edit form)
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    isActive: true,
    imageFile: null,
    imagePreview: null,
  });

  // ... (getImageUrl helper)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:8080${imageUrl}`;
  };

  // --- FETCH USER INFO ---
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !targetId) {
      console.error("Thiếu token hoặc userId, chuyển về login");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        // Gọi API theo ID
        console.log("Fetching user profile...");
        console.log("targetId:", targetId);

        const res = await axios.get(`http://localhost:8080/api/v1/user/userId/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Check if data is wrapped in a 'data' property
        const responseData = res.data;
        const data = responseData.data || responseData;

        console.log("User Data:", data);
        setUser(data);

        setForm((f) => ({
          ...f,
          name: data.name || "",
          email: data.email || "",
          isActive: data.isActive ?? true,
          imagePreview: getImageUrl(data.imageUrl),
        }));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.userId, navigate, targetId]);

  // --- FETCH POSTS ---
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingPosts(true);
      try {
        // User requested to remove/check this. 
        // "posts/my" fetches current user's posts, which is wrong for viewing other profiles.
        // Pending correct endpoint for "get posts by user".
        // const res = await axios.get("http://localhost:8080/api/v1/posts/my", {
        //   headers: { Authorization: `Bearer ${token}` },
        //   withCredentials: true,
        // });
        // setPosts(res.data.content || []);
        setPosts([]); // Set empty for now
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

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        isActive: user.isActive ?? true,
        imageFile: null,
        imagePreview: getImageUrl(user.imageUrl),
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
        imagePreview: getImageUrl(res.data.imageUrl),
      });

      setEditMode(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi khi update user:", err);
      const msg = err?.response?.data?.message || "Cập nhật thất bại";
      alert(msg);
    }
  };

  if (loading) return (
    <div className="soundcloud-profile-container">
      <Header />
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="soundcloud-profile-container">
      <Header />
      <div className="text-center mt-5 pt-5 text-muted">User not found</div>
    </div>
  );

  return (
    <div className="soundcloud-profile-container">
      <Header />
      {/* --- BANNER HEADER --- */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-container">
            <img
              src={getImageUrl(user.imageUrl) || "/placeholder-avatar.png"}
              alt={user.name}
              className="profile-avatar-img"
            />
          </div>

          <div className="profile-info">
            <h2 className="profile-username">{user.name || user.email}</h2>
            {/* {user.name && <div className="profile-fullname">{user.email}</div>} */}
            {/* {user.isActive === false && <span className="badge bg-danger ms-2">Inactive</span>} */}
          </div>

          <div className="header-actions">
            {!editMode && (
              <button className="btn-upload-header">
                <i className="bi bi-camera me-2"></i> Upload Header Image
              </button>
            )}

            <button className="btn-sc btn-sc-secondary" onClick={() => setEditMode(true)}>
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button className="btn-sc btn-sc-primary">
              <i className="bi bi-share"></i> Share
            </button>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="profile-nav">
        <div className="nav-container">
          <div className="nav-tabs-sc">
            <div className="nav-item-sc active">All</div>
            <div className="nav-item-sc">Popular tracks</div>
            <div className="nav-item-sc">Tracks</div>
            <div className="nav-item-sc">Albums</div>
            <div className="nav-item-sc">Playlists</div>
            <div className="nav-item-sc">Reposts</div>
          </div>
          <div className="nav-actions">
            <button className="btn-sc btn-sc-secondary">Station</button>
            <button className="btn-sc btn-sc-secondary">...</button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="profile-content">
        {/* LEFT COLUMN: TRACKS */}
        <div className="content-left">
          <h3 className="section-title">Recent</h3>

          {loadingPosts ? (
            <div className="text-center py-5 text-muted">Loading tracks...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Hasn't uploaded any sounds yet.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="track-item-card">
                <div className="track-artwork">
                  <img
                    src={getImageUrl(post.imageUrl) || "/placeholder-cover.png"}
                    alt="Artwork"
                  />
                </div>
                <div className="track-info">
                  <div className="track-header">
                    <button className="btn-play-circle">
                      <i className="bi bi-play-fill" style={{ fontSize: '24px' }}></i>
                    </button>
                    <div className="track-meta">
                      <span className="track-artist">{post.authorName || user.name}</span>
                      <span className="track-title">{post.content || "Untitled Track"}</span>
                    </div>
                    <div className="ms-auto text-muted small">
                      {post.createdAt || "1 year ago"}
                    </div>
                  </div>

                  {/* Fake Waveform */}
                  <div className="waveform-container" style={{ flex: 1, display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                    {/* Placeholder visual */}
                    <div style={{ height: '40px', width: '100%', background: 'url(https://i.imgur.com/8Q5F5kC.png) repeat-x', backgroundSize: 'contain' }}></div>
                  </div>

                  <div className="track-footer">
                    <span><i className="bi bi-heart-fill me-1"></i> {post.likes || 0}</span>
                    <span><i className="bi bi-arrow-repeat me-1"></i> {post.shares || 0}</span>
                    <span><i className="bi bi-play me-1"></i> {post.views || 0}</span>
                    <button className="btn-sc btn-sc-secondary ms-auto btn-sm">More</button>
                  </div>

                  {post.musicLink && (
                    <div className="mt-2">
                      <audio controls style={{ height: '30px', width: '100%' }}>
                        <source src={`http://localhost:8080${post.musicLink}`} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="content-right">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Followers</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Following</span>
              <span className="stat-value">4</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tracks</span>
              <span className="stat-value">{posts.length}</span>
            </div>
          </div>

          <div className="sidebar-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small text-uppercase">Likes</span>
              <span className="text-muted small cursor-pointer">View all</span>
            </div>
            <div className="likes-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="like-item-placeholder"></div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="text-muted small text-uppercase mb-2">Legal • Privacy • Cookies</div>
          </div>
        </div>
      </div>

      {/* --- EDIT FORM MODAL --- */}
      {editMode && (
        <div className="edit-form-overlay">
          <div className="edit-form-card">
            <h4 className="mb-4">Edit Profile</h4>
            <div className="mb-3 text-center">
              <div className="mb-2">
                <img src={form.imagePreview || "/placeholder-avatar.png"} alt="Preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <label className="btn btn-sm btn-outline-secondary">
                Upload New Image
                <input type="file" hidden accept="image/*" onChange={onSelectImage} />
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => onChangeField("name", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password (Optional)</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => onChangeField("password", e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;