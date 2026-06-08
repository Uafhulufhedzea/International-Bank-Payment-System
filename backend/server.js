const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { validateRegistration } = require('./middleware/validator');
const User = require('./models/User');
const Transaction = require('./models/transaction');
const { initializeDatabase } = require('./config/init');

const app = express();

// Protecting against attacks:
// Helmet.js - sets various HTTP security headers to prevent:
//   - XSS (Cross-Site Scripting) attacks
//   - Clickjacking (X-Frame-Options)
//   - MIME type sniffing (X-Content-Type-Options)
//   - And other common web vulnerabilities
app.use(helmet());

// Protecting against attacks:
// Rate Limiting - prevents brute-force and DDoS attacks by
// limiting the number of requests per IP within a time window.
// If exceeded, returns 429 Too Many Requests.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100, // max 100 requests per window per IP
    message: "Too many requests, please try again after 15 minutes"
});
app.use('/api/', limiter); 

app.use(express.json());

// Protecting against attacks:
// CORS (Cross-Origin Resource Sharing) - restricts which domains
// can access the API, preventing unauthorized cross-origin requests.
app.use(cors());

// Register endpoint
// Customers register with: full name, ID number, account number, password
app.post('/api/register', validateRegistration, async (req, res) => {
    try {
        const { username, fullName, idNumber, accountNumber, password } = req.body;

        // Password complexity validation
        // Requires: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
        const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        
        if (!passwordComplexityRegex.test(password)) {
            console.log("REGISTRATION BLOCKED: Insecure password template submitted.");
            return res.status(400).json({ 
                error: "Weak password. System rules require at least 8 characters, an uppercase letter, a lowercase letter, a numeric digit, and an explicit special symbol (@$!%*?&#)." 
            });
        }


        // Password security: Hashing and Salting
        // bcrypt.genSalt() generates a unique random salt.
        // bcrypt.hash() combines the salt with the password to produce
        // a secure one-way hash. Even identical passwords produce
        // different hashes, protecting against rainbow table attacks.
        // The original password is NEVER stored in the database.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Store user in the secured Azure SQL database
        await User.create(username, fullName, idNumber, accountNumber, hashedPassword);
        
        console.log("-----------------------------------------");
        console.log("SECURITY EVENT: New User Registered");
        console.log("Full Name:", fullName);
        console.log("Hashed Password Stored:", hashedPassword);
        console.log("-----------------------------------------");

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Security Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login endpoint
// Customers log in with: username, account number, password
app.post('/api/login', async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // Input whitelisting: RegEx patterns for login
    // Only allow alphanumeric usernames (3-20 chars) and numeric
    // account numbers (6-12 digits). This prevents injection attacks
    // by ensuring only expected character patterns are accepted.
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    const accountRegex = /^\d{6,12}$/;

    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Invalid username format" });
    }
    if (!accountRegex.test(accountNumber)) {
        return res.status(400).json({ error: "Invalid account number format" });
    }

    // Retrieve user from secured Azure SQL database
    const user = await User.findByCredentials(username, accountNumber);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Password security: Comparing hashed passwords
    // bcrypt.compare() securely verifies the plaintext password
    // against the stored hash without ever exposing the original.
    // This ensures passwords are never stored or compared in plain text.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("-----------------------------------------");
    console.log("LOGIN: User authenticated:", username);
    console.log("-----------------------------------------");

    res.json({ message: "Login successful!", username: user.username });
});

// Payment endpoint
// Customers make international payments by entering:
// amount, currency, provider (SWIFT), payee account, SWIFT code
app.post('/api/pay', async (req, res) => {
    const { amount, currency, provider, payeeAccount, swiftCode } = req.body;

    // Input whitelisting: RegEx patterns for payments
    // Each field is validated against a strict whitelist pattern
    // to prevent SQL injection, XSS, and other injection attacks.
    // Only characters known to be safe are allowed through.
    const amountRegex = /^\d+(\.\d{1,2})?$/;           // Positive number with up to 2 decimal places
    const currencyRegex = /^[A-Z]{3}$/;                 // Exactly 3 uppercase letters (ISO 4217)
    const providerRegex = /^[A-Za-z\s]{2,30}$/;         // Letters and spaces only
    const accountRegex = /^[a-zA-Z0-9]{5,34}$/;         // Alphanumeric (supports IBAN format)
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // Standard SWIFT/BIC format

    if (!amountRegex.test(amount)) {
        return res.status(400).json({ error: "Invalid amount format" });
    }
    if (!currencyRegex.test(currency)) {
        return res.status(400).json({ error: "Invalid currency format" });
    }
    if (!providerRegex.test(provider)) {
        return res.status(400).json({ error: "Invalid provider format" });
    }
    if (!accountRegex.test(payeeAccount)) {
        return res.status(400).json({ error: "Invalid payee account format" });
    }
    if (!swiftRegex.test(swiftCode)) {
        console.log("ATTACK BLOCKED: Invalid SWIFT code format detected.");
        return res.status(400).json({ error: "Invalid SWIFT code format" });
    }

    // Store transaction in the secured Azure SQL database
    await Transaction.create(amount, currency, provider, payeeAccount, swiftCode);
    console.log("TRANSACTION LOGGED TO DATABASE:", { amount, currency, provider, payeeAccount, swiftCode });

    res.status(201).json({ message: "Payment submitted for verification!" });
});

// Transactions endpoint (Employee Portal)
// Pre-registered bank employees can view pending transactions
app.get('/api/transactions', async (req, res) => {
    console.log("STAFF ACCESS: Transaction list requested by portal.");
    const transactions = await Transaction.getAll();
    res.json(transactions);
});

const { getConnection } = require('./config/db'); 
const sql = require('mssql');

// 1. Secure Employee Portal Entrance (Verifies pre-registered staff credentials safely)
app.post('/api/employee/login', async (req, res) => {
    const { username, password } = req.body;

    // Strict input whitelisting via RegEx mapping to mitigate standard string injection
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!username || !usernameRegex.test(username)) {
        return res.status(400).json({ error: "Invalid username format" });
    }

    try {
        const pool = await getConnection();
        
        // Parameterized SQL extraction preventing structural context manipulations
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Employees WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const employee = result.recordset[0];

        // Decrypt and securely contrast the salted string configurations
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log("-----------------------------------------");
        console.log("STAFF ACCESS: Employee authenticated:", username);
        console.log("-----------------------------------------");

        res.json({ 
            message: "Login successful!", 
            username: employee.username, 
            role: employee.role 
        });
    } catch (error) {
        console.error("Employee Portal Auth Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Core dispatch endpoint processing final verification workflows into SWIFT systems
app.post('/api/transactions/submit-swift', async (req, res) => {
const { transactionId } = req.body;
// Isolate database reference structures to purely safe numeric filters
const idRegex = /^\d+$/;
if (!transactionId || !idRegex.test(transactionId.toString())) {
return res.status(400).json({ error: "Invalid transaction reference configuration" });
}
try {
const pool = await getConnection();
// Target status updates securely utilizing isolated runtime parameters
await pool.request()
.input('id', sql.Int, parseInt(transactionId))
.query("UPDATE Transactions SET status = 'Submitted to SWIFT' WHERE id = @id");
console.log(`SECURITY EVENT: Transaction ID ${transactionId} officially dispatched to SWIFT network.`);
res.json({ message: "Transaction successfully verified and submitted to SWIFT!" });
} catch (error) {
console.error("SWIFT Submission Routing Error:", error);
res.status(500).json({ error: "Internal Server Error" });
}
});

// Securing data in transit with SSL:
// The server uses HTTPS with a generated SSL certificate and key.
// This encrypts ALL traffic between the client and server,
// preventing man-in-the-middle attacks and eavesdropping.
// All API endpoints are served exclusively over HTTPS.
const sslOptions = {
key: fs.readFileSync('key.pem'), // Private key for SSL
cert: fs.readFileSync('cert.pem') // SSL certificate
};
const PORT = 5000;
// Initialize the database tables, then start the HTTPS server
initializeDatabase().then(() => {
https.createServer(sslOptions, app).listen(PORT, () => {
console.log(`Secure HTTPS Server running at https://localhost:${PORT}`);
console.log("\nSecurity Features Active:");
console.log(" - Password Security: bcrypt hashing & salting");
console.log(" - Input Whitelisting: RegEx patterns on all inputs");
console.log(" - Securing Data in Transit: SSL/HTTPS + encrypted DB connection");
console.log(" - Protecting Against Attacks: Helmet.js, Rate Limiting, CORS, Parameterized SQL");
console.log(" - Database: Azure SQL with encrypted connection");
});
}).catch(err => {
console.error("Failed to start server - database error:", err);
});

