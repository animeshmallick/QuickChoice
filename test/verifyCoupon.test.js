jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../src/helpers/couponHelper', () => ({
    isValidCoupon: jest.fn()
}));

// Mock SQL builder so it matches your real function output
jest.mock('../src/resource/sql', () => ({
    get_order_count_from_customer_id: jest.fn((customer_id) =>
        `SELECT COUNT(*) AS total FROM purchase WHERE customer_id = '${customer_id}' AND DATE(placed_on) = CURDATE();`
    )
}));

// Mock token middleware early so we can control it in tests
jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const database = require('../src/internal/database');
const { isValidCoupon } = require('../src/helpers/couponHelper');
const Sql = require('../src/resource/sql');
const token = require('../src/internal/token');

// Import router *after* mocks
const verifyCouponRoute = require('../src/routes/verifyCoupon');

const app = express();
app.use(express.json());
app.use('/', verifyCouponRoute);

describe('Verify Coupon Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if customerId missing', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = null; // simulate missing
            next();
        });

        const response = await request(app).get('/DISCOUNT10');
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: 'Coupon or customer ID missing'
        });
    });

    it('should return 400 if coupon is invalid', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'mock_customer';
            next();
        });
        isValidCoupon.mockReturnValue(false);

        const response = await request(app).get('/FAKECOUPON');
        expect(isValidCoupon).toHaveBeenCalledWith('FAKECOUPON');
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: ' Invalid Coupon'
        });
    });

    it('should return 200 if coupon valid and orders placed > 0', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'mock_customer';
            next();
        });
        isValidCoupon.mockReturnValue(true);
        database.query.mockResolvedValueOnce([{ total: 2 }]);

        const response = await request(app).get('/DISCOUNT10');

        expect(isValidCoupon).toHaveBeenCalledWith('DISCOUNT10');
        expect(Sql.get_order_count_from_customer_id).toHaveBeenCalledWith('mock_customer');
        expect(database.query).toHaveBeenCalledWith(
            `SELECT COUNT(*) AS total FROM purchase WHERE customer_id = 'mock_customer' AND DATE(placed_on) = CURDATE();`
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ success: true, message: 'Success' });
    });

    it('should return 400 if coupon valid but orders placed = 0', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'mock_customer';
            next();
        });
        isValidCoupon.mockReturnValue(true);
        database.query.mockResolvedValueOnce([{ total: 0 }]);

        const response = await request(app).get('/DISCOUNT10');
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ success: false, message: ' Unsuccessful' });
    });

    it('should return 500 if database query throws error', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'mock_customer';
            next();
        });
        isValidCoupon.mockReturnValue(true);
        database.query.mockRejectedValueOnce('DB Error');

        const response = await request(app).get('/DISCOUNT10');
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ success: false, error: 'DB Error' });
    });
});
