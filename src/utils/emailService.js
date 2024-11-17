
const nodemailer = require('nodemailer');
const fs = require('fs');
const config = require('../config/config')
const handlebars = require('handlebars');
const verifyEmail = fs.readFileSync('./src/emailTemplates/verificationEmail.html', 'utf8');
const logger = require('../config/logger.js');

const transport = nodemailer.createTransport(config.email.smtp);

transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((err) => logger.warn(`Unable to connect to email server. Make sure you have configured the SMTP options in .env ${err}`));



const sendEmail = async (to, subject, html, attachments) => {
    const arr = to.split('+');
    const arr1 = to.split('@');
    if (arr.length > 1) {
        to = `${arr[0]}@${arr1[1]}`;
    }

    const msg = { from: config.email.from, to, subject, html };
    if (attachments && attachments.length != 0) {
        msg.attachments = attachments
    }
    try {
        await transport.sendMail(msg);
    } catch (error) {
        console.error('Error from send email method', error.stack);
    }

};

const findTemplete = (subject) => {
    if (subject == 'Email Verification') return verifyEmail;
};


/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
// const sendResetPasswordEmail = async (to, data, token, jobCategory) => {
//     const subject = 'Reset password';
//     data = data.toObject();
//     data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_COMMON}/forgot-password/verify?token=${token}`;
//     let platformName = 'MedLocum';


//     if (jobCategory == 'Pharmacy') {
//         data.platformName = 'Med Pharm';
//         data.url = config.MED_PHARMA;
//         data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_PHARMA}/forgot-password/verify?token=${token}`;
//     }
//     else if (jobCategory == 'Primary Care') {
//         data.platformName = 'Med Doc';
//         data.url = config.MED_DOC;
//         data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_DOC}/forgot-password/verify?token=${token}`;
//     } else {
//         data.platformName = 'MedLocum';
//         data.url = config.MED_COMMON_LOGO;
//         data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_COMMON}/forgot-password/verify?token=${token}`;
//     }
//     const templateBody = handlebars.compile(forgotPasswordHtml);
//     const notification = await eventNotification.findOne({ uniqueId: 'forgot_password' })
//     const dynamicObj = { PLATFORMNAME: data.platformName }
//     data.title = makeContentDynamc(dynamicObj, notification.title)
//     data.body = makeContentDynamc(dynamicObj, notification.body)
//     data.currentYear = new Date().getFullYear();

//     const html = templateBody(data);
//     await sendEmail(to, subject, html);
// };


const compileEmail = async (to, data, subject) => {
    data.subject = subject;
    const template = findTemplete(subject)
    const templateBody = handlebars.compile(template);
    const html = templateBody(data);
    await sendEmail(to, subject, html);
};



module.exports = {
    sendEmail,
    compileEmail
};
