const request = require('supertest');
const express = require('express');

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn((req, res, next) => {
        req.customer_id = 'CUST123';
        if(typeof next === 'function') {
            return next();
        }
    })
}));
jest.mock('../src/helpers/placeOrderHelper.js', () => ({
    verifyIsNewPurchase: jest.fn((req, res, next) => { req.purchase_id = 'PURCHASE123'; next(); }),
    verifyAddressOwnership: jest.fn((req, res, next) => { req.address = { address_id: 'ADDR1' }; next(); }),
    createOrders: jest.fn((req, res, next) => { req.order = [{ ProductID: 1, Quantity: 2 }]; next(); }),
    verifyPaymentMethod: jest.fn((req, res, next) => { req.payment_method = 'cod'; next(); }),
    convertOrdersToArray: jest.fn(() => [['orderArray']]),
    convertProductIdToArray: jest.fn(() => [['productArray']]),
    getInsertablePurchaseDoc: jest.fn(() => ({ purchase_id: 'PURCHASE123' })),
}));

jest.mock('../src/internal/database.js', () => ({
    query: jest.fn(),
}));

jest.mock('../src/resource/sql.js', () => ({
    insertIntoOrdersTable: jest.fn(() => 'INSERT_ORDERS'),
    reduceInventory: jest.fn(() => 'REDUCE_INVENTORY'),
    insertIntoPurchaseTable: jest.fn(() => 'INSERT_PURCHASE'),
}));

jest.mock('../src/utils/utils.js', () => ({
    getDateTimeStringFormatted: jest.fn(() => '2025-08-13 12:00:00'),
}));

const database = require('../src/internal/database.js');
const PurchaseStatus = require('../src/constants/PurchaseStatus');

const placeOrderRouter = require('../src/routes/placeOrder');
const app = express();
app.use(express.json());
app.use('/', placeOrderRouter);

describe('Place Order Route', () => {
    const samplePurchaseDoc = {
        purchase_id: 'PURCHASE123',
        address: 'ADDR1',
        payment: 'cod',
        cart: []
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should place an order successfully (201)', async () => {
        database.query
            .mockResolvedValueOnce({}) // insert orders success
            .mockResolvedValueOnce({}) // reduce inventory success
            .mockResolvedValueOnce({}); // insert purchase success

        const res = await request(app)
            .post('/')
            .send(samplePurchaseDoc);

        expect(res.status).toBe(201);
        expect(res.body.status).toBe(PurchaseStatus.PLACED);
        expect(res.body.inventory_reduced).toBe(true);
        expect(database.query).toHaveBeenCalledTimes(3);
    });
    it('should return 206 if inventory reduction fails', async () => {
        database.query
            .mockResolvedValueOnce({}) // insert orders success
            .mockRejectedValueOnce(new Error('Inventory fail')); // reduce inventory fail

        const res = await request(app)
            .post('/')
            .send(samplePurchaseDoc);

        expect(res.status).toBe(206);
        expect(res.body.status).toContain('Order Placed Successfully, but Inventory Reduction Failed');
    });

    it('should return 500 if order insert fails', async () => {
        database.query.mockRejectedValueOnce(new Error('Order insert fail'));

        const res = await request(app)
            .post('/')
            .send(samplePurchaseDoc);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Order insert fail');
    });
    it('should return 500 if purchase insert fails', async () => {
        database.query
            .mockResolvedValueOnce({}) // insert orders success
            .mockResolvedValueOnce({}) // reduce inventory success
            .mockRejectedValueOnce(new Error('Purchase insert fail')); // insert purchase fail

        const res = await request(app)
            .post('/')
            .send(samplePurchaseDoc);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Purchase insert fail');
    });

});