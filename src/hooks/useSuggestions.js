import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const IMAGE_BASE_URL = 'http://localhost:8080';
const DEFAULT_AVATAR_URL = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360";

/**
 * Hook to manage user suggestions and follow state
 */
export const useSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getSuggestions();
            const mappedSuggestions = data.map((user) => ({
                id: user.userId,
                username: user.name || "Người dùng ẩn danh",
                avatar: user.imageUrl ? `${IMAGE_BASE_URL}${user.imageUrl}` : DEFAULT_AVATAR_URL,
                mutual: 'Gợi ý cho bạn',
                isFollowed: false // API suggestions are typically for users not yet followed
            }));
            setSuggestions(mappedSuggestions);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải gợi ý:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFollow = async (targetId) => {
        if (!targetId) return;

        const userIndex = suggestions.findIndex(u => u.id === targetId);
        if (userIndex === -1) return;

        const isCurrentlyFollowed = suggestions[userIndex].isFollowed;

        // Optimistic UI update
        const newSuggestions = [...suggestions];
        newSuggestions[userIndex].isFollowed = !isCurrentlyFollowed;
        setSuggestions(newSuggestions);

        try {
            if (isCurrentlyFollowed) {
                await userService.unfollowUser(targetId);
            } else {
                await userService.followUser(targetId);
            }
        } catch (err) {
            console.error("Lỗi follow:", err);
            // Revert on error
            const revertedSuggestions = [...suggestions];
            revertedSuggestions[userIndex].isFollowed = isCurrentlyFollowed;
            setSuggestions(revertedSuggestions);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    return {
        suggestions,
        loading,
        error,
        handleFollow,
        refetch: fetchSuggestions
    };
};

export default useSuggestions;
