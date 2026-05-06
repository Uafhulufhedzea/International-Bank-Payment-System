# International Bank Payment System

## Overview
A secure international payment system built with **React** (frontend) and **Express.js** (backend API). Customers can register, log in, and make international payments via SWIFT. Employees can verify and forward transactions to SWIFT through a dedicated portal. All data is stored in a **secured Azure SQL database**.

This project was developed for **APDS7311 — Task 2** and meets all marking criteria for password security, input whitelisting, SSL, attack protection, and DevSecOps.

## Project Structure
```
bank-payment-system/
├── .github/workflows/
│   └── devsecops.yml              # DevSecOps CI/CD pipeline (GitHub Actions)
├── backend/
│   ├── server.js                  # Express API with HTTPS, Helmet, Rate Limiting
│   ├── config/
│   │   ├── db.js                  # Azure SQL database connection (encrypted)
│   │   └── init.js                # Database table initialization
│   ├── middleware/
│   │   └── validator.js           # Server-side RegEx input whitelisting
│   ├── models/
│   │   ├── User.js                # User model (parameterized SQL queries)
│   │   └── transaction.js         # Transaction model (parameterized SQL queries)
│   ├── eslint.config.js           # ESLint security plugin configuration
│   ├── .husky/pre-commit          # Pre-commit hook: runs ESLint before each commit
│   └── .env                       # Database credentials (NOT committed to Git)
├── frontend/
│   └── src/
│       ├── App.js                 # Main app with authentication flow
│       └── components/
│           ├── register.js        # Customer registration form
│           ├── login.js           # Customer login form
│           ├── payment.js         # International payment form (Pay Now)
│           └── portal.js          # Employee verification portal
└── .gitignore                     # Excludes .env, *.pem, node_modules
```

---

## Marking Criteria Implementation

### 1. Password Security [10 Marks]
- Passwords are **hashed and salted** using **bcrypt** with a salt factor of 10.
- `bcrypt.genSalt()` generates a unique random salt for each password.
- `bcrypt.hash()` produces a one-way hash — the original password is **NEVER stored**.
- `bcrypt.compare()` verifies passwords without exposing the hash.
- **Files:** `backend/server.js` (register and login endpoints)

### 2. Input Whitelisting [10 Marks]
All input is validated using **strict RegEx whitelist patterns** on both the client and server side:
- **Username:** `/^[a-zA-Z0-9]{3,20}$/` — alphanumeric only, 3–20 characters
- **Full Name:** `/^[a-zA-Z\s]{2,50}$/` — letters and spaces only
- **ID Number:** `/^\d{6,13}$/` — digits only, 6–13 characters (SA ID = 13 digits)
- **Account Number:** `/^\d{6,12}$/` — digits only, 6–12 characters
- **Amount:** `/^\d+(\.\d{1,2})?$/` — positive number with up to 2 decimal places
- **Currency:** `/^[A-Z]{3}$/` — ISO 4217 format
- **SWIFT Code:** `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/` — standard 8 or 11 character SWIFT/BIC
- **Files:** `backend/middleware/validator.js`, `backend/server.js`, `frontend/src/components/register.js`, `login.js`, `payment.js`

### 3. Securing Data in Transit with SSL [20 Marks]
- The backend runs exclusively on **HTTPS** using SSL certificates (`key.pem`, `cert.pem`).
- All frontend API calls use `https://localhost:5000`.
- The Azure SQL database connection uses `encrypt: true` (TLS encryption).
- **Files:** `backend/server.js` (HTTPS server), `backend/config/db.js` (encrypted DB connection)

### 4. Protecting Against Attacks [30 Marks]
| Protection | Tool/Method | What It Prevents |
|---|---|---|
| HTTP Security Headers | **Helmet.js** | XSS, clickjacking, MIME sniffing |
| Rate Limiting | **express-rate-limit** | Brute-force, DDoS attacks |
| CORS | **cors** middleware | Unauthorized cross-origin requests |
| SQL Injection | **Parameterized queries** (.input()) | SQL injection attacks |
| Password Attacks | **bcrypt** hashing | Rainbow table attacks, credential theft |
| Input Validation | **RegEx whitelisting** | XSS, injection attacks |
| Credential Protection | **.env** environment variables | Credential leakage in source code |
- **Files:** `backend/server.js`, `backend/models/User.js`, `backend/models/transaction.js`, `backend/config/db.js`

### 5. DevSecOps Pipeline [10 Marks]
- **GitHub Actions CI/CD:** Triggered on every push/PR to `main` branch.
- **ESLint + eslint-plugin-security:** Scans code for security vulnerabilities (eval, injection, timing attacks).
- **npm audit:** Checks both backend and frontend dependencies for known vulnerabilities.
- **Husky pre-commit hook:** Runs ESLint security scan locally before every commit.
- **Files:** `.github/workflows/devsecops.yml`, `backend/eslint.config.js`, `backend/.husky/pre-commit`
- View pipeline results in the GitHub repository **Actions** tab.

