/* eslint-disable no-console */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const httpStatus = require('http-status');
const config = require('../../../config/config');
const logger = require('../../../config/logger');
const enumArr = require('../../../config/enum')
const { adminVerification, User, eventNotification } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { makeContentDynamc } = require('../../../utils/customize')
const forgotPasswordHtml = fs.readFileSync('./src/emailTemplete/forgotPassword.html', 'utf8');
const verifyEmail = fs.readFileSync('./src/emailTemplete/verifyEmail.html', 'utf8');
const verifyAdditionalEmail = fs.readFileSync('./src/emailTemplete/verifyAdditionalEmail.html', 'utf8');
const addUserHtml = fs.readFileSync('./src/emailTemplete/addUser.html', 'utf8');
const acceptRequestHtml = fs.readFileSync('./src/emailTemplete/acceptRequest.html', 'utf8');
const rejectRequestHtml = fs.readFileSync('./src/emailTemplete/rejectRequest.html', 'utf8');
const notificationhtml = fs.readFileSync('./src/emailTemplete/notification.html', 'utf8');
const notificationhtml2 = fs.readFileSync('./src/emailTemplete/notification2.html', 'utf8');
const accountDeletehtml = fs.readFileSync('./src/emailTemplete/accountDelete.html', 'utf8');
const accountDeletedByAdmin = fs.readFileSync('./src/emailTemplete/accountDeletedByAdmin.html', 'utf8');
const adminNotificationhtml = fs.readFileSync('./src/emailTemplete/adminNotification.html', 'utf8');
const userRegristredByadmin = fs.readFileSync('./src/emailTemplete/userRegristredByadmin.html', 'utf8');
const rejectAccountRequest = fs.readFileSync('./src/emailTemplete/rejectRequest.html', 'utf8');
const welcomeEmail = fs.readFileSync('./src/emailTemplete/welcome.html', 'utf8');
const eventEmailnotification = fs.readFileSync('./src/emailTemplete/eventEmailnotification.html', 'utf8');
const transport = nodemailer.createTransport(config.email.smtp);
const { audit_logger } = require('../../../utils/logging')
const findTemplete = (templeteName) => {
    if (templeteName == 'notificationhtml') return notificationhtml;
    if (templeteName == 'notificationhtml2') return notificationhtml2;
    if (templeteName == 'adminNotificationhtml') return adminNotificationhtml;
    if (templeteName == 'accountDeletehtml') return accountDeletehtml;
    if (templeteName == 'accountDeletedByAdmin') return accountDeletedByAdmin;
    if (templeteName == 'userRegristredByadmin') return userRegristredByadmin;
    if (templeteName == 'rejectRequest') return rejectAccountRequest;
    if (templeteName == 'welcomeEmailhtml') return welcomeEmail;
    if (templeteName == 'verifyEmail') return verifyEmail;
    if (templeteName == 'resetPassword') return forgotPasswordHtml;
    if (templeteName == 'eventEmailnotification') return eventEmailnotification;
    if (templeteName == 'addUserHtml') return addUserHtml;
};
const process = require('node:process');
const connectEmailServer = () => {
    return transport
        .verify()
        .then(() => { return true })
        .catch((err) => {
            return Promise.reject(err);
        });
}
const findButtonName = (notificaitonId) => {
    let array = enumArr.LOGINBUTTONARR
    for (let el in array) {
        if (el == 'loginButtonArr' && array[el].includes(notificaitonId)) {
            return "Login Now"
        }
        if (el == 'downloadButtonArr' && array[el].includes(notificaitonId)) {
            return "Download Recovery Codes"
        }
        if (el == 'recoverButtonArr' && array[el].includes(notificaitonId)) {
            return "Recover"
        }
    }
    return 'Open Notification'
}
/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html, attachments) => {
    const arr = to.split('+');
    const arr1 = to.split('@');
    if (arr.length > 1) {
        to = `${arr[0]}@${arr1[1]}`;
    }
    if (config.SENDMAIL) {
        const msg = { from: config.email.from, to, subject, html };
        if (attachments && attachments.length != 0) {
            msg.attachments = attachments
        }
        try {
            await transport.sendMail(msg);
        } catch (error) {
            console.error('Error from send email method', error.stack);
        }
    }
};

