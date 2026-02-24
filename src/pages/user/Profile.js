import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/layout/Sidebar";
import { Settings, Grid, Bookmark, User as UserIcon, Plus, Camera, MessageCircle, Link as LinkIcon, Music } from 'lucide-react';
import "./css/Profile.css";

function UserMenu() {
  const params = useParams();
  const navigate = useNavigate();

  // Handle userId from URL
  let userIdFromUrl = params.userId;
  if (userIdFromUrl && userIdFromUrl.startsWith("userId=")) {
    userIdFromUrl = userIdFromUrl.replace("userId=", "");
  }

  const storedIdUser = localStorage.getItem("idUser");
  const targetId = userIdFromUrl || storedIdUser;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    isActive: true,
    imageFile: null,
    imagePreview: null,
  });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:8080${imageUrl}`;
  };

  // Fetch User
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !targetId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/user/userId/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const responseData = res.data;
        const data = responseData.data || responseData;
        setUser(data);

        // Init form
        setForm({
          name: data.name || "",
          email: data.email || "",
          isActive: data.isActive ?? true,
          imagePreview: getImageUrl(data.imageUrl),
        });

      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [targetId, navigate]);

  // Edit Handlers
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
        isActive: res.data.isActive ?? true,
        imageFile: null,
        imagePreview: getImageUrl(res.data.imageUrl),
      });

      setIsEditModalOpen(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi khi update user:", err);
      const msg = err?.response?.data?.message || "Cập nhật thất bại";
      alert(msg);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="bg-black min-h-screen text-white flex items-center justify-center">User not found</div>;

  return (
    <div className="ig-profile-container">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content */}
      <main className="ig-profile-main ml-[80px] transition-all duration-300">
        <div className="profile-cover-container">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"
            alt="Cover"
            className="cover-image"
          />
          <div className="cover-overlay"></div>
        </div>

        <div className="ig-profile-wrapper">
          {/* Header Section */}
          <div className="profile-header-meta">
            <div className="ig-avatar-wrapper">
              <img
                src={getImageUrl(user.imageUrl) || "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360"}
                alt={user.name}
                className="ig-avatar-img"
              />
            </div>

            <div className="ig-info-column flex-1">
              <div className="ig-user-row">
                <h2 className="ig-username">{user.name}</h2>
                <div className="ig-action-btns">
                  <button className="ig-btn flex items-center gap-2" onClick={() => setIsEditModalOpen(true)}>
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="ig-btn bg-white/10">Follow</button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm opacity-70 font-medium">
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> @{user.email?.split('@')[0]}</span>
                {user.email && (
                  <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> music.app/{user.email.split('@')[0]}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <div className="ig-stat-item">
              <span className="ig-stat-count">0</span>
              <span className="ig-stat-label">Posts</span>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 self-center"></div>
            <div className="ig-stat-item">
              <span className="ig-stat-count">248</span>
              <span className="ig-stat-label">Followers</span>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 self-center"></div>
            <div className="ig-stat-item">
              <span className="ig-stat-count">152</span>
              <span className="ig-stat-label">Following</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="ig-tabs">
            <div
              className={`ig-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Grid className="w-4 h-4" /> POSTS
            </div>
            <div
              className={`ig-tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark className="w-4 h-4" /> SAVED
            </div>
            <div
              className={`ig-tab ${activeTab === 'tagged' ? 'active' : ''}`}
              onClick={() => setActiveTab('tagged')}
            >
              <UserIcon className="w-4 h-4" /> TAGGED
            </div>
          </div>

          {/* Grid Content / Empty State */}
          {activeTab === 'posts' && (
            <div className="ig-empty-state animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-indigo-500" />
              </div>
              <div className="ig-empty-title">Share Your Music</div>
              <div className="text-slate-500 max-w-sm mx-auto mb-8">
                Your posts and music will appear here once you start sharing with the community.
              </div>
              <button
                className="btn-primary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform"
                onClick={() => navigate('/')}
              >
                Create First Post
              </button>
            </div>
          )}

          {activeTab !== 'posts' && (
            <div className="text-center py-20 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="mb-2">Coming Soon</div>
              <div className="text-xs opacity-60">This feature is under development</div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="ig-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-profile-card" onClick={e => e.stopPropagation()}>
            <h3 className="edit-profile-title">Edit Profile</h3>
            <div className="edit-form-container">
              <div className="edit-avatar-container">
                <label className="edit-avatar-label">
                  <img
                    src={form.imagePreview || "/placeholder-avatar.png"}
                    alt="Preview"
                    className="edit-avatar-preview"
                  />
                  <div className="edit-avatar-overlay">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              <div className="edit-form-group">
                <label className="edit-label">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="edit-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="edit-actions">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-save"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;