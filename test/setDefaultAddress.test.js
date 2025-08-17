const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn()
}));

jest.mock('../src/resource/sql', () => ({
    set_default_address: jest.fn()
}));

jest.mock('../src/helpers/setDefaultAddressHelper', () => ({
    verifyAddressOwnership: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const database = require('../src/internal/database');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const helper = require('../src/helpers/setDefaultAddressHelper');
const setDefaultAddressRouter = require('../src/routes/setDefaultAddress');

const app = express();
app.use(express.json());
app.use('/', setDefaultAddressRouter);

describe('POST /setDefaultAddress', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks for middlewares
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'CUST123';
            next();
        });

        helper.verifyAddressOwnership.mockImplementation((req, res, next) => {
            next();
        });
    });

    it('should return 200 when default address is updated successfully', async () => {
        Sql.set_default_address.mockReturnValueOnce('SQL QUERY');
        mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken')
            .send({ address_id: 'ADDRS1111111' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            success: true,
            message: 'Default address changed successfully'
        });
        expect(Sql.set_default_address).toHaveBeenCalledWith('CUST123', 'ADDRS1111111');
        expect(mockQuery).toHaveBeenCalledWith('SQL QUERY');
    });

    it('should return 400 when database query fails', async () => {
        Sql.set_default_address.mockReturnValueOnce('SQL QUERY');
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken')
            .send({ address_id: 'ADDRS1111111' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            success: false,
            error: 'Invalid parameters'
        });
    });

    it('should pass through middlewares verifyAuthToken and verifyAddressOwnership', async () => {
        const spyAuth = jest.fn((req, res, next) => next());
        const spyOwnership = jest.fn((req, res, next) => next());

        token.verifyAuthToken.mockImplementationOnce(spyAuth);
        helper.verifyAddressOwnership.mockImplementationOnce(spyOwnership);

        Sql.set_default_address.mockReturnValueOnce('SQL QUERY');
        mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

        await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken')
            .send({ address_id: 'ADDRS1111111' });

        expect(spyAuth).toHaveBeenCalled();
        expect(spyOwnership).toHaveBeenCalled();
    });
});
