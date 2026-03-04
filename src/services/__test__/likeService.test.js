import likeService from '../likeService';
import axiosClient from '../axiosClient';

jest.mock('../axiosClient');

describe('likeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('toggleLike', () => {
        test('should call axiosClient.post with correct endpoint', async () => {
            const postId = 'post123';
            const mockResult = { data: { isLiked: true, likeCount: 1 } };
            axiosClient.post.mockResolvedValue(mockResult);

            const result = await likeService.toggleLike(postId);

            expect(axiosClient.post).toHaveBeenCalledWith(`/likes/post/${postId}/toggle`);
            expect(result).toEqual(mockResult.data);
        });

        test('should throw error when api fails', async () => {
            const postId = 'post123';
            const error = new Error('API Error');
            axiosClient.post.mockRejectedValue(error);

            await expect(likeService.toggleLike(postId)).rejects.toThrow(error);
        });
    });

    describe('getLikeStatus', () => {
        test('should call axiosClient.get with correct endpoint', async () => {
            const postId = 'post123';
            const mockResult = { data: { isLiked: false, likeCount: 10 } };
            axiosClient.get.mockResolvedValue(mockResult);

            const result = await likeService.getLikeStatus(postId);

            expect(axiosClient.get).toHaveBeenCalledWith(`/likes/post/${postId}/status`);
            expect(result).toEqual(mockResult.data);
        });

        test('should throw error when api fails', async () => {
            const postId = 'post123';
            const error = new Error('API Error');
            axiosClient.get.mockRejectedValue(error);

            await expect(likeService.getLikeStatus(postId)).rejects.toThrow(error);
        });
    });
});
