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

const deleteFileFromAws = (sourceFile, name) => {
    sourceFile = `${config.aws.DOCUMENT_FOLDER_PATH}${name}/${sourceFile}`;

    const myBucket = config.aws.AWS_BUCKET;
    try {
        s3.deleteObject({
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

const getFilePath = (filePath) => {
    return config.awsS3.baseUrl + filePath;
};


// eslint-disable-next-line no-unused-vars
const uploadFile = async (file, newFileName, secretKey = '') => {
    try {
        const myBucket = config.aws.AWS_BUCKET;
        const s3 = new AWS.S3();

        const params = {
            Bucket: myBucket,
            Key: newFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        console.log("params", params)
        // Upload the file to S3
        const data = await s3.upload(params).promise();
        console.log("data", data)
        return data.Location;
    } catch (e) {
        console.error('Error from upload file to S3 method', e.stack);
        return 'error';
    }
};

const getDownloadUrl = (file, name) => {
    file = `${config.aws.DOCUMENT_FOLDER_PATH}${name}/${file}`;
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
    getFilePath,
    uploadFile,
    getDownloadUrl,
    deleteFileFromAws,

};