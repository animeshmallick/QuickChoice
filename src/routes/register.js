const express = require('express');
const twilio = require('twilio');
const utils = require('../utils/utils');

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @swagger
 * /register/send-otp:
 *   post:
 *     summary: Send OTP to a phone number
 *     tags:
 *       - OTP
 *     requestBody:
 *       description: Phone number in given format (e.g., +91xxxxxxxxxx)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid phone number format
 *       500:
 *         description: Failed to send OTP
 */
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    console.log(`Send OTP to phone ${phone}`);
    if (!phone || !utils.isValidPhone(phone)) {
        console.log("Invalid phone number. (+91 is required in phone number)");
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    try {
        await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({ to: phone, channel: 'sms' });
        console.log(`OTP Send To phone ${phone} successfully.`)
        res.json({ success: true, message: 'OTP sent successful' });
    } catch (err) {
        console.error('Twilio Send Error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

/**
 * @swagger
 * /register/verify-otp:
 *   post:
 *     summary: Verify OTP for a phone number
 *     tags:
 *       - OTP
 *     requestBody:
 *       description: Phone and OTP code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing or invalid input
 *       401:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Registration failed
 */
router.post('/verify-otp', async (req, res) => {
    const {phone, otp } = req.body;
    console.log(`Verify OTP for phone ${phone}`);
    if (!phone || !otp || !utils.isValidPhone(phone)) {
        console.log("Invalid phone number. (+91 is required in phone number)");
        return res.status(400).json({ success: false, message: 'Missing or invalid input' });
    }

    try {
        const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({ to: phone, code: otp });

        if (verification.status !== 'approved') {
            console.log(`Verify OTP FAILED for phone ${phone}`);
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }
        console.log(`Verify OTP for phone ${phone} successfully`);
        res.json({ success: true, message: 'OTP validation successful' });

    } catch (err) {
        console.error('DB/OTP Error:', err.message);
        res.status(500).json({ success: false, message: 'OTP Verification Failed' });
    }
});

module.exports = router;