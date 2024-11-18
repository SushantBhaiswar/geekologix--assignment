
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
