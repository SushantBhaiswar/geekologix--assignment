/* eslint-disable security/detect-non-literal-fs-filename */
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const momentJs = require('moment');
const config = require('../config/config');


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





module.exports = {
  getuserMessagess,
  getadminMessagess,
  geterrorMessagess,
};
