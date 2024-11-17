const Joi = require('joi');

const retriveProfile = {

};

const updateProfile = {
    params: Joi.object().keys({
        profileImage: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),

    }),
};

const deleteProfile = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
    }),
};


module.exports = {
    retriveProfile,
    updateProfile,
    deleteProfile
}