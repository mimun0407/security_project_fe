import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Music, Loader2, UploadCloud, Disc } from 'lucide-react';
import axiosClient from './axiosClient';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs cho input file
  const imageInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const USER_ID = "c8a0b439-42a1-43de-973b-79ab354e4afb";

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

    setIsLoading(true);
    const formData = new FormData();
    
    formData.append('userId', USER_ID);
    formData.append('content', content);
    
    // File nhạc là bắt buộc
    formData.append('music', selectedMusic);

    // Ảnh là tùy chọn. Nếu có chọn thì gửi, không thì thôi (Backend sẽ dùng default hoặc null)
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
      onPostCreated(); 
      onClose(); 
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      alert("Đăng bài thất bại! Hãy kiểm tra lại kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Container chính: Giới hạn chiều cao max-h-[85vh] để không bị tràn màn hình laptop */}
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* 1. Header (Cố định) */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <h2 className="text-base font-bold text-gray-800">Tạo bài hát mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 2. Body (Cuộn được - overflow-y-auto) */}
        <div className="p-4 overflow-y-auto flex-1">
          
          {/* Khu vực chọn nhạc (Quan trọng nhất - Highlight) */}
          <div 
            onClick={() => musicInputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-4 mb-4 transition cursor-pointer flex flex-col items-center justify-center gap-2 group
              ${selectedMusic ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
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
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                        <UploadCloud className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-gray-600">Nhấn để tải nhạc lên</p>
                        <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A (Bắt buộc)</p>
                    </div>
                </>
            )}
          </div>

          <div className="flex gap-4">
             {/* Cover Art (Ảnh bìa) */}
            <div className="shrink-0">
                 <p className="text-xs font-semibold text-gray-500 mb-2">Ảnh bìa (Tùy chọn)</p>
                 <div 
                    className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group shadow-sm border border-gray-200"
                    onClick={() => imageInputRef.current.click()}
                 >
                    <img 
                        src={previewUrl || DEFAULT_IMAGE_PREVIEW} 
                        alt="Cover" 
                        className={`w-full h-full object-cover transition duration-300 ${!previewUrl ? 'opacity-80 grayscale' : ''}`} 
                    />
                    
                    {/* Overlay icon máy ảnh */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Nút xóa ảnh nếu đã chọn */}
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
            <div className="flex-1">
                 <p className="text-xs font-semibold text-gray-500 mb-2">Mô tả cảm xúc</p>
                 <textarea
                    className="w-full h-24 p-3 bg-gray-50 rounded-lg outline-none text-sm border focus:border-blue-300 focus:bg-white transition resize-none"
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
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between shrink-0 rounded-b-xl">
            <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                {selectedMusic ? <span className="text-green-600 flex items-center gap-1">✔ Đã sẵn sàng</span> : <span>Chọn nhạc để tiếp tục</span>}
            </div>
            
            <button 
                onClick={handleSubmit}
                disabled={isLoading || !selectedMusic} // Disable nếu chưa có nhạc
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-gray-300"
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