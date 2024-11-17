const Joi = require('joi');

const retriveProfile = {
    
};

const updateProfile = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
        profileImage: Joi.string().required(),

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