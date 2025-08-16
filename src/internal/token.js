const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET_KEY ?? 'default_secret_key';
const ADMIN_SECRET = process.env.JWT_SECRET_KEY ?? 'admin_default_secret_key';

class Token {
    getToken(customer_id) {
        return jwt.sign({ customer_id: customer_id }, SECRET, { expiresIn: '12h' });
    }
    getAdminToken(user_id) {
        return jwt.sign({ admin_user_id: user_id }, ADMIN_SECRET, { expiresIn: '1h' });
    }

    verifyAuthToken(req, res, next) {
        const authHeader = req.headers['x-authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Authorization Token Missing" });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, authToken) => {
            if (err) {return res.status(401).json({ message: "Invalid Authorization Token" });}

            req.customer_id = authToken.customer_id;
            next();
        });
    }
    verifyAdminAuthToken(req, res, next) {
        const authHeader = req.headers['x-authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "Admin Authorization Token Missing" });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, ADMIN_SECRET, (err, authToken) => {
            if (err) {return res.status(401).json({ message: "Invalid Admin Authorization Token" });}

            req.admin_user_id = authToken.admin_user_id;
            next();
        });
    }
}

module.exports = new Token();
