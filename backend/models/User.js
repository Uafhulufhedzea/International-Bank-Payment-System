

// password security: Passwords are hashed and salted with
// bcrypt before being stored in the database.
// protecting against attacks - SQL Injection Prevention:
// all queries use parameterized inputs (.input()) instead of
//  string concatenation, preventing SQL injection attacks.

const { getConnection, sql } = require('../config/db');

const User = {
    // Create a new user in the secured database
    // protecting against attacks: Parameterized query prevents SQL injection
    create: async (username, fullName, idNumber, accountNumber, hashedPassword) => {
        const pool = await getConnection();
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('fullName', sql.NVarChar, fullName)
            .input('idNumber', sql.NVarChar, idNumber)
            .input('accountNumber', sql.NVarChar, accountNumber)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`INSERT INTO Users (username, fullName, idNumber, accountNumber, password) 
                    VALUES (@username, @fullName, @idNumber, @accountNumber, @password)`);
    },

    // Find a user by username and account number
    // protecting against attacks: Parameterized query prevents SQL injection
    findByCredentials: async (username, accountNumber) => {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('accountNumber', sql.NVarChar, accountNumber)
            .query('SELECT * FROM Users WHERE username = @username AND accountNumber = @accountNumber');
        return result.recordset[0];
    }
};

module.exports = User;
