import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Music, Play, Pause, MoreHorizontal, Share2 } from 'lucide-react';
import postService from '../../services/postService';
import likeService from '../../services/likeService';
import CommentSection from '../content/CommentSection';
import { getUserAvatar } from '../../utils/userUtils';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import './PostDetailModal.css';

const PostDetailModal = ({ isOpen, onClose, postId, onUpdate }) => {
    const { user } = useAuth();
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchPostDetails();
        }
    }, [isOpen, postId]);

    const fetchPostDetails = async () => {
        setLoading(true);
        try {
            const response = await postService.getPostById(postId);
            const data = response.data?.data || response.data;

            // Format data to match UI needs
            const formattedPost = {
                id: data.id,
                content: data.content,
                imageUrl: data.imageUrl,
                musicLink: data.musicLink,
                authorName: data.authorName || data.user?.name || 'Unknown',
                authorAvatar: getUserAvatar(data.authorAvatar || data.user?.imageUrl),
                likeCount: data.likeCount || 0,
                liked: data.liked || false,
                createdAt: data.createdAt,
                user: data.user
            };

            setPost(formattedPost);
        } catch (error) {
            console.error("Error fetching post details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async () => {
        if (!post) return;
        try {
            const response = await likeService.toggleLike(post.id);
            const { isLiked, likeCount } = response.data || response;
            setPost(prev => ({ ...prev, liked: isLiked, likeCount: likeCount }));
            if (onUpdate) onUpdate(post.id, { isLiked, likeCount });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handlePlayMusic = () => {
        if (!post || !post.musicLink) return;
        playTrack({
            id: post.id,
            title: "Original Audio",
            artist: post.authorName,
            avatar: post.imageUrl || post.authorAvatar,
            url: post.musicLink
        });
    };

    if (!isOpen) return null;

    return (
        <div className="post-detail-overlay" onClick={onClose}>
            <button className="close-btn-absolute" onClick={onClose}>
                <X className="w-8 h-8 text-white" />
            </button>

            <div className="post-detail-modal" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="flex items-center justify-center h-[600px] w-full bg-slate-900/50 backdrop-blur-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : post ? (
                    <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                        {/* Left Side: Media */}
                        <div className="lg:w-[60%] bg-black flex items-center justify-center relative group overflow-hidden">
                            {post.imageUrl ? (
                                <img
                                    src={post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:8080${post.imageUrl}`}
                                    alt="Post Content"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 opacity-30">
                                    <Music className="w-20 h-20" />
                                    <span className="font-bold uppercase tracking-widest text-sm">Audio Content</span>
                                </div>
                            )}

                            {post.musicLink && (
                                <button
                                    onClick={handlePlayMusic}
                                    className={`absolute bottom-6 right-6 p-4 rounded-full backdrop-blur-md border border-white/20 transition-all ${currentTrack?.id === post.id && isPlaying ? 'bg-indigo-500 scale-110 shadow-xl shadow-indigo-500/40' : 'bg-white/10 hover:bg-white/20 hover:scale-105'}`}
                                >
                                    {currentTrack?.id === post.id && isPlaying ? (
                                        <Pause className="w-8 h-8 fill-white text-white" />
                                    ) : (
                                        <Play className="w-8 h-8 fill-white text-white ml-1" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Right Side: Details & Comments */}
                        <div className="lg:w-[40%] flex flex-col bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</span>
                                        <span className="text-[10px] opacity-50 uppercase font-bold tracking-tighter">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Content & Comments */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                                <div className="mb-8">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <CommentSection postId={post.id} />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <Heart
                                            onClick={handleToggleLike}
                                            className={`w-7 h-7 cursor-pointer transition-all hover:scale-110 active:scale-90 ${post.liked ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                                        />
                                        <MessageCircle className="w-7 h-7 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
                                        <Share2 className="w-7 h-7 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {post.likeCount.toLocaleString()} likes
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[400px] w-full bg-white dark:bg-slate-900">
                        <p className="text-slate-400">Post not found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetailModal;
