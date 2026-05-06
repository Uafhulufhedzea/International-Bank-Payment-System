
// using a secure database (azure sql database)
// securing data in transit with SSL
//   - encrypt: true forces all database traffic over TLS/SSL
//   - trustServerCertificate: false validates the Azure SSL cert

// PROTECTING AGAINST ATTACKS:
//   - Credentials stored in .env (not hardcoded in source code)
//   - Environment variables prevent credential leakage

require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,               // securing data in transit: encrypts DB connection with SSL/TLS
        trustServerCertificate: false // Validates Azure's SSL certificate to prevent MITM attacks
    }
};

let pool;

const getConnection = async () => {
    if (pool) return pool;
    try {
        pool = await sql.connect(dbConfig);
        console.log("Connected to Azure SQL Database securely.");
        return pool;
    } catch (error) {
        console.error("Database Connection Error:", error);
        throw error;
    }
};

module.exports = { getConnection, sql };
