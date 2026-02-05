import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Heart, MessageCircle } from 'lucide-react';
import axiosClient from '../../services/axiosClient';
import CreatePostModal from '../../components/modals/CreatePostModal';
import Sidebar from '../../components/layout/Sidebar';
import RightSidebar from '../../components/layout/RightSidebar';

const IMAGE_BASE_URL = 'http://localhost:8080';
const DEFAULT_COVER_URL = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";
const DEFAULT_AVATAR_URL = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360";

function NewFeed() {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // --- THAY ĐỔI: State lưu thông tin user hiện tại ---
  const [currentUser, setCurrentUser] = useState({
    name: '',
    username: '',
    avatar: DEFAULT_AVATAR_URL
  });
  // --------------------------------------------------

  // State audio
  const [playingPostId, setPlayingPostId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // State Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const audioRef = useRef(null);

  // --- 1. Fetch User Info (User đang đăng nhập) ---
  const fetchCurrentUser = useCallback(async () => {
    try {
      // LƯU Ý: Bạn cần đảm bảo lúc Login đã lưu 'username' vào localStorage
      const storedUsername = localStorage.getItem('username');

      if (!storedUsername) {
        console.warn("Không tìm thấy username trong localStorage. Chưa login?");
        return;
      }

      // Gọi API: GET /api/v1/user/{username}
      const response = await axiosClient.get(`/user/${storedUsername}`);
      const data = response.data;

      setCurrentUser({
        name: data.name || "Người dùng",
        username: data.username,
        avatar: data.imageUrl ? `${IMAGE_BASE_URL}${data.imageUrl}` : DEFAULT_AVATAR_URL
      });

    } catch (error) {
      console.error("Lỗi tải thông tin user hiện tại:", error);
    }
  }, []);

  // --- 2. Fetch Posts ---
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axiosClient.get('/posts');
      const data = response.data;
      const mappedPosts = data.content.map(post => ({
        id: post.id,
        username: post.authorName,
        userAvatar: post.authorAvatar ? `${IMAGE_BASE_URL}${post.authorAvatar}` : 'https://i.pravatar.cc/150',
        postImage: post.imageUrl ? `${IMAGE_BASE_URL}${post.imageUrl}` : DEFAULT_COVER_URL,
        musicLink: post.musicLink ? `${IMAGE_BASE_URL}${post.musicLink}` : null,
        likes: post.likes || 0,
        caption: post.content,
        comments: 0,
        timeAgo: 'Vừa xong',
        isLiked: false,
      }));
      setPosts(mappedPosts.reverse());
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    }
  }, []);

  // --- 3. Fetch Suggestions ---
  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await axiosClient.get('/user/suggestions');
      const data = response.data;
      const mappedSuggestions = data.map((user) => ({
        id: user.userId,
        username: user.name || "Người dùng ẩn danh",
        avatar: user.imageUrl ? `${IMAGE_BASE_URL}${user.imageUrl}` : DEFAULT_AVATAR_URL,
        mutual: 'Gợi ý cho bạn',
        isFollowed: false
      }));
      setSuggestions(mappedSuggestions);
    } catch (error) {
      console.error("Lỗi khi tải gợi ý:", error);
    }
  }, []);

  // --- 4. Handle Follow ---
  const handleFollow = async (targetId) => {
    if (!targetId) return;
    const userIndex = suggestions.findIndex(u => u.id === targetId);
    if (userIndex === -1) return;
    const isCurrentlyFollowed = suggestions[userIndex].isFollowed;
    const newSuggestions = [...suggestions];
    newSuggestions[userIndex].isFollowed = !isCurrentlyFollowed;
    setSuggestions(newSuggestions);

    try {
      if (isCurrentlyFollowed) {
        await axiosClient.delete(`/follow-user/${targetId}/unfollow`);
      } else {
        await axiosClient.post(`/follow-user/${targetId}/follow`);
      }
    } catch (error) {
      console.error("Lỗi follow:", error);
      newSuggestions[userIndex].isFollowed = isCurrentlyFollowed;
      setSuggestions(newSuggestions);
    }
  };

  useEffect(() => {
    fetchCurrentUser(); // Gọi hàm lấy thông tin user hiện tại
    fetchPosts();
    fetchSuggestions();
  }, [fetchCurrentUser, fetchPosts, fetchSuggestions]);

  // Helpers Audio/Like
  const handlePlayMusic = (musicUrl, postId) => {
    const audio = audioRef.current;
    if (playingPostId === postId) { audio.pause(); setPlayingPostId(null); }
    else { setCurrentTime(0); audio.src = musicUrl; audio.volume = volume; audio.play(); setPlayingPostId(postId); }
  };
  const handleAudioEnded = () => { setPlayingPostId(null); setCurrentTime(0); };
  const handleSeek = (e) => { const newTime = parseFloat(e.target.value); audioRef.current.currentTime = newTime; setCurrentTime(newTime); };
  const handleVolumeChange = (e) => { const newVolume = parseFloat(e.target.value); setVolume(newVolume); if (audioRef.current) { audioRef.current.volume = newVolume; } };
  const formatTime = (time) => { if (isNaN(time)) return "0:00"; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };
  const toggleLike = (postId) => { setPosts(posts.map(post => post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post)); };

  // Data stories giả
  const stories = [
    { id: 1, username: 'Câu chuyện', avatar: 'https://i.pravatar.cc/150?img=10', isOwn: true },
    { id: 2, username: 'alex_photos', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 3, username: 'sarah_smith', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPostCreated={fetchPosts} />
      <audio ref={audioRef} onEnded={handleAudioEnded} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} className="hidden" />

      {/* Left Sidebar */}
      <Sidebar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 ml-[245px] mr-[320px]">
        <div className="max-w-[630px] mx-auto px-4 py-8">
          {/* Stories */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="flex gap-4 overflow-x-auto stories">
              <style>{`.stories::-webkit-scrollbar { display: none; }`}</style>
              {stories.map(story => (
                <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 w-[66px]">
                  <div className={`p-[2px] rounded-full ${story.isOwn ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
                    <div className="bg-white p-[2px] rounded-full"><img src={story.avatar} alt={story.username} className="w-[56px] h-[56px] rounded-full object-cover" /></div>
                  </div>
                  <span className="text-xs truncate w-full text-center">{story.username}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (<div className="text-center text-gray-500 py-10">Đang tải bài viết...</div>) : (
              posts.map(post => (
                <article key={post.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <img src={post.userAvatar} alt={post.username} className="w-8 h-8 rounded-full object-cover" onError={(e) => { e.target.src = 'https://i.pravatar.cc/150' }} />
                      <div className="flex flex-col"><span className="font-semibold text-sm">{post.username}</span>{post.musicLink && (<div className="flex items-center text-xs text-gray-500"><Music className="w-3 h-3 mr-1" /> Original Audio</div>)}</div>
                    </div>
                    <button className="text-gray-600 hover:text-gray-800"><MoreHorizontalIcon /></button>
                  </div>
                  <div className="relative bg-black group flex items-center justify-center bg-gray-900">
                    <img src={post.postImage} alt="Post" className={`w-full h-full object-cover transition-all duration-500 ${playingPostId === post.id ? 'opacity-80' : ''}`} style={{ aspectRatio: '1/1' }} onDoubleClick={() => toggleLike(post.id)} />
                    {post.musicLink && (<button onClick={(e) => { e.stopPropagation(); handlePlayMusic(post.musicLink, post.id); }} className={`absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-2 rounded-full transition-all border border-white/20 z-10 ${playingPostId === post.id ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><Play className="w-5 h-5 fill-white ml-0.5" /> </button>)}
                    {playingPostId === post.id && (
                      <div className="absolute inset-0 flex flex-col justify-end z-20">
                        <div className="flex-1 flex items-center justify-center"><button onClick={() => handlePlayMusic(post.musicLink, post.id)} className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/30"><Pause className="w-8 h-8 fill-white" /></button></div>
                        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pb-4">
                          <div className="flex items-center gap-3 text-white text-xs font-medium">
                            <span className="w-10 text-right">{formatTime(currentTime)}</span>
                            <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white" style={{ background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgb(75 85 99) ${(currentTime / duration) * 100}%)` }} />
                            <span className="w-10">{formatTime(duration)}</span>
                            <div className="relative">
                              <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} className="p-1 hover:bg-white/10 rounded transition-colors">{volume === 0 ? (<VolumeX className="w-5 h-5" />) : (<Volume2 className="w-5 h-5" />)}</button>
                              {showVolumeSlider && (<div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/20 flex flex-col items-center"><div className="relative h-24 w-6 flex items-center justify-center"><input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} orient="vertical" className="absolute appearance-none cursor-pointer" style={{ width: '100px', height: '4px', transform: 'rotate(-90deg)', transformOrigin: 'center', background: `linear-gradient(to right, white ${volume * 100}%, rgb(75 85 99) ${volume * 100}%)`, borderRadius: '2px', outline: 'none' }} /></div></div>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <Heart className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} onClick={() => toggleLike(post.id)} />
                        <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                        <svg className="w-6 h-6 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </div>
                      <svg className="w-6 h-6 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                    <div className="font-semibold text-sm mb-2">{post.likes.toLocaleString()} lượt thích</div>
                    <div className="text-sm"><span className="font-semibold mr-2">{post.username}</span> {post.caption}</div>
                    <div className="mt-3 flex items-center gap-2"><input type="text" placeholder="Thêm bình luận..." className="flex-1 outline-none text-sm" /></div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar
        currentUser={currentUser}
        suggestions={suggestions}
        onFollow={handleFollow}
      />
    </div>
  );
}

// Helpers
function MoreHorizontalIcon() { return (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>) }

export default NewFeed;