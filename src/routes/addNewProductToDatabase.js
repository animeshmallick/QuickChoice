const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const express = require('express');
const multer = require('multer');
const helper = require('../helpers/addNewProductToDatabaseHelper.js');

const storage = multer.memoryStorage();
const upload = multer({storage});

const router = express.Router();
router.post('/', upload.array('images', 10), async function (req, res, next) {
    const product = req.body;
    const imageFiles = req.files;
    const imageUrls = [];
    if (!imageFiles || imageFiles.length < 1){
        res.status(400).json({message: "Required At least 2 images"});
        return;
    }
    // Check if product is already [resent in DB
    database.query(Sql.check_product_in_database(product))
        .then(async sql_response => {
            if (sql_response[0]['length'] === 0) {
                // Upload Images to S3 bucket
                for (const file of imageFiles) {
                    const imageKey = await helper.uploadImageToS3(file, product.name);
                    imageUrls.push(imageKey);
                }
                product.imageUrls = imageUrls.join("&&");
                // Add product to DB
                database.query(Sql.add_new_product_to_db(product))
                    .then(result => {
                        res.status(200).json({message: 'Product Added Successfully'})
                    })
                    .catch(err => {
                        res.status(500).json({message: 'Something went wrong.'});
                    });
            } else {
                res.status(400).json({message: 'Product already exists in Database'});
            }
        })
        .catch(err => {
            res.status(500).json({message: err.message});
        });
});
router.get("/", function (req, res, next){
    res.status(400).json("GET Call Not Handled");
});
module.exports = router;
