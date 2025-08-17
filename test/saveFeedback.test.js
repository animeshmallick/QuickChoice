const request = require('supertest');
const express = require('express');

const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});
jest.mock('../src/resource/sql', () => ({
    get_product_from_productId: jest.fn((id) => `SQL_GET_PRODUCT_${id}`),
    update_feedback_rating: jest.fn((id, rating) => `SQL_UPDATE_FEEDBACK_${id}_${rating}`)
}));
jest.mock('../src/helpers/saveFeedbackHelper.js', () => ({
    removeDuplicatePayloads: jest.fn((payloads) => payloads)
}));
jest.mock('../src/internal/token', () => ({
    verifyAuthToken: (req, res, next) => {
        req.customer_id = 'mock_customer';
        next();
    }
}));

const database = require('../src/internal/database');
const Sql = require('../src/resource/sql');
const { removeDuplicatePayloads } = require('../src/helpers/saveFeedbackHelper');
const saveFeedbackRoute = require('../src/routes/saveFeedback');

describe('POST /saveFeedback', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/', saveFeedbackRoute);

        jest.clearAllMocks();
    });

    it('should return 400 if duplicate payloads detected', async () => {
        removeDuplicatePayloads.mockReturnValueOnce([{ id: '1', rating: '5' }]); // smaller than original array

        const response = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send([{ id: '1', rating: '5' }, { id: '1', rating: '5' }]);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            status: false,
            message: 'Invalid parameters found in request body'
        });
    });

    it('should handle payload missing id or rating (current router behavior)', async () => {
        // Mock DB to simulate product not found
        mockQuery.mockResolvedValueOnce([]);

        const payloads = [{ rating: '5' }]; // missing id
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send(payloads);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe(false); // no updates
        expect(response.body.message).toBe('0 out of 1 product feedback updated');

        // Ensure DB was still queried despite invalid payload
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('undefined') // matches productId undefined
        );
    });

    it('should return invalid product if product not found', async () => {
        mockQuery
            .mockResolvedValueOnce([]); // no product found

        const payloads = [{ id: '1', rating: '4' }];
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send(payloads);

        expect(mockQuery).toHaveBeenCalledWith('SQL_GET_PRODUCT_1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            status: false,
            message: '0 out of 1 product feedback updated'
        });
    });

    it('should update feedback if product found', async () => {
        mockQuery
            .mockResolvedValueOnce([{}]) // product found
            .mockResolvedValueOnce({}); // update success

        const payloads = [{ id: '1', rating: '4' }];
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send(payloads);

        expect(mockQuery).toHaveBeenNthCalledWith(1, 'SQL_GET_PRODUCT_1');
        expect(mockQuery).toHaveBeenNthCalledWith(2, 'SQL_UPDATE_FEEDBACK_1_4');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            status: true,
            message: '1 out of 1 product feedback updated'
        });
    });

    it('should handle mixed success and failure', async () => {
        mockQuery
            .mockResolvedValueOnce([{}]) // first found
            .mockResolvedValueOnce({})   // update success
            .mockResolvedValueOnce([]);  // second not found

        const payloads = [
            { id: '1', rating: '5' },
            { id: '2', rating: '3' }
        ];

        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send(payloads);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            status: true,
            message: '1 out of 2 product feedback updated'
        });
    });
});
