/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const enumValues = require('../config/enumValues')
const adminSeeder = {
    run: async (connection) => {
        try {
            // Admin data
            const adminData = {
                email: enumValues.adminData.email,
                firstName: enumValues.adminData.firstName,
                lastName: enumValues.adminData.firstName,
                password: await bcrypt.hash(enumValues.adminData.password, 10),
                role: 'admin',
                isEmailVerified: true,
            };

            // Check if the admin user already exists
            const [rows] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [adminData.email]
            );

            // If the admin doesn't exist, insert them
            if (rows.length === 0) {
                await connection.execute(
                    `INSERT INTO users (email, firstName , lastName , password, role, isEmailVerified) VALUES (?, ?, ?,?,?, ?)`,
                    [
                        adminData.email,
                        adminData.firstName,
                        adminData.lastName,
                        adminData.password,
                        adminData.role,
                        adminData.isEmailVerified,
                    ]
                );
                console.log(`Admin user seeded successfully! : ${enumValues.adminData}`);
            } else {
                console.log('Admin user already exists!');
            }
        } catch (err) {
            console.error('Error seeding admin:', err.stack);
        }
    },
};

module.exports = adminSeeder;
