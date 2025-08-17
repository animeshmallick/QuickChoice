const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const addAddress = require("../src/routes/addAddress");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', addAddress);

describe('Add Address Route', () => {
    beforeEach(() => {
      mockQuery.mockReset();
    });

    it('POST / should not add address without storename', async () => {
        const response = await request(app).post('/').set('x-authorization','Bearer validtoken');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({ "message": "Store name is missing" });
    });
    it('POST / should not add address without authToken', async () => {
        const response = await request(app).post('/').set('x-storename','dummyStore');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({ "message": "Authorization Token Missing" });
    });
    it('POST / should return error for wrong authToken', async() => {
        const authToken = "abcdefghijklmnopqrstuvwxyz12345667890";
        const response = await request(app).post('/')
            .set('x-authorization', `Bearer ${authToken}`)
            .set('x-storename','dummyStore');
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({"message": "Invalid Authorization Token"});
    });
    it('POST / should return success message upon authToken verification, valid store name and correct address details', async () => {
        const mock_data = testHelper.get_sql_mock_data(testHelper.mock_data_key.USER_ADDRESS_ADDED_SUCCESSFULLY.name);
        mockQuery.mockResolvedValue(mock_data);

        const authToken = token.getToken("USR001");
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .set('x-authorization', `Bearer ${authToken}`)
            .send({
                "address_label": "Friends&Family",
                "addr_line1": "123 Main Street",
                "addr_line2": "Apt 4B",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            });
        console.log(response.status);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({"success": "Address added successfully"});
    });
    it('POST / should return error for wrong address details sent', async() => {
        const mock_data = testHelper.get_sql_mock_data(testHelper.mock_data_key.WRONG_ADDRESS_DETAILS.name);
        mockQuery.mockResolvedValue(mock_data);

        const authToken = token.getToken("USR001");
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .set('x-authorization', `Bearer ${authToken}`)
            .send({
                "address_label": "Friends&Family",
                "addr_line2": "Apt 4B",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({"error": "Something went wrong"});
    });
});