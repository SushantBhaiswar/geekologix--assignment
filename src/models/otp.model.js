const db = require('../db');
const commonFunction = require('../utils/commonFunction')
const config = require('../config/config')
const OTP = {};

// Initialize table if not exists
OTP.init = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,               
    user_id INT NOT NULL,                                                     
    type ENUM('verifyEmail') NOT NULL,   
    otp INT NOT NULL,                                 
    expired_at BIGINT,                              
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
    INDEX idx_created_at (created_at)                 )` ;

    await db.query(query);
};



OTP.find = async (user_id, type) => {
    const otpQuery = 'SELECT * FROM otps WHERE user_id =? AND type = ?'
    const row = await db.query(otpQuery, [user_id, type])
    return row?.[0]
}

OTP.generate = async (userId, type) => {
    const otp = Math.floor(Math.random() * (999999 - 99999) + 99999);

    const expiredAt = commonFunction.setexpiry(config.verifyEmailExpirationMinutes);
    const otpFound = await db.query('SELECT * FROM otps WHERE user_id = ? AND type = ?', [userId, type])
    if (otpFound.length != 0) {
        await db.query(`UPDATE otps SET otp = ? ,expired_at = ? WHERE  user_id = ? AND type = ?`, [otp, expiredAt, userId, type])
    } else await db.query(`INSERT INTO otps (user_id, type, otp, expired_at) VALUES(?,?,?,?)`, [userId, type, otp, expiredAt]);

    return otp;
};
module.exports = OTP;
