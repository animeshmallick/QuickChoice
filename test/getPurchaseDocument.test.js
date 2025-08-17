const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn(),
    verifyAdminAuthToken: jest.fn()
}));

const mockGetAddress = jest.fn();
const mockGetPayment = jest.fn();
const mockGetOrders = jest.fn();
const mockFindProduct = jest.fn();
jest.mock('../src/helpers/getPurchaseDocumentHelper', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAddress: mockGetAddress,
            getPayment: mockGetPayment,
            getOrders: mockGetOrders,
            findProduct: mockFindProduct
        };
    });
});

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const getPurchaseDocHelper = require('../src/helpers/getPurchaseDocumentHelper');
const getPurchaseDocRouter = require('../src/routes/getPurchaseDocument');
const testHelper = require("../src/helpers/TestHelper");

const app = express();
app.use(express.json());
app.use('/', getPurchaseDocRouter);

describe('GET /getPurchaseDoc/:purchaseID (User)', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 403 if no auth token provided', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(403).json({ message: "Authorization Token Missing" });
        });

        const res = await request(app).get('/123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ message: "Authorization Token Missing" });
    });

    it('should return 401 if purchase does not belong to user', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER001';
            next();
        });
        mockQuery.mockResolvedValueOnce([{ customer_id: 'OTHER_USER' }]);

        const res = await request(app).get('/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toMatch(/Unauthorized Access/);
    });

    it('should return 400 if invalid purchase ID', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER001';
            next();
        });
        mockQuery.mockResolvedValueOnce([]);

        const res = await request(app).get('/INVALID_ID').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: "Invalid Purchase ID" });
    });

    it('should return 200 with purchase document for valid user', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER001';
            next();
        });
        const mockPurchaseDetails = testHelper.get_sql_mock_data(testHelper.mock_data_key.PURCHASE_DETAILS.name);
        const mockProduct = testHelper.get_sql_mock_data(testHelper.mock_data_key.PRODUCT.name);
        // First DB call: get_purchase_details
        mockQuery
            .mockResolvedValueOnce(mockPurchaseDetails)
            // Second DB call - get_all_products_from_ids
            .mockResolvedValueOnce(mockProduct);

        mockGetAddress.mockResolvedValue({ address_id: 'ADDR001', addr_line1: 'Street 1', addr_line2: 'Apt 5' });
        mockGetPayment.mockResolvedValue({payment: "Cash on Delivery", payment_id: "cod"});
        mockGetOrders.mockResolvedValue([{ order_id: 'OID-050825222945-ABCDEF-G8JUB9GQ', product_id: 1, quantity: 2 }]);
        mockFindProduct.mockReturnValue(mockProduct);

        const res = await request(app).get('/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(200);
        expect(res.body.purchase_id).toBe('PURCHASE123');
        expect(res.body.signed).toBe(true);
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USR001';
            next();
        });
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app).get('/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });
});

describe('GET /getPurchaseDoc/admin/:purchaseID (Admin)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if no admin token provided', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(403).json({ message: "Authorization Token Missing" });
        });

        const res = await request(app).get('/admin/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ message: "Authorization Token Missing" });
    });

    it('should return 400 if invalid purchase ID', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });
        mockQuery.mockResolvedValueOnce([]);

        const res = await request(app).get('/admin/INVALID_ID').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: "Invalid Purchase ID" });
    });

    it('should return 200 with purchase document for admin', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        mockQuery
            .mockResolvedValueOnce([{
                customer_id: 'USER001',
                status: 'completed',
                address_id: 'ADDR001',
                order_id: 'ORDER001',
                payment_id: 'PAY001',
                placed_on: '2025-08-14T10:00:00Z'
            }])
            .mockResolvedValueOnce([{ id: 'PROD001', name: 'Sample Product' }]);

        mockGetAddress.mockResolvedValue({ id: 'ADDR001', city: 'Mumbai' });
        mockGetPayment.mockResolvedValue({ id: 'PAY001', method: 'COD' });
        mockGetOrders.mockResolvedValue([{ product_id: '1001', quantity: 2 }]);
        mockFindProduct.mockReturnValue({ id: '1001', name: 'Sample Product' });

        const res = await request(app).get('/admin/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(200);
        expect(res.body.purchase_id).toBe('PURCHASE123');
        expect(res.body.signed).toBe(true);
        expect(res.body.orders[0].product.name).toBe('Sample Product');
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app).get('/admin/PURCHASE123').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });
});
