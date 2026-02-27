import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlbumManagement from '../AlbumManagement';
import albumService from '../../../services/albumService';
import axiosClient from '../../../services/axiosClient';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../../services/albumService');
jest.mock('../../../services/axiosClient');

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('AlbumManagement Component', () => {
    const mockAlbums = [
        { id: '1', name: 'Album One', description: 'Desc 1', imageUrl: '/img1.png' }
    ];

    const mockSongs = [
        { id: 's1', name: 'Song One', albumId: null },
        { id: 's2', name: 'Song Two', albumId: '2' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // albumService handles its own .data unpacking usually unless mocked differently
        albumService.getAllAlbums.mockResolvedValue({ success: true, content: mockAlbums });
        // axiosClient.get returns the raw axios response { data: ... }
        axiosClient.get.mockImplementation((url) => {
            if (url === '/song') return Promise.resolve({ data: { success: true, data: mockSongs } });
            return Promise.reject(new Error('not found'));
        });
    });

    test('renders album list correctly', async () => {
        renderWithRouter(<AlbumManagement />);
        await screen.findByText('Album One');
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
    });

    test('shows error when uploading wrong image format', async () => {
        renderWithRouter(<AlbumManagement />);
        const newBtn = await screen.findByText(/New Album/i);
        fireEvent.click(newBtn);

        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        const input = document.getElementById('album-cover');

        await userEvent.upload(input, file);

        await screen.findByText(/Yêu cầu Admin chọn lại file ảnh đúng định dạng/i);
    });

    test('shows warning when adding song already in another album', async () => {
        window.alert = jest.fn();
        renderWithRouter(<AlbumManagement />);

        const manageBtn = await screen.findByText('Manage Songs');
        fireEvent.click(manageBtn);

        const songTwo = await screen.findByText('Song Two');
        const row = songTwo.closest('tr');
        // Specific button for "Song Two"
        const addBtn = row.querySelector('.btn-primary, button');
        fireEvent.click(addBtn);

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('đã thuộc Album khác'));
    });

    test('successfully adds available song to album', async () => {
        window.alert = jest.fn();
        albumService.addSongToAlbum.mockResolvedValue({ success: true });

        renderWithRouter(<AlbumManagement />);

        const manageBtn = await screen.findByText('Manage Songs');
        fireEvent.click(manageBtn);

        const songOne = await screen.findByText('Song One');
        const row = songOne.closest('tr');
        const addBtn = row.querySelector('.btn-primary, button');
        fireEvent.click(addBtn);

        await waitFor(() => expect(albumService.addSongToAlbum).toHaveBeenCalledWith('1', 's1'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Đã thêm bài hát'));
    });
});
