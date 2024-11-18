const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load environment variables based on NODE_ENV

let envFile = ".env"
if (process.env.NODE_ENV === 'assignment') { envFile = '.env' }
dotenv.config({ path: path.join(__dirname, `../../${envFile}`) });


const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('assignment').required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
            .default(10)
            .description('minutes after which reset password token expires'),
        JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
            .default(10)
            .description('minutes after which verify email token expires'),
        SMTP_HOST: Joi.string().description('server that will send the emails'),
        SMTP_PORT: Joi.number().description('port to connect to the email server'),
        SMTP_USERNAME: Joi.string().description('username for email server'),
        SMTP_PASSWORD: Joi.string().description('password for email server'),
        EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
        SENDMAIL: Joi.boolean().description('options for send mail'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    verifyEmailExpirationMinutes: envVars.EMAIL_VERIFY_OTP_EXPIRATION_MINUTES,

    aws: {
        AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
        AWS_ACCESS_KEY: envVars.AWS_ACCESS_KEY,
        AWS_REGION: envVars.AWS_REGION,
        AWS_BUCKET: envVars.AWS_BUCKET,
        TEMP_FOLDER_PATH: envVars.TEMP_FOLDER_PATH,
        DOCUMENT_FOLDER_PATH: envVars.DOCUMENT_FOLDER_PATH,
        DOWNLOAD_URL_EXPIRY: envVars.DOWNLOAD_URL_EXPIRY,
        LOCATION: envVars.LOCATION,
    },

    database: {
        HOST: envVars.HOST,
        USER: envVars.USER,
        PASSWORD: envVars.PASSWORD,
        AWS_BUCKET: envVars.AWS_BUCKET,
        DATABASE_NAME: envVars.DATABASE_NAME,

    },
   
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
  
};
