require("dotenv").config();

const express = require('express');
const logger = require("./src/utils/logger");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const app = express();

// Ensure logs directory exists
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

const allowedOrigins = [
    'https://www.grocerschoice.in',
    'https://qa.grocerschoice.in',
    'http://localhost:8888'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,x-authorization,x-storename');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logging
app.use(morgan('combined', { stream: accessLogStream }));

// Routes
app.use('/ping', require('./src/routes/ping'));
app.use('/categories', require('./src/routes/categories'));
app.use('/category', require('./src/routes/productsFromCategory'));
app.use('/product', require('./src/routes/product'));
app.use('/cart', require('./src/routes/cart'));
app.use('/similarProducts', require('./src/routes/similarProducts'));
app.use('/addNewProductToDatabase', require('./src/routes/addNewProductToDatabase'));
app.use('/getAuthToken', require('./src/routes/getAuthToken'));
app.use('/login', require('./src/routes/login'));
app.use('/isvalidToken', require('./src/routes/isValidToken'));
app.use('/getAllProducts', require('./src/routes/getAllProducts'));
app.use('/getUserAddresses', require('./src/routes/getAddress'));
app.use('/getPaymentMethod', require('./src/routes/getPaymentMethod'));
app.use('/getPurchaseID', require('./src/routes/getPurchaseID'));
app.use('/placeOrder', require('./src/routes/placeOrder'));
app.use('/adminLogin', require('./src/routes/adminLogin'));
app.use('/getAllPurchase', require('./src/routes/getAllPurchase'));
app.use('/getPurchaseDoc', require('./src/routes/getPurchaseDocument'));
app.use('/addAddress', require('./src/routes/addAddress'));
app.use('/changePurchaseStatus', require('./src/routes/changePurchaseStatus'));
app.use('/getUserPurchases', require('./src/routes/getUserPurchases'));
app.use('/getUserProfile', require('./src/routes/getUserProfile'));
app.use('/register', require('./src/routes/register'));
app.use('/changePassword', require('./src/routes/changePassword'));
app.use('/userRegistration', require('./src/routes/userRegistration'));
app.use('/isStoreOpen', require('./src/routes/isStoreOpen'));
app.use('/changeStoreTiming', require('./src//routes/changeStoreTiming'));
app.use('/verifyCoupon', require('./src/routes/verifyCoupon'));
app.use('/setDefaultAddress', require('./src/routes/setDefaultAddress'));
app.use('/saveFeedback', require('./src/routes/saveFeedback'));
app.use('/changeAddress', require('./src/routes/changeAddress'));
app.use('/mostOrderedProduct', require('./src/routes/mostOrderedProduct'));
app.use('/deleteAddress', require('./src/routes/deleteAddress'));
app.use('/getStreakCount', require('./src/routes/getStreakCount'));
app.use('/setHappyHoursProduct', require('./src/routes/setHappyHoursProduct'));
app.use('/deleteHappyHour', require('./src/routes/deleteHappyHour'));
app.use('/orderFeedback', require('./src/routes/orderFeedback'));
app.use('/setFeaturedProduct', require('./src/routes/setFeaturedProduct'));
app.use('/deleteFeaturedProduct', require('./src/routes/deleteFeaturedProduct'));
app.use('/queueSize', require('./src/routes/queueSize'));

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({success: false, message: "Endpoint Not Found",});
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.statusCode || 500).json({success: false, message: err.message || "Internal Server Error",});
});

module.exports = app;
