const db = require('../db');
const bcrypt = require('bcryptjs');

const Token = {};

// Initialize table if not exists
Token.init = async () => {
    const query = `
     CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    device_id  VARCHAR(255) NOT NULL,
    type ENUM('refresh', 'reset_password') NOT NULL,
    expires DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ,
    INDEX(token)
    ); `
        ;

    await db.query(query);
};

Token.findToken = async (user_id) => {
    const tokenQuery = 'SELECT * FROM tokens WHERE user_id =?'
    const [row] = await db.query(tokenQuery, [user_id])
    return row
}
module.exports = Token;
