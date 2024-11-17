const Joi = require('joi');

const retriveData = {
    body: Joi.object().keys({
        userId: Joi.string().required(),

    }),
};

const updateUser = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
    body: Joi.object().keys({
        profileImage: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),

    }),
};

const deleteUser = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
    }),
};

module.exports = {
    retriveData,
    updateUser,
    deleteUser,

}