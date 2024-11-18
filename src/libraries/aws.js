/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-console */
const aws = require('aws-sdk');
const config = require('../config/config');

const s3 = new aws.S3({
    accessKeyId: config.aws.AWS_ACCESS_KEY,
    secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY,
    region: config.aws.AWS_REGION,
});

const deleteFileFromAws = async (sourceFile) => {

    const myBucket = config.aws.AWS_BUCKET;
    try {
        await s3.deleteObject({
            Bucket: myBucket,
            Key: sourceFile,
        })
            .promise()
            .then(() => {
                console.log('deleted successFully');
            })
            .catch((e) => {
                console.log('Error while deleting s3 file', e.stack);
                return 'error';
            });
    } catch (error) {
        console.log(error.message);
    }
};




// eslint-disable-next-line no-unused-vars
const uploadFile = async (file) => {
    try {
        const myBucket = config.aws.AWS_BUCKET;
        file.originalname = `${Date.now()}${file.originalname}`
        const params = {
            Bucket: myBucket,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        // Upload the file to S3
        const data = await s3.upload(params).promise();
        console.log("data", data)
        return data.key;
    } catch (e) {
        console.error('Error from upload file to S3 method', e.stack);
        return 'error';
    }
};

const getDownloadUrl = (file) => {
    const myBucket = config.aws.AWS_BUCKET;
    const options = {
        Bucket: myBucket,
        Key: file,
        Expires: Number(config.aws.DOWNLOAD_URL_EXPIRY),
    };

    const url = s3.getSignedUrl('getObject', options);
    return url;
};



module.exports = {
    uploadFile,
    getDownloadUrl,
    deleteFileFromAws,

};