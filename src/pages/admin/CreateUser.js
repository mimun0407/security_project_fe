import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    roles: []   // ✅ thêm roles
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ handle chọn role
  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    let newRoles = [...form.roles];
    if (checked) {
      newRoles.push(value);
    } else {
      newRoles = newRoles.filter((r) => r !== value);
    }
    setForm({ ...form, roles: newRoles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const userData = {
        name: form.name,
        username: form.username,
        password: form.password,
        email: form.email,
        roles: form.roles   // ✅ gửi roles
      };

      formData.append(
        "user",
        new Blob([JSON.stringify(userData)], { type: "application/json" })
      );
      if (image) formData.append("image", image);

      const token = localStorage.getItem("token");

      const res = await axios.post("http://localhost:8080/api/v1/user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Tạo user thành công!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tạo user!");
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ✨ Tạo User Mới
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 mb-1">Tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            {/* ✅ Thêm chọn role */}
            <div>
              <label className="block text-gray-600 mb-1">Role</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value="ADMIN"
                    checked={form.roles.includes("ADMIN")}
                    onChange={handleRoleChange}
                  />
                  <span>ADMIN</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value="USER"
                    checked={form.roles.includes("USER")}
                    onChange={handleRoleChange}
                  />
                  <span>USER</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Ảnh đại diện</label>
              <input type="file" onChange={handleFileChange} className="w-full" />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 w-24 h-24 object-cover rounded-full border shadow-md mx-auto"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition duration-200"
            >
              🚀 Tạo User
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CreateUser;