const addUser = async (requestBody, senderId, session) => {
    const { role, email } = requestBody;
    requestBody.senderId = senderId;
    if (await User.isEmailTaken(requestBody.email)) {
        throw new ApiError(httpStatus.CONFLICT, 'Email address is already registered by another user.');
    }
    let user = await adminVerification.findOne({ email });
    let dataId = user?._id
    if (user) {
        let user = await adminVerification.updateOne({ email }, { $set: requestBody }, { session });
    } else {
        user = await adminVerification.create([requestBody], { session });
        dataId = user[0]?._id
    }
    if (user.bounceCount >= 3) throw new ApiError(httpStatus.BAD_REQUEST, `Oops! It seems that the email address you provided, ${email} is not valid.`);
    await audit_logger(session, 'SB48', senderId, requestBody, dataId, 'adminVerification')
    return user[0]
};

const resendInvitation = async (req, session) => {
    const email = req.body.email
    let user = await adminVerification.findOne({ email });
    if (user.status != 'pending') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already registred.');
    }
    if (user.limit > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'You have exceed the invitation limit.');
    }
    if (!user)
        throw new ApiError(httpStatus.BAD_REQUEST, 'Verification details not found.');

    if (user.bounceCount >= 3) throw new ApiError(httpStatus.BAD_REQUEST, `Oops! It seems that the email address you provided, ${email} is not valid.`);

    const subject = 'User registration';
    const requestBody = { ...JSON.parse(JSON.stringify(user)) }
    if (user.role == 'sub-admin') requestBody.link = `${config.ADDUSER_URL}invite?code=${user._id}`;
    else requestBody.link = `${config.ADDUSER_URL}signup/${user.role}?code=${user._id}`;
    let platformName = 'MedLocum'

    if (!requestBody.category || requestBody.category == 'Both') requestBody.url = config.MED_COMMON_LOGO
    else if (requestBody.category == 'Pharmacy') {
        requestBody.url = config.MED_PHARMA
        platformName = 'Med Pharm'

    } else {
        platformName = 'Med Doc'
        requestBody.url = config.MED_DOC
    }
    const notification = await eventNotification.findOne({ uniqueId: 'E301173' })
    const dynamicObj = { PLATFORMNAME: platformName }
    requestBody.title = await makeContentDynamc(dynamicObj, notification.title)
    requestBody.body = await makeContentDynamc(dynamicObj, notification.body)
    requestBody.currentYear = new Date().getFullYear();
    requestBody.name = user.firstName,


        requestBody.platformName = platformName
    const templateBody = handlebars.compile(addUserHtml);
    const html = templateBody(requestBody);
    await sendEmail(email, subject, html);
    await adminVerification.updateOne({ email }, { $inc: { limit: 1 } }, { session })
    await audit_logger(session, 'SB49', req.user._id, requestBody, user._id, 'adminVerification')

    return user.role
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, data, token, jobCategory) => {
    const subject = 'Reset password';
    data = data.toObject();
    data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_COMMON}/forgot-password/verify?token=${token}`;
    let platformName = 'MedLocum';


    if (jobCategory == 'Pharmacy') {
        data.platformName = 'Med Pharm';
        data.url = config.MED_PHARMA;
        data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_PHARMA}/forgot-password/verify?token=${token}`;
    }
    else if (jobCategory == 'Primary Care') {
        data.platformName = 'Med Doc';
        data.url = config.MED_DOC;
        data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_DOC}/forgot-password/verify?token=${token}`;
    } else {
        data.platformName = 'MedLocum';
        data.url = config.MED_COMMON_LOGO;
        data.resetPasswordUrl = `${config.EMAIL_REDIRECT_URL_COMMON}/forgot-password/verify?token=${token}`;
    }
    const templateBody = handlebars.compile(forgotPasswordHtml);
    const notification = await eventNotification.findOne({ uniqueId: 'forgot_password' })
    const dynamicObj = { PLATFORMNAME: data.platformName }
    data.title = makeContentDynamc(dynamicObj, notification.title)
    data.body = makeContentDynamc(dynamicObj, notification.body)
    data.currentYear = new Date().getFullYear();

    const html = templateBody(data);
    await sendEmail(to, subject, html);
};

const sendApproveOrRejectMail = async (data, status) => {
    const subject = status === 'approved' ? 'Request Accepted' : 'Request Declined';
    let templete;
    if (status === 'approved') templete = acceptRequestHtml;
    else templete = rejectRequestHtml;
    if (!data.jobCategory) {
        data.url = config.MED_COMMON_LOGO;

        data.RedirectLink = `${config.EMAIL_REDIRECT_URL_CLIENT}`
    }
    if (data.jobCategory == 'Pharmacy') {
        data.RedirectLink = `${config.EMAIL_REDIRECT_URL_PHARMA}`
        data.url = config.MED_PHARMA;
    }
    else {
        data.url = config.MED_DOC;
        data.RedirectLink = `${config.EMAIL_REDIRECT_URL_DOC}`
    }
    data.currentYear = new Date().getFullYear();

    const templateBody = handlebars.compile(templete);
    const html = templateBody(data);
    await sendEmail(data.email, subject, html);
};

const sendOtpForVerifaction = async (to, data, otp, type, userId) => {
    data = data.toObject();
    data.otp = otp;
    let subject;
    let templete;
    let founder = 'forgot_password';
    if (type === 'verifyEmail') {
        subject = 'Email Verification';
        founder = 'email_verification'
        templete = verifyEmail;
    }
    if (type === 'resetPassword') {
        subject = 'Reset Password';
        templete = forgotPasswordHtml;
    }
    data.RedirectLink = `${config.EMAIL_REDIRECT_URL_CANDIDATE}signup/verify/?id=${userId}`
    data.url = config.MED_COMMON_LOGO;

    if (data.registrationNumber) {
        if (data.registrationNumber.type === 'PSI') {
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_PHARMA}/signup/verify/?id=${userId}`
            data.url = config.MED_PHARMA;
            data.platformName = "Med Pharm";
        }
        else {
            data.url = config.MED_DOC;
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_DOC}/signup/verify/?id=${userId}`
            data.platformName = "Med Doc";
        }
    } else {
        if (data.category == 'Primary Care') {
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_DOC}/signup/verify/?id=${userId}`
            data.url = config.MED_DOC;
            data.platformName = "Med Doc";
        } else {
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_PHARMA}/signup/verify/?id=${userId}`
            data.url = config.MED_PHARMA;
            data.platformName = "Med Pharm";
        }
    }
    const templateBody = handlebars.compile(templete);
    const notification = await eventNotification.findOne({ uniqueId: founder })
    const dynamicObj = { PLATFORMNAME: data.platformName }
    data.title = makeContentDynamc(dynamicObj, notification.title)
    data.body = makeContentDynamc(dynamicObj, notification.body)
    data.currentYear = new Date().getFullYear();


    const html = templateBody(data);

    await sendEmail(to, subject, html);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, data, otp) => {
    const subject = 'Email Verification';
    data = data.toObject();
    data.otp = otp;
    let platformName = 'MedLocum';

    if (data?.registrationNumber || data.category) {
        if (data?.registrationNumber?.type === 'PSI' || data.category == 'Pharmacy') {
            platformName = 'Med Pharm';
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_PHARMA}/signup/verify/?id=${data.userId}`
            data.url = config.MED_PHARMA
        }
        else if (data?.registrationNumber?.type === 'IMC / NMBI' || data.category == 'Primary Care') {
            data.url = config.MED_DOC;
            data.RedirectLink = `${config.EMAIL_REDIRECT_URL_DOC}/signup/verify/?id=${data.userId}`
            platformName = 'Med Doc';
        }
    } else {
        data.url = config.MED_COMMON_LOGO;
        data.RedirectLink = `${config.EMAIL_REDIRECT_URL_CANDIDATE}signup/verify/?id=${data.userId}`
    } const templateBody = handlebars.compile(verifyEmail);
    data.platformName = platformName

    const notification = await eventNotification.findOne({ uniqueId: 'email_verification' })
    const dynamicObj = { PLATFORMNAME: platformName }
    data.title = makeContentDynamc(dynamicObj, notification.title)
    data.body = makeContentDynamc(dynamicObj, notification.body)


    const html = templateBody(data);
    await sendEmail(to, subject, html);
};

