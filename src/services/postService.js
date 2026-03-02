import axiosClient from './axiosClient';

/**
 * Post Service
 * Handles all post-related API calls.
 */
const postService = {
    /**
     * Create a new post
     * @param {Object} postData { content, visibility, targetType, targetId }
     * @param {File} imageFile (Optional)
     * @returns {Promise}
     */
    createPost: async (postData, imageFile) => {
        // According to user request: 
        // { "content": "string", "visibility": "FRIEND", "targetType": "SONG", "targetId": "string" }

        if (!imageFile) {
            // If no image, send as plain JSON
            return axiosClient.post('/posts', postData);
        }

        // If there's an image, use multipart
        const formData = new FormData();
        formData.append('post', new Blob([JSON.stringify(postData)], { type: "application/json" }));
        formData.append('image', imageFile);

        return axiosClient.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Get all posts (Feed)
     * @returns {Promise}
     */
    getAllPosts: async () => {
        return axiosClient.get('/posts');
    }
};

export default postService;
