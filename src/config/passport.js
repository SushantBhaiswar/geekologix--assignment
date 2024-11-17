/* eslint-disable eqeqeq */
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const db = require('../db')
const { tokenTypes } = require('./enumValues');

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
// stagery for all routes 
const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = await db.query('SELECT * FROM users WHERE id = ? AND isDeleted = ?', [payload?.userId, false])
        
        if (!user) {
            return done(null, false);
        }
        done(null, user[0]);
    } catch (error) {
        done(error, false);
    }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
    jwtStrategy,
};