const sendVerificationEmailForAdmin = async (to, name, otp, userDetail) => {
    const subject = 'Email Verification';
    const data = { otp, name };
    data.url = config.MED_COMMON_LOGO;
    let platformName = 'MedLocum';
    if (userDetail?.registrationNumber || userDetail.category) {
        if (userDetail?.registrationNumber?.type === 'PSI' || userDetail.category == 'Pharmacy') {
            platformName = 'Med Pharm';

        }
        else if (userDetail?.registrationNumber?.type === 'IMC / NMBI' || userDetail.category == 'Primary Care') {
            platformName = 'Med Doc';
        }
    }
    data.platformName = platformName
    data.currentYear = new Date().getFullYear();

    const templateBody = handlebars.compile(verifyAdditionalEmail);
    const html = templateBody(data);
    sendEmail(to, subject, html);
};



/**
 * create notification
 * @param {*} emailObject {to, title, templeteName, jobCategory} to is email , title is email title , and email template , jobcategory to specify logo
 * @param {*} receiverArray - if has receiver detail 
 * @param {*} templeteName - template name
 */
const sendEmailNotification = async (emailObject, otherObject) => {
    const { to, emailtitle, templeteName, jobCategory } = emailObject

    const templete = findTemplete(templeteName);
    if (!templete)
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email template name');

    const templateBody = handlebars.compile(templete);
    let url = config.MED_COMMON_LOGO;
    let platformName = 'MedLocum';
    //otherObject.RedirectLink = config.EMAIL_REDIRECT_URL_COMMON;
    const domain = jobCategory == 'Pharmacy' ? config.EMAIL_REDIRECT_URL_PHARMA : jobCategory == 'Primary Care' ? config.EMAIL_REDIRECT_URL_DOC : config.EMAIL_REDIRECT_URL_COMMON
    if (Object.keys(otherObject).length != 0)
        otherObject.RedirectLink = otherObject?.RedirectLink?.replace(config.EMAIL_REDIRECT_URL_COMMON, domain)

    if (!jobCategory || jobCategory == 'Both') url = config.MED_COMMON_LOGO;
    if (jobCategory == 'Pharmacy') {
        url = config.MED_PHARMA;
        //otherObject.RedirectLink = config.EMAIL_REDIRECT_URL_PHARMA;
        platformName = 'Med Pharm';
    } else if (jobCategory == 'Primary Care') {
        url = config.MED_DOC;
        //  otherObject.RedirectLink = config.EMAIL_REDIRECT_URL_DOC;
        platformName = 'Med Doc';
    }
    otherObject.url = url;
    otherObject.platformName = platformName
    otherObject.buttonText = findButtonName(emailtitle)
    otherObject.currentYear = new Date().getFullYear();
    const html = templateBody(otherObject);

    if (to != "tom@meddoc.ie") {
        await sendEmail(to, emailtitle, html);
    }
};

module.exports = {
    transport,
    sendEmail,
    sendResetPasswordEmail,
    sendVerificationEmail,
    sendOtpForVerifaction,
    sendApproveOrRejectMail,
    addUser,
    sendEmailNotification,
    resendInvitation,
    sendVerificationEmailForAdmin,
    findTemplete,
    findButtonName,
    connectEmailServer
};
