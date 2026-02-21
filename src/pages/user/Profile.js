import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/layout/Sidebar";
import { Settings, Grid, Bookmark, User as UserIcon, Plus, Camera, MessageCircle, Link as LinkIcon } from 'lucide-react';
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
        <div className="ig-profile-wrapper">

          {/* Header: Avatar & Info */}
          <header className="ig-profile-header">
            <div className="ig-avatar-column">
              <div className="ig-avatar-wrapper">
                <img
                  src={getImageUrl(user.imageUrl) || "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360"}
                  alt={user.name}
                  className="ig-avatar-img"
                />
                <div className="ig-note-bubble">Note...</div>
              </div>
            </div>

            <div className="ig-info-column">
              {/* Top Row: Username + Buttons */}
              <div className="ig-user-row">
                <h2 className="ig-username">{user.email?.split('@')[0] || user.name}</h2>
                {/* <img src="/verified.png" className="ig-verified-badge" /> */}

                <div className="ig-action-btns">
                  <button className="ig-btn" onClick={() => setIsEditModalOpen(true)}>Edit profile</button>
                  <button className="ig-btn">View archive</button>
                </div>

                <button className="ig-settings-btn">
                  <Settings className="w-6 h-6" />
                </button>
              </div>

              {/* Stats Row */}
              <div className="ig-stats-row">
                <div className="ig-stat-item">
                  <span className="ig-stat-count">0</span> posts
                </div>
                <div className="ig-stat-item">
                  <span className="ig-stat-count">2</span> followers
                </div>
                <div className="ig-stat-item">
                  <span className="ig-stat-count">0</span> following
                </div>
              </div>

              {/* Bio Section */}
              <div className="ig-bio-section">
                <div className="ig-fullname">{user.name}</div>
                <div className="text-gray-300">double.cap</div> {/* Static/Placeholder bio */}
                {user.email && (
                  <a href="#" className="ig-bio-link">
                    <LinkIcon className="w-3 h-3" /> @{user.email.split('@')[0]}
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Highlights */}
          <div className="ig-highlights">
            <div className="ig-highlight-item">
              <div className="ig-highlight-circle new">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div className="ig-highlight-label">New</div>
            </div>
            {/* Placeholder highlights */}
            <div className="ig-highlight-item">
              <div className="ig-highlight-circle" style={{ backgroundColor: '#000' }}>
                <div className="w-full h-full bg-gray-800 rounded-full"></div>
              </div>
              <div className="ig-highlight-label">Highlight</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="ig-tabs">
            <div
              className={`ig-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Grid className="ig-tab-icon" /> POSTS
            </div>
            <div
              className={`ig-tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark className="ig-tab-icon" /> SAVED
            </div>
            <div
              className={`ig-tab ${activeTab === 'tagged' ? 'active' : ''}`}
              onClick={() => setActiveTab('tagged')}
            >
              <UserIcon className="ig-tab-icon" /> TAGGED
            </div>
          </div>

          {/* Grid Content / Empty State */}
          {activeTab === 'posts' && (
            <div className="ig-empty-state">
              <div className="ig-camera-circle">
                <Camera className="w-8 h-8 text-white relative z-10" />
              </div>
              <div className="ig-empty-title">Share Photos</div>
              <div className="ig-empty-desc">
                When you share photos, they will appear on your profile.
              </div>
              <a href="#" className="ig-empty-link">Share your first photo</a>
            </div>
          )}

          {/* Saved Tab Content Placeholder */}
          {activeTab === 'saved' && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Only you can see what you've saved
            </div>
          )}

        </div>
      </main>

      {/* Floating Messages Button */}
      <button className="ig-floating-msg">
        <MessageCircle className="w-5 h-5" /> Messages
      </button>

      {/* Edit Profile Modal (Simple Version) */}
      {isEditModalOpen && (
        <div className="ig-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-neutral-800 p-6 rounded-xl w-[400px] text-white" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-center mb-4">
                <label className="cursor-pointer relative group">
                  <img
                    src={form.imagePreview || "/placeholder-avatar.png"}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-neutral-600"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-neutral-900 border border-neutral-700 rounded p-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-neutral-900 border border-neutral-700 rounded p-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:text-gray-300 px-4 py-2 text-sm">Cancel</button>
                <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 font-semibold text-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;