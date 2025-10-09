const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.BUCKET_REGION
});

const uploadFileToS3 = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `projects/${Date.now()}-${file.originalname.replace(/\s+/g, '')}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('File upload failed');
    }
};

module.exports = { uploadFileToS3 };