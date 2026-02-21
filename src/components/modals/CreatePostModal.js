import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Music, Loader2, UploadCloud } from 'lucide-react';
import axiosClient from '../../services/axiosClient';
import { useAuth } from '../../context/AuthContext';
import './css/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [isLoading, setIsLoading] = useState(false);

  // Refs cho input file
  const imageInputRef = useRef(null);
  const musicInputRef = useRef(null);

  // Ảnh mặc định nếu không chọn ảnh (Ảnh đĩa than hoặc gradient)
  const DEFAULT_IMAGE_PREVIEW = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleMusicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMusic(file);
    }
  };

  const handleSubmit = async () => {
    // VALIDATION: Bắt buộc phải có nhạc
    if (!selectedMusic) {
      alert("Bạn ơi, đây là mạng xã hội âm nhạc! Vui lòng chọn một bài hát nhé 🎵");
      return;
    }

    if (!user || !user.idUser) {
      alert("Bạn chưa đăng nhập hoặc không tìm thấy ID người dùng.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    // Construct DTO (Data Transfer Object)
    const postDto = {
      userId: user.idUser,
      content: content,
      visibility: visibility,
      targetType: 'SONG',
      targetId: null
    };

    // Append DTO as JSON Blob (Key: 'post')
    formData.append('post', new Blob([JSON.stringify(postDto)], { type: "application/json" }));

    // File nhạc bắt buộc
    formData.append('music', selectedMusic);

    // Ảnh tùy chọn
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      await axiosClient.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setContent('');
      setSelectedImage(null);
      setPreviewUrl(null);
      setSelectedMusic(null);
      setVisibility('PUBLIC');
      onPostCreated();
      onClose();
      alert("Đăng bài thành công! 🎵");
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      const msg = error.response?.data?.message || "Đăng bài thất bại! Hãy kiểm tra lại kết nối.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 animate-in fade-in duration-200">
      <div className="rounded-xl w-full max-w-lg flex flex-col max-h-[85vh] modal-content">

        {/* 1. Header (Cố định) */}
        <div className="flex items-center justify-between modal-header shrink-0">
          <h2 className="text-base font-bold">Tạo bài hát mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Body (Cuộn được - overflow-y-auto) */}
        <div className="modal-body overflow-y-auto flex-1">

          {/* Khu vực chọn nhạc (Quan trọng nhất - Highlight) */}
          <div
            onClick={() => musicInputRef.current.click()}
            className={`upload-area rounded-xl p-4 mb-4 transition cursor-pointer flex flex-col items-center justify-center gap-2 group
              ${selectedMusic ? 'active border-blue-500' : ''}`}
          >
            {selectedMusic ? (
              <>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-700 text-sm break-all line-clamp-1">{selectedMusic.name}</p>
                  <p className="text-xs text-blue-500">{(selectedMusic.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <span className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-600 mt-1">Đổi bài khác</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                  <UploadCloud className="w-6 h-6 opacity-50" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Nhấn để tải nhạc lên</p>
                  <p className="text-xs opacity-60 mt-1">MP3, WAV, M4A (Bắt buộc)</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            {/* Cover Art (Ảnh bìa) */}
            <div className="shrink-0">
              <p className="text-xs font-semibold opacity-60 mb-2">Ảnh bìa (Tùy chọn)</p>
              <div
                className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group shadow-sm border border-black/10"
                onClick={() => imageInputRef.current.click()}
              >
                <img
                  src={previewUrl || DEFAULT_IMAGE_PREVIEW}
                  alt="Cover"
                  className={`w-full h-full object-cover transition duration-300 ${!previewUrl ? 'opacity-80 grayscale' : ''}`}
                />

                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>

                {previewUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full text-white hover:bg-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Caption Input */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold opacity-60">Mô tả cảm xúc</p>

                {/* Visibility Dropdown */}
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="visibility-select outline-none cursor-pointer appearance-none"
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="FRIEND">Bạn bè</option>
                  <option value="PRIVATE">Riêng tư</option>
                </select>
              </div>

              <textarea
                className="caption-textarea flex-1"
                placeholder="Bài hát này khiến bạn nghĩ gì?..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <input
            type="file"
            accept="audio/*"
            ref={musicInputRef}
            onChange={handleMusicChange}
            className="hidden"
          />
        </div>

        {/* 3. Footer (Cố định) */}
        <div className="modal-footer shrink-0 rounded-b-xl">
          <div className="text-xs opacity-60 px-2">
            {selectedMusic ? <span className="text-green-600">✔ Đã sẵn sàng</span> : <span>Chọn nhạc để tiếp tục</span>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedMusic}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Đang tải lên...' : 'Đăng bài'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;