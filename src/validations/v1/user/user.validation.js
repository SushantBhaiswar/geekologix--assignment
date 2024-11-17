const Joi = require('joi');


const updateProfile = {
    body: Joi.object().keys({
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
    updateProfile,
    deleteProfile
}