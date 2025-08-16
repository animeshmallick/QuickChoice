const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
class AddNewProductToDatabaseHelper {
    s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
        }
    });
    async uploadImageToS3(file, fileName){
        const key = `${fileName}_${Date.now()}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: "productImages/" + key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        await this.s3.send(new PutObjectCommand(uploadParams));
        return key;
    };
}
module.exports = new AddNewProductToDatabaseHelper();