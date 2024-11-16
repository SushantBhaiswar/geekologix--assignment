const { Log } = require('../models/index')

const adminMessagessEn = require('../lang/en/adminMessages.json');
const getuserMessagessEn = require('../lang/en/userMessages.json');
const geterrorMessagessEn = require('../lang/en/errorMessages.json');




const getuserMessagess = (messageKey, lang = 'en') => {
  let apiMessagesSource;
  if (lang === 'en') {
    apiMessagesSource = getuserMessagessEn;
  }


  const messageKeyArr = messageKey.split('.');
  const sourceMessageObjKey = messageKeyArr[0];
  const tempMessageKey = messageKeyArr[1];

  if (tempMessageKey in apiMessagesSource[sourceMessageObjKey]) {
    return apiMessagesSource[sourceMessageObjKey][tempMessageKey];
  }
  return 'No appropriate message found for api.';
};

const geterrorMessagess = (messageKey, lang = 'en') => {
  let apiMessagesSource;
  if (lang === 'en') {
    apiMessagesSource = geterrorMessagessEn;
  }


  const messageKeyArr = messageKey.split('.');
  const sourceMessageObjKey = messageKeyArr[0];
  const tempMessageKey = messageKeyArr[1];

  if (tempMessageKey in apiMessagesSource[sourceMessageObjKey]) {
    return apiMessagesSource[sourceMessageObjKey][tempMessageKey];
  }
  return 'No appropriate message found for api.';
};


const getadminMessagess = (messageKey, lang = 'en') => {
  let apiMessagesSource;
  if (lang === 'en') {
    apiMessagesSource = adminMessagessEn;
  } else if (lang === 'fr') {
    apiMessagesSource = adminMessagessEn;
  } else {
    apiMessagesSource = adminMessagessEn;
  }


  const messageKeyArr = messageKey.split('.');
  const sourceMessageObjKey = messageKeyArr[0];
  const tempMessageKey = messageKeyArr[1];

  if (tempMessageKey in apiMessagesSource[sourceMessageObjKey]) {
    return apiMessagesSource[sourceMessageObjKey][tempMessageKey];
  }
  return 'No appropriate message found for api.';
};


const logResponse = async ({ req, data, message, status, statusCode = 200 }) => {

  const ip =
    req.headers['ip-address'] || req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers['x-forwarded-for']

  await Log.create({
    uri: req.originalUrl,
    headers: req.headers,
    method: req.method,
    body: req.body,
    param: req.params,
    ip_address: ip,
    status: statusCode,
    response: { data, message, code: statusCode, status },
  });
};


module.exports = {
  getuserMessagess,
  getadminMessagess,
  geterrorMessagess,
  logResponse,
};
