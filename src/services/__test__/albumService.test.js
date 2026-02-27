import albumService from '../albumService';
import axiosClient from '../axiosClient';

jest.mock('../axiosClient');

describe('albumService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createAlbum should call correct endpoint', async () => {
        const mockData = { data: { success: true, id: '1', name: 'Best Hits' } };
        axiosClient.post.mockResolvedValue(mockData);

        const albumData = { name: 'Best Hits', description: 'Top songs' };
        const result = await albumService.createAlbum(albumData);

        expect(axiosClient.post).toHaveBeenCalledWith('/album', albumData);
        expect(result).toEqual(mockData.data);
    });

    test('updateAlbum should call correct endpoint', async () => {
        const mockData = { data: { success: true, id: '1', name: 'Updated' } };
        axiosClient.put.mockResolvedValue(mockData);

        const result = await albumService.updateAlbum('1', { name: 'Updated' });

        expect(axiosClient.put).toHaveBeenCalledWith('/album/1', { name: 'Updated' });
        expect(result).toEqual(mockData.data);
    });

    test('addSongToAlbum should call correct endpoint', async () => {
        const mockData = { data: { success: true } };
        axiosClient.post.mockResolvedValue(mockData);

        const result = await albumService.addSongToAlbum('album123', 'song456');

        expect(axiosClient.post).toHaveBeenCalledWith('/album/add-new-song', {
            albumId: 'album123',
            songId: 'song456'
        });
        expect(result).toEqual(mockData.data);
    });

    test('getUserAlbums should call correct endpoint', async () => {
        const mockData = { data: { success: true, data: [{ id: '1', name: 'My Album' }] } };
        axiosClient.get.mockResolvedValue(mockData);

        const result = await albumService.getUserAlbums('user1');

        expect(axiosClient.get).toHaveBeenCalledWith('/album?userId=user1');
        expect(result).toEqual(mockData.data);
    });

    test('getAllAlbums should call correct endpoint', async () => {
        const mockData = { data: { success: true, content: [{ id: '1', name: 'Global Hits' }] } };
        axiosClient.get.mockResolvedValue(mockData);

        const result = await albumService.getAllAlbums();

        expect(axiosClient.get).toHaveBeenCalledWith('/album');
        expect(result).toEqual(mockData.data);
    });

    test('deleteAlbum should call correct endpoint', async () => {
        const mockData = { data: { success: true } };
        axiosClient.delete.mockResolvedValue(mockData);

        const result = await albumService.deleteAlbum('1');

        expect(axiosClient.delete).toHaveBeenCalledWith('/album/1');
        expect(result).toEqual(mockData.data);
    });
});
