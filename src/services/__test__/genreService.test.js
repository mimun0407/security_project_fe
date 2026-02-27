import genreService from '../genreService';
import axiosClient from '../axiosClient';

jest.mock('../axiosClient');

describe('genreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllGenres should call correct endpoint', async () => {
        const mockData = { data: { success: true, data: [{ id: '1', name: 'Pop' }] } };
        axiosClient.get.mockResolvedValue(mockData);

        const result = await genreService.getAllGenres();

        expect(axiosClient.get).toHaveBeenCalledWith('/genre');
        expect(result).toEqual(mockData.data);
    });

    test('getAllGenres with search term should call correct endpoint', async () => {
        const mockData = { data: { success: true, data: [{ id: '1', name: 'Rock' }] } };
        axiosClient.get.mockResolvedValue(mockData);

        const result = await genreService.getAllGenres('Rock');

        expect(axiosClient.get).toHaveBeenCalledWith('/genre?name=Rock');
        expect(result).toEqual(mockData.data);
    });

    test('createGenre should call correct endpoint', async () => {
        const mockData = { data: { success: true, id: '2', name: 'Jazz' } };
        axiosClient.post.mockResolvedValue(mockData);

        const genreData = { name: 'Jazz', description: 'Smooth jazz' };
        const result = await genreService.createGenre(genreData);

        expect(axiosClient.post).toHaveBeenCalledWith('/genre', genreData);
        expect(result).toEqual(mockData.data);
    });

    test('updateGenre should call correct endpoint', async () => {
        const mockData = { data: { success: true, id: '1', name: 'K-Pop' } };
        axiosClient.put.mockResolvedValue(mockData);

        const genreData = { name: 'K-Pop' };
        const result = await genreService.updateGenre('1', genreData);

        expect(axiosClient.put).toHaveBeenCalledWith('/genre/1', genreData);
        expect(result).toEqual(mockData.data);
    });

    test('deleteGenre should call correct endpoint', async () => {
        const mockData = { data: { success: true } };
        axiosClient.delete.mockResolvedValue(mockData);

        const result = await genreService.deleteGenre('1');

        expect(axiosClient.delete).toHaveBeenCalledWith('/genre/1');
        expect(result).toEqual(mockData.data);
    });
});
