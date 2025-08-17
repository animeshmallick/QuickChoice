const request = require('supertest');
const express = require('express');

const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn((req, res, next) => {
        req.customer_id = 'CUST123';
        next();
    }),
}));

jest.mock('../src/resource/sql', () => ({
    get_user_password: jest.fn((id) => `SELECT password FROM users WHERE id='${id}'`),
    update_user_password: jest.fn((id, pass) => `UPDATE users SET password='${pass}' WHERE id='${id}'`),
}));

const database = require('../src/internal/database');
const token = require('../src/internal/token');
const changePassword = require('../src/routes/changePassword');

const app = express();
app.use(express.json());
app.use('/', changePassword);

describe('Change Password Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 200 when password is updated successfully', async () => {
        mockQuery
            .mockResolvedValueOnce([{ password: 'oldpass' }]) // get_user_password
            .mockResolvedValueOnce({ affectedRows: 1 });       // update_user_password

        const res = await request(app).post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Password updated successfully.' });
        expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 400 if old password is wrong', async () => {
        mockQuery.mockResolvedValueOnce([{ password: 'oldpass' }]); // get_user_password

        const res = await request(app)
            .post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'wrongpass', newPassword: 'newpass' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid Details Entered' });
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if new password is same as old password', async () => {
        mockQuery.mockResolvedValueOnce([{ password: 'samepass' }]); // get_user_password

        const res = await request(app)
            .post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'samepass', newPassword: 'samepass' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid Details Entered' });
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if store name is missing', async () => {
        const response = await request(app).post('/').send({ oldPassword: 'samepass', newPassword: 'samepass' });

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: "Store name is missing" });
    });

    it('should return 500 if update_user_password throws error', async () => {
        mockQuery
            .mockResolvedValueOnce([{ password: 'oldpass' }]) // get_user_password
            .mockRejectedValueOnce(new Error('DB update failed')); // update_user_password

        const res = await request(app)
            .post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('err', 'DB update failed');
        expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 500 if get_user_password throws error', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB fetch failed'));

        const res = await request(app)
            .post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('err', 'DB fetch failed');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if token verification fails', async () => {
        token.verifyAuthToken.mockImplementationOnce((req, res) => {
            return res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(app)
            .post('/')
            .set('x-storename','dummyStore')
            .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Unauthorized' });
        expect(mockQuery).not.toHaveBeenCalled();
    });
});
