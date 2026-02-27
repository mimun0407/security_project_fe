import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenreManagement from '../GenreManagement';
import genreService from '../../../services/genreService';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../services/genreService');

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('GenreManagement Component', () => {
    const mockGenres = [
        { id: '1', name: 'Pop', description: 'Popular music' },
        { id: '2', name: 'Rock', description: 'Rock music' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        genreService.getAllGenres.mockResolvedValue({ success: true, data: mockGenres });
    });

    test('renders genre list correctly', async () => {
        renderWithRouter(<GenreManagement />);

        // Wait for the genres to load
        await waitFor(() => {
            expect(screen.getByText('Pop')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.getByText('Rock')).toBeInTheDocument();
        expect(screen.getByText('Popular music')).toBeInTheDocument();
    });

    test('opens create modal when clicking New Genre', async () => {
        renderWithRouter(<GenreManagement />);

        const newBtn = await screen.findByText(/New Genre/i);
        fireEvent.click(newBtn);

        expect(screen.getByText('Create New Genre')).toBeInTheDocument();
    });

    test('shows warning when deleting a genre in use', async () => {
        window.confirm = jest.fn(() => true);
        genreService.deleteGenre.mockResolvedValue({
            success: false,
            message: 'Genre is in use'
        });

        renderWithRouter(<GenreManagement />);

        const popRow = await screen.findByText('Pop');
        const row = popRow.closest('tr');
        const deleteBtn = row.querySelector('.btn-genre-delete');
        fireEvent.click(deleteBtn);

        // Wait for the error message shown outside the modal
        await screen.findByText(/hiện đang có bài hát/i);
    });

    test('creates a new genre successfully', async () => {
        genreService.createGenre.mockResolvedValue({ success: true, id: '3', message: 'Tạo thành công!' });

        renderWithRouter(<GenreManagement />);

        const newBtn = await screen.findByText(/New Genre/i);
        fireEvent.click(newBtn);

        fireEvent.change(screen.getByPlaceholderText(/e.g., Hip-hop/i), { target: { value: 'Jazz' } });
        fireEvent.change(screen.getByPlaceholderText(/Share some details/i), { target: { value: 'Smooth jazz' } });

        const createBtn = screen.getByRole('button', { name: /Create Genre/i });
        fireEvent.click(createBtn);

        // Wait for victory
        await screen.findByText(/tạo thành công/i);
    });
});
