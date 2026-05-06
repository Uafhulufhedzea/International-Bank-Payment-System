
// Creates the Users and Transactions tables if they don't exist.

const { getConnection } = require('./db');

const initializeDatabase = async () => {
    try {
        const pool = await getConnection();

        // Create Users table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                username NVARCHAR(20) NOT NULL UNIQUE,
                fullName NVARCHAR(50) NOT NULL,
                idNumber NVARCHAR(13) NOT NULL,
                accountNumber NVARCHAR(12) NOT NULL,
                password NVARCHAR(255) NOT NULL,
                createdAt DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("Users table ready.");

        // Create Transactions table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
            CREATE TABLE Transactions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                amount DECIMAL(18,2) NOT NULL,
                currency NVARCHAR(3) NOT NULL,
                provider NVARCHAR(30) NOT NULL,
                payeeAccount NVARCHAR(34) NOT NULL,
                swiftCode NVARCHAR(11) NOT NULL,
                status NVARCHAR(20) DEFAULT 'Pending',
                createdAt DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("Transactions table ready.");

        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Database Initialization Error:", error);
        throw error;
    }
};

module.exports = { initializeDatabase };
