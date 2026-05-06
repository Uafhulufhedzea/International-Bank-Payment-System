

// Stores payment transactions in a secured Azure SQL database.
// protecting against SQL Injection attacks.
//   All queries use parameterized inputs (.input()) instead of
//   string concatenation, preventing SQL injection attacks.

const { getConnection, sql } = require('../config/db');

const Transaction = {
    // Create a new transaction in the secured database
    // protecting against attacks: Parameterized query prevents SQL injection
    create: async (amount, currency, provider, payeeAccount, swiftCode) => {
        const pool = await getConnection();
        await pool.request()
            .input('amount', sql.Decimal(18, 2), amount)
            .input('currency', sql.NVarChar, currency)
            .input('provider', sql.NVarChar, provider)
            .input('payeeAccount', sql.NVarChar, payeeAccount)
            .input('swiftCode', sql.NVarChar, swiftCode)
            .query(`INSERT INTO Transactions (amount, currency, provider, payeeAccount, swiftCode, status) 
                    VALUES (@amount, @currency, @provider, @payeeAccount, @swiftCode, 'Pending')`);
    },

    // Get all transactions (for employee portal)
    // protecting against attacks: Parameterized query prevents SQL injection
    getAll: async () => {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Transactions ORDER BY createdAt DESC');
        return result.recordset;
    }
};

module.exports = Transaction;
