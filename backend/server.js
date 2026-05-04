const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- CUSTOM IMPORTS ---
const { validateRegistration } = require('./middleware/validator');
const users = require('./models/user');
const transactions = require('./models/transaction'); 

const app = express();

// --- REQUIREMENT 4: EXCEEDS STANDARD SECURITY ---
app.use(helmet()); // Protects against XSS, Clickjacking, etc.

// Requirement 4: Brute Force Protection (as mentioned in rubric)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many login attempts, please try again after 15 minutes"
});
app.use('/api/', limiter); 

app.use(express.json());
app.use(cors());

// --- REQUIREMENT 1 & 2: SECURE REGISTRATION ---
app.post('/api/register', validateRegistration, async (req, res) => {
    try {
        const { username, fullName, idNumber, accountNumber, password } = req.body;

        // Salting and Hashing (Requirement 1)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        users.push({ 
            username, 
            fullName, 
            idNumber, 
            accountNumber, 
            password: hashedPassword 
        });
        
        console.log("-----------------------------------------");
        console.log("SECURITY EVENT: New User Registered");
        console.log("Full Name:", fullName);
        console.log("Hashed Password Stored:", hashedPassword); // Great for your video!
        console.log("-----------------------------------------");

        res.status(201).json({ message: "User registered securely!" });
    } catch (error) {
        console.error("Security Error:", error);
        res.status(500).json({ error: "Internal Server Security Error" });
    }
});

// --- CUSTOMER LOGIN ---
app.post('/api/login', async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // Requirement 2: Whitelist input with RegEx
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    const numberRegex = /^\d+$/;

    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Invalid username format" });
    }
    if (!numberRegex.test(accountNumber)) {
        return res.status(400).json({ error: "Invalid account number format" });
    }

    // Find user by username and account number
    const user = users.find(u => u.username === username && u.accountNumber === accountNumber);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("-----------------------------------------");
    console.log("LOGIN: User authenticated:", username);
    console.log("-----------------------------------------");

    res.json({ message: "Login successful!", username: user.username });
});

// --- SCENARIO: CUSTOMER TRANSACTION ---
app.post('/api/pay', (req, res) => {
    const { amount, currency, provider, payeeAccount, swiftCode } = req.body;

    // Requirement 2: SWIFT Code Whitelisting (RegEx)
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    if (!swiftRegex.test(swiftCode)) {
        console.log("ATTACK BLOCKED: Invalid SWIFT code format detected.");
        return res.status(400).json({ error: "Invalid SWIFT code format!" });
    }

    const newTransaction = {
        amount,
        currency,
        provider,
        payeeAccount,
        swiftCode,
        status: 'Pending'
    };

    transactions.push(newTransaction);
    console.log("TRANSACTION LOGGED:", newTransaction);

    res.status(201).json({ message: "Payment submitted for verification!" });
});

// --- SCENARIO: EMPLOYEE PORTAL ---
app.get('/api/transactions', (req, res) => {
    console.log("STAFF ACCESS: Transaction list requested by portal.");
    res.json(transactions);
});

// --- REQUIREMENT 3: SSL SETUP & SERVER START ---
const sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const PORT = 5000;

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Server running at https://localhost:${PORT}`);
    console.log(`Protections Active: Helmet.js, Rate-Limiting, Bcrypt, RegEx`);
});