---

## How to Run (Setup Guide)

### Prerequisites
- **Node.js** v18+ installed
- **Azure SQL Database** (or any MSSQL instance)
- **OpenSSL** (for generating SSL certificates)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Uafhulufhedzea/International-Bank-Payment-System.git
cd International-Bank-Payment-System
```

### Step 2: Generate SSL Certificates
```bash
cd backend
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### Step 3: Configure Database Connection
Create a `.env` file in the `backend/` folder:
```env
DB_SERVER=your-server.database.windows.net
DB_DATABASE=BankPayment
DB_USER=your-username
DB_PASSWORD=your-password
DB_PORT=1433
```
> **Note:** You must also add your IP address to the Azure SQL Server firewall rules (Azure Portal → SQL Server → Networking → Add client IP).

### Step 4: Start the Backend
```bash
cd backend
npm install
node server.js
```
You should see:
```
Connected to Azure SQL Database securely.
Users table ready.
Transactions table ready.
Database initialized successfully.
Secure HTTPS Server running at https://localhost:5000
```

### Step 5: Start the Frontend
```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`.

> **SSL Warning:** The browser will warn about the self-signed certificate. Click **Advanced** → **Proceed to localhost** to continue. First visit `https://localhost:5000` directly in the browser and accept the certificate there too, so API calls work.

---

## Customer Flow
1. **Register** — Provide username, full name, ID number, account number, and password.
2. **Login** — Enter username, account number, and password.
3. **Make Payment** — Enter amount, select currency, choose provider (SWIFT), enter payee account and SWIFT code, click **Pay Now**.
4. **Logout** — End session.

## Employee Portal
- Displays all pending transactions from the database in a table.
- Employees can verify payee account info and SWIFT codes.
- Click **Submit to SWIFT** to forward a verified transaction.

---

## Testing Guide

### Test Registration
- Fill in: Username (`testuser`), Full Name (`John Doe`), ID Number (`9901015800086`), Account Number (`123456789`), Password (`Test1234`)
- Click **Register** — you should see "User registered successfully!"
- Check the backend terminal — the password is displayed as a **hash**, not plain text.

### Test Input Validation (RegEx Whitelisting)
Try registering with invalid inputs:
- Username: `hacker<script>` — rejected: "Username must be 3-20 alphanumeric characters"
- Full Name: `John123` — rejected: "Full name must contain only letters and spaces"
- ID Number: `abc` — rejected: "ID number must be 6-13 digits"

### Test Login
- Enter: Username (`testuser`), Account Number (`123456789`), Password (`Test1234`)
- You should see "Login successful!" and be redirected to the payment page.

### Test Payment with SWIFT Code Validation
- Enter Amount: `500`, Currency: `USD`, Payee Account: `DE89370400440532013000`, SWIFT Code: `COBADEFFXXX`
- Click **Pay Now** — should show "Payment submitted for verification!"
- Try an invalid SWIFT code: `HACK123` — rejected: "Invalid SWIFT Code format"

### Test Employee Portal
- Scroll down to the Employee Verification Portal.
- Click **Refresh List** — your payment should appear in the table.
- Click **Submit to SWIFT** next to the transaction.

### Verify Data in Database
You can verify data is stored in Azure SQL by checking the database via Azure Portal → BankPayment → Query editor, or by running:
```bash
cd backend
node -e "require('dotenv').config(); const sql=require('mssql'); sql.connect({server:process.env.DB_SERVER,database:process.env.DB_DATABASE,user:process.env.DB_USER,password:process.env.DB_PASSWORD,port:1433,options:{encrypt:true,trustServerCertificate:false}}).then(async p=>{const u=await p.request().query('SELECT id,username,fullName,accountNumber FROM Users');console.table(u.recordset);const t=await p.request().query('SELECT * FROM Transactions');console.table(t.recordset);sql.close()})"
```

---

## Can Someone Clone and Run This Project?

**Yes, but they need to set up 3 things first:**

1. **SSL Certificates** — Run the `openssl` command in Step 2 to generate `key.pem` and `cert.pem` (these are excluded from Git via `.gitignore` for security).

2. **Azure SQL Database** — Create their own Azure SQL database and configure the `.env` file with their credentials (the `.env` file is excluded from Git to protect credentials).

3. **Firewall Rule** — Add their IP to the Azure SQL Server firewall rules.

All three exclusions (`.env`, `*.pem`) are **intentional security practices** — credentials and certificates should never be committed to source control.
