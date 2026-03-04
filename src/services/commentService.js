import axiosClient from './axiosClient';

/**
 * Comment Service
 * Handles all comment-related API calls.
 */
const commentService = {
    /**
     * Create a new comment or reply
     * @param {Object} commentData { content, postId, parentCommentId }
     * @returns {Promise}
     */
    createComment: async (commentData) => {
        return axiosClient.post('/comments', commentData);
    },

    /**
     * Update an existing comment
     * @param {string} commentId 
     * @param {Object} updateData { content }
     * @returns {Promise}
     */
    updateComment: async (commentId, updateData) => {
        return axiosClient.put(`/comments/${commentId}`, updateData);
    },

    /**
     * Delete a comment and its replies
     * @param {string} commentId 
     * @returns {Promise}
     */
    deleteComment: async (commentId) => {
        return axiosClient.delete(`/comments/${commentId}`);
    },

    /**
     * Get replies for a specific comment
     * @param {string} commentId 
     * @param {number} page 
     * @param {number} size 
     * @param {string} sort 
     * @returns {Promise}
     */
    getReplies: async (commentId, page = 0, size = 10, sort = 'createdAt,desc') => {
        return axiosClient.get(`/comments/${commentId}/replies?page=${page}&size=${size}&sort=${sort}`);
    },

    /**
     * Get root comments for a specific post
     * @param {string} postId 
     * @param {number} page 
     * @param {number} size 
     * @param {string} sort 
     * @returns {Promise}
     */
    getPostComments: async (postId, page = 0, size = 10, sort = 'createdAt,desc') => {
        return axiosClient.get(`/comments/post/${postId}?page=${page}&size=${size}&sort=${sort}`);
    }
};

export default commentService;
