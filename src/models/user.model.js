const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {};

// Initialize table if not exists
User.init = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      profileImage VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      isDeleted BOOLEAN DEFAULT false,
      isEmailVarified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
};

// find user by id
User.findById = async (id) => {
  const query = `SELCT * FROM users WHERE id = ?`
  const [row] = await db.query(query, [id])
  return row
}

// compare password
User.comparePassword = async (inputPassword, storedHashedPassword) => {
  return await bcrypt.compare(inputPassword, storedHashedPassword);

}

// Find a user by email
User.findByEmail = async (email) => {
  const query = `SELECT id, email, firstName, lastName, password, profileImage, role
               FROM users WHERE email = ? AND isDeleted = ?`;
  const rows = await db.query(query, [email, false]);
  return rows[0];
};

// Update user
User.update = async (id, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);

  const query = `
    UPDATE users SET ${fields} WHERE id = ?;
  `;
  await db.query(query, [...values, id]);
};

module.exports = User;
