import axiosClient from './axiosClient';

/**
 * Like Service
 * Handles all post-like related API calls.
 */
const likeService = {
    /**
     * Toggle like/unlike on a post
     * @param {string} postId 
     * @returns {Promise} Response with isLiked and current likeCount
     */
    toggleLike: async (postId) => {
        try {
            const response = await axiosClient.post(`/likes/post/${postId}/toggle`);
            return response.data;
        } catch (error) {
            console.error("Error toggling like:", error);
            throw error;
        }
    },

    /**
     * Get current like status and count for a post
     * @param {string} postId 
     * @returns {Promise} Response with isLiked and current likeCount
     */
    getLikeStatus: async (postId) => {
        try {
            const response = await axiosClient.get(`/likes/post/${postId}/status`);
            return response.data;
        } catch (error) {
            console.error("Error getting like status:", error);
            throw error;
        }
    }
};

export default likeService;
