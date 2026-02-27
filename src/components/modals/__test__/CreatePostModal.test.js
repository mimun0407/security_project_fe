import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePostModal from '../CreatePostModal';
import { useAuth } from '../../../context/AuthContext';
import genreService from '../../../services/genreService';
import axiosClient from '../../../services/axiosClient';

// Mock Dependencies
jest.mock('../../../context/AuthContext');
jest.mock('../../../services/genreService');
jest.mock('../../../services/axiosClient');
jest.mock('../../../services/albumService');

// Mock URL.createObjectURL for image preview
global.URL.createObjectURL = jest.fn(() => 'mock-url');
window.alert = jest.fn();

const mockUser = {
    idUser: 'user-123',
    username: 'testuser'
};

const mockGenres = [
    { id: 'genre-1', name: 'Pop' },
    { id: 'genre-2', name: 'Rock' }
];

describe('CreatePostModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnPostCreated = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        genreService.getAllGenres.mockResolvedValue({ success: true, data: mockGenres });
    });

    test('renders correctly when open', async () => {
        render(
            <CreatePostModal
                isOpen={true}
                onClose={mockOnClose}
                onPostCreated={mockOnPostCreated}
            />
        );

        expect(screen.getByText('Tải nhạc lên')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nhập tên bài hát...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Pop')).toBeInTheDocument();
            expect(screen.getByText('Rock')).toBeInTheDocument();
        });
    });

    test('calls onClose when clicking close button', async () => {
        render(
            <CreatePostModal
                isOpen={true}
                onClose={mockOnClose}
                onPostCreated={mockOnPostCreated}
            />
        );

        // Find the button with lucide-x class (the close button)
        const buttons = screen.getAllByRole('button');
        const closeButton = buttons.find(btn => btn.querySelector('.lucide-x'));

        await userEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('Step 1: Progresses to Step 2 after successful upload', async () => {
        axiosClient.post.mockResolvedValue({ data: { data: { id: 'song-123', name: 'Test Song' } } });

        render(
            <CreatePostModal
                isOpen={true}
                onClose={mockOnClose}
                onPostCreated={mockOnPostCreated}
            />
        );

        // 1. Mock file selection
        const file = new File(['song'], 'test-song.mp3', { type: 'audio/mpeg' });
        const audioInput = document.querySelector('input[type="file"][accept="audio/*"]');
        userEvent.upload(audioInput, file);

        // 2. Enter song name
        const nameInput = screen.getByPlaceholderText('Nhập tên bài hát...');
        fireEvent.change(nameInput, { target: { value: 'My Cool Song' } });

        // 3. Select Genre
        await waitFor(() => screen.getByText('Pop'));
        fireEvent.click(screen.getByText('Pop'));

        // 4. Click Continue
        const continueButton = screen.getByText('Tiếp tục');
        fireEvent.click(continueButton);

        await waitFor(() => {
            expect(axiosClient.post).toHaveBeenCalled();
            expect(screen.getByText('Chi tiết bài viết')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test('Step 2: Submits post successfully', async () => {
        // Setup: Start at Step 2 by mocking a successful upload or just bypassing step 1 if possible
        // But Step 2 depends on uploadedSong state. Best to run through Step 1.

        axiosClient.post
            .mockResolvedValueOnce({ data: { data: { id: 'song-1', name: 'Success Song' } } }) // For /song
            .mockResolvedValueOnce({ success: true }); // For /posts

        render(
            <CreatePostModal
                isOpen={true}
                onClose={mockOnClose}
                onPostCreated={mockOnPostCreated}
            />
        );

        // Step 1 Flow
        const file = new File(['song'], 'song.mp3', { type: 'audio/mpeg' });
        const audioInput = document.querySelector('input[type="file"][accept="audio/*"]');
        userEvent.upload(audioInput, file);
        fireEvent.change(screen.getByPlaceholderText('Nhập tên bài hát...'), { target: { value: 'Success Song' } });

        // Select Genre
        await waitFor(() => screen.getByText('Pop'));
        fireEvent.click(screen.getByText('Pop'));

        fireEvent.click(screen.getByText('Tiếp tục'));

        // Step 2 Flow
        await waitFor(() => expect(screen.getByText('Chi tiết bài viết')).toBeInTheDocument(), { timeout: 3000 });

        const captionArea = screen.getByPlaceholderText('Ghi điều gì đó về bài hát này...');
        fireEvent.change(captionArea, { target: { value: 'Feeling great about this jam!' } });

        const postButton = screen.getByText('Đăng bài');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(axiosClient.post).toHaveBeenCalledTimes(2);
            expect(mockOnPostCreated).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
