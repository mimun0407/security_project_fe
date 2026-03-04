import commentService from '../commentService';
import axiosClient from '../axiosClient';

jest.mock('../axiosClient');

describe('commentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createComment should call POST /comments with correct data', async () => {
        const commentData = { content: 'Test comment', postId: 'post123' };
        await commentService.createComment(commentData);
        expect(axiosClient.post).toHaveBeenCalledWith('/comments', commentData);
    });

    test('updateComment should call PUT /comments/{id} with correct data', async () => {
        const commentId = 'comm123';
        const updateData = { content: 'Updated content' };
        await commentService.updateComment(commentId, updateData);
        expect(axiosClient.put).toHaveBeenCalledWith(`/comments/${commentId}`, updateData);
    });

    test('deleteComment should call DELETE /comments/{id}', async () => {
        const commentId = 'comm123';
        await commentService.deleteComment(commentId);
        expect(axiosClient.delete).toHaveBeenCalledWith(`/comments/${commentId}`);
    });

    test('getReplies should call GET /comments/{id}/replies with correct params', async () => {
        const commentId = 'comm123';
        await commentService.getReplies(commentId, 1, 5, 'id,asc');
        expect(axiosClient.get).toHaveBeenCalledWith(`/comments/${commentId}/replies?page=1&size=5&sort=id,asc`);
    });

    test('getPostComments should call GET /comments/post/{id} with correct params', async () => {
        const postId = 'post123';
        await commentService.getPostComments(postId, 0, 20);
        expect(axiosClient.get).toHaveBeenCalledWith(`/comments/post/${postId}?page=0&size=20&sort=createdAt,desc`);
    });
});
