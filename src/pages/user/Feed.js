import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, Heart, MessageCircle } from 'lucide-react';
import axiosClient from '../../services/axiosClient';
import CreatePostModal from '../../components/modals/CreatePostModal';
import Sidebar from '../../components/layout/Sidebar';
import RightSidebar from '../../components/layout/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import './css/Feed.css';

import { MOCK_POSTS, MOCK_STORIES } from '../../mocks/mockData';

const IMAGE_BASE_URL = 'http://localhost:8080';
const DEFAULT_COVER_URL = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";
const DEFAULT_AVATAR_URL = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360";

function NewFeed() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [suggestions, setSuggestions] = useState([]);

  const { user } = useAuth(); // Lấy user từ Context

  // State lưu thông tin user hiện tại
  const [currentUser, setCurrentUser] = useState({
    name: '',
    username: '',
    avatar: DEFAULT_AVATAR_URL
  });

  useEffect(() => {
    if (user) {
      setCurrentUser({
        name: user.name || "Người dùng",
        username: user.email || "",
        avatar: user.imageUrl ? `${IMAGE_BASE_URL}${user.imageUrl}` : DEFAULT_AVATAR_URL
      });
    }
  }, [user]);

  // State audio
  const [playingPostId, setPlayingPostId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // State Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const audioRef = useRef(null);

  // --- 1. Fetch User Info (Đã chuyển sang dùng AuthContext) ---
  const fetchCurrentUser = useCallback(async () => {
    // Không cần gọi API nữa vì đã có user từ context
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
      // Ghép mock data vào để hiển thị nếu API ít dữ liệu hoặc để demo
      setPosts([...mappedPosts.reverse(), ...MOCK_POSTS]);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
      // Fallback khi lỗi API vẫn còn mock data
      setPosts(MOCK_POSTS);
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
    fetchCurrentUser();
    fetchPosts();
    fetchSuggestions();
  }, [fetchCurrentUser, fetchPosts, fetchSuggestions]);

  // Helpers Audio/Like
  const handlePlayMusic = (musicUrl, postId) => {
    const audio = audioRef.current;
    if (playingPostId === postId) {
      audio.pause();
      setPlayingPostId(null);
    } else {
      setCurrentTime(0);
      audio.src = musicUrl;
      audio.volume = volume;
      audio.play();
      setPlayingPostId(postId);
    }
  };

  const handleAudioEnded = () => {
    setPlayingPostId(null);
    setCurrentTime(0);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleLike = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const stories = MOCK_STORIES;

  return (
    <div className="flex min-h-screen feed-container">
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPostCreated={fetchPosts} />
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        className="hidden"
      />

      {/* Left Sidebar */}
      <Sidebar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 ml-[80px] mr-[320px] transition-all duration-300">
        <div className="max-w-[630px] mx-auto px-4 py-8">
          {/* Stories */}
          <div className="stories-container">
            <div className="flex gap-4 overflow-x-auto stories pb-1">
              <style>{`.stories::-webkit-scrollbar { display: none; }`}</style>
              {stories.map(story => (
                <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 w-[72px] story-item group">
                  <div className={`p-[3px] rounded-full transition-all duration-300 group-hover:scale-105 ${story.isOwn ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'}`}>
                    <div className="story-ring">
                      <img src={story.avatar} alt={story.username} className="story-avatar" />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold truncate w-full text-center opacity-80 group-hover:opacity-100 transition-opacity">{story.isOwn ? 'Your Story' : story.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center text-gray-500 py-10">Đang tải bài viết...</div>
            ) : (
              posts.map(post => (
                <article key={post.id} className="post-article">
                  <div className="post-header">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={post.userAvatar}
                          alt={post.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                          onError={(e) => { e.target.src = 'https://i.pravatar.cc/150' }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="username">{post.username}</span>
                        {post.musicLink && (
                          <div className="flex items-center music-info">
                            <Music className="w-3 h-3" />
                            <span>Original Audio</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
                      <MoreHorizontalIcon />
                    </button>
                  </div>

                  <div className="post-media-container group">
                    <img
                      src={post.postImage}
                      alt="Post"
                      className={`post-image ${playingPostId === post.id ? 'opacity-70 blur-[2px]' : ''}`}
                      onDoubleClick={() => toggleLike(post.id)}
                    />

                    {post.musicLink && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlayMusic(post.musicLink, post.id); }}
                        className={`absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all border border-white/30 z-10 shadow-xl ${playingPostId === post.id ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
                      >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </button>
                    )}

                    {playingPostId === post.id && (
                      <div className="absolute inset-0 flex flex-col justify-between audio-overlay z-20 animate-in fade-in duration-500">
                        <div className="flex-1 flex items-center justify-center">
                          <button
                            onClick={() => handlePlayMusic(post.musicLink, post.id)}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white p-6 rounded-full transition-all border border-white/20 shadow-2xl hover:scale-110 active:scale-95"
                          >
                            <Pause className="w-10 h-10 fill-white" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white text-[11px] font-bold tracking-tighter">
                            <span className="w-8 opacity-70">{formatTime(currentTime)}</span>
                            <div
                              className="flex-1 audio-progress-bar overflow-hidden relative"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const clickedTime = (x / rect.width) * duration;
                                audioRef.current.currentTime = clickedTime;
                              }}
                            >
                              <div className="audio-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                            </div>
                            <span className="w-8 opacity-70">{formatTime(duration)}</span>

                            <div className="relative">
                              <button
                                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                              >
                                {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                              </button>
                              {showVolumeSlider && (
                                <div className="absolute bottom-full right-0 mb-3 bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                                  <div className="relative h-32 w-8 flex items-center justify-center">
                                    <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.01"
                                      value={volume}
                                      onChange={handleVolumeChange}
                                      orient="vertical"
                                      className="absolute opacity-0 cursor-pointer h-full w-full z-10"
                                    />
                                    <div className="w-1.5 h-full bg-white/20 rounded-full overflow-hidden relative">
                                      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-full translate-y-0" style={{ height: `${volume * 100}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="post-footer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                        <Heart
                          className={`w-7 h-7 cursor-pointer hover:scale-125 transition-all duration-300 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                          onClick={() => toggleLike(post.id)}
                        />
                        <MessageCircle className="w-7 h-7 cursor-pointer text-slate-500 hover:text-indigo-500 transition-colors" />
                        <svg className="w-7 h-7 cursor-pointer text-slate-500 hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <svg className="w-7 h-7 cursor-pointer text-slate-500 hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>

                    <div className="likes-count mb-2">{post.likes.toLocaleString()} likes</div>
                    <div className="caption">
                      <span className="username">{post.username}</span>
                      <span className="opacity-90">{post.caption}</span>
                    </div>

                    <div className="comment-input-container">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                      </div>
                      <input type="text" placeholder="Add a comment..." className="comment-input" />
                    </div>
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
function MoreHorizontalIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

export default NewFeed;