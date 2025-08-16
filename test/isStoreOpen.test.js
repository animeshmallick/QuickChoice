jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../src/resource/sql', () => ({
    get_store_timings: jest.fn(() => 'SQL for store timings')
}));

jest.mock('../src/helpers/storeOpenHelper', () => ({
    isOpen: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const database = require('../src/internal/database');
const Sql = require('../src/resource/sql');
const StoreOpen = require('../src/helpers/storeOpenHelper');
const isStoreOpenRouter = require('../src/routes/isStoreOpen');

const app = express();
app.use(express.json());
app.use('/', isStoreOpenRouter);

describe('GET /isStoreOpen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 with isOpen true if store is open', async () => {
        const mockResult = [
            { opening_time: '09:00:00', closing_time: '21:00:00' }
        ];

        database.query.mockResolvedValueOnce(mockResult);
        StoreOpen.isOpen.mockReturnValueOnce(true);

        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ isOpen: true });
        expect(database.query).toHaveBeenCalledWith(Sql.get_store_timings());
        expect(StoreOpen.isOpen).toHaveBeenCalledWith('09:00:00', '21:00:00');
    });

    it('should return 200 with isOpen false if store is closed', async () => {
        const mockResult = [
            { opening_time: '09:00:00', closing_time: '21:00:00' }
        ];

        database.query.mockResolvedValueOnce(mockResult);
        StoreOpen.isOpen.mockReturnValueOnce(false);

        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ isOpen: false });
        expect(StoreOpen.isOpen).toHaveBeenCalledWith('09:00:00', '21:00:00');
    });

    it('should return 500 if database query fails', async () => {
        database.query.mockRejectedValueOnce('DB error');

        const res = await request(app).get('/');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });
});
