const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/resource/sql', () => ({
    get_store_timings: jest.fn(() => 'SQL for store timings')
}));

jest.mock('../src/helpers/storeOpenHelper', () => ({
    isOpen: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const Sql = require('../src/resource/sql');
const StoreOpen = require('../src/helpers/storeOpenHelper');
const isStoreOpenRouter = require('../src/routes/isStoreOpen');

const app = express();
app.use(express.json());
app.use('/', isStoreOpenRouter);

describe('GET /isStoreOpen', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 200 with isOpen true if store is open', async () => {
        const mockResult = [
            { opening_time: '09:00:00', closing_time: '21:00:00' }
        ];

        mockQuery.mockResolvedValueOnce(mockResult);
        StoreOpen.isOpen.mockReturnValueOnce(true);

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ isOpen: true });
        expect(mockQuery).toHaveBeenCalledWith(Sql.get_store_timings());
        expect(StoreOpen.isOpen).toHaveBeenCalledWith('09:00:00', '21:00:00');
    });

    it('should return 200 with isOpen false if store is closed', async () => {
        const mockResult = [
            { opening_time: '09:00:00', closing_time: '21:00:00' }
        ];

        mockQuery.mockResolvedValueOnce(mockResult);
        StoreOpen.isOpen.mockReturnValueOnce(false);

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ isOpen: false });
        expect(StoreOpen.isOpen).toHaveBeenCalledWith('09:00:00', '21:00:00');
    });

    it('should return 500 if database query fails', async () => {
        mockQuery.mockRejectedValueOnce('DB error');

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });
});
