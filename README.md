# International Bank Payment System

## Overview
A secure international payment system built for an internal bank development team. Customers can register, log in, and make international payments via SWIFT. Employees can verify and forward transactions to SWIFT through a dedicated portal.

## Project Structure
```
bank-payment-system/
├── backend/
│   ├── server.js              # Express API with SSL, Helmet, Rate Limiting
│   ├── middleware/
│   │   └── validator.js       # RegEx input whitelisting
│   └── models/
│       ├── user.js            # In-memory user store
│       └── transaction.js     # In-memory transaction store
├── frontend/
│   └── src/
│       ├── App.js             # Main app with authentication flow
│       └── components/
│           ├── register.js    # Customer registration form
│           ├── login.js       # Customer login form
│           ├── payment.js     # International payment form
│           └── portal.js      # Employee verification portal
```

## Security Requirements Implemented

### 1. Password Security — Hashing and Salting
- Passwords are hashed using **bcrypt** with a salt factor of 10.
- Plain-text passwords are never stored — only the hash is saved.

### 2. Input Whitelisting — RegEx Patterns
- **Username:** Alphanumeric only, 3–20 characters (`/^[a-zA-Z0-9]{3,20}$/`)
- **Full Name:** Letters and spaces only (`/^[a-zA-Z\s]{2,50}$/`)
- **ID Number / Account Number:** Digits only (`/^\d+$/`)
- **SWIFT Code:** Standard 8 or 11 character format (`/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/`)
- Validation is enforced on both the frontend and backend.

### 3. SSL — All Traffic Served Over HTTPS
- The backend runs on HTTPS using a self-signed SSL certificate (`key.pem`, `cert.pem`).
- All API calls from the frontend use `https://localhost:5000`.

### 4. Protection Against Attacks
- **Helmet.js** — Sets secure HTTP headers to protect against XSS, clickjacking, MIME sniffing, etc.
- **Rate Limiting** — Limits each IP to 100 requests per 15 minutes to prevent brute-force attacks.
- **CORS** — Enabled to control cross-origin access.
- **Input Validation** — All user input is whitelisted via RegEx to prevent SQL injection and XSS.

## How to Run

### Backend
```bash
cd backend
npm install
node server.js
```
The server starts at `https://localhost:5000`.

### Frontend
```bash
cd frontend
npm install
npm start
```
The app opens at `http://localhost:3000`.

## Customer Flow
1. **Register** — Provide username, full name, ID number, account number, and password.
2. **Login** — Enter username, account number, and password.
3. **Make Payment** — Enter amount, currency, recipient account, and SWIFT code.
4. **Logout** — End session.

## Employee Portal
- Displays all pending transactions in a table.
- Employees can verify payee account info and SWIFT codes.
- Click "Submit to SWIFT" to forward a verified transaction.

## How to Test the App

### Prerequisites
- Node.js installed
- SSL certificates generated (run in backend folder):
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### Step 1: Start the Backend
```bash
cd backend
npm install
node server.js
```
You should see: `Secure Server running at https://localhost:5000`

### Step 2: Start the Frontend
```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`. If the browser warns about the SSL certificate, click "Advanced" then "Proceed to localhost" (this is because it is a self-signed certificate for development).

### Step 3: Test Registration
- Fill in: Username (`studentTest`), Full Name (`John Doe`), ID Number (`0012345678`), Account Number (`987654321`), Password (`MyPassword123`)
- Click "Secure Register" — you should see "User registered securely!"
- Check the backend terminal — the password is displayed as a hash, not plain text

### Step 4: Test Input Validation (RegEx)
Try registering with invalid inputs:
- Username: `hacker<script>` — should be rejected with "Invalid Username"
- Full Name: `John123` — should be rejected with "Invalid Full Name"
- ID Number: `abc` — should be rejected with "ID must be numbers only"

### Step 5: Test Login
- Click "Login"
- Enter: Username (`studentTest`), Account Number (`987654321`), Password (`MyPassword123`)
- You should see "Login successful!" and be taken to the payment page

### Step 6: Test Payment with SWIFT Code Validation
- Enter Amount: `500`, Currency: `ZAR`, Recipient Account: `1234567890`, SWIFT Code: `SBICIMDX`
- Click "Submit Payment" — should show "Payment submitted for verification!"
- Try an invalid SWIFT code: `HACK123` — should be rejected with "Invalid SWIFT Code format"

### Step 7: Test Employee Portal
- Scroll down to the Employee Verification Portal
- Click "Refresh List" — your payment should appear in the table
- Click "Submit to SWIFT" next to the transaction

### Step 8: Test Logout
- Click "Logout" — you should return to the Register/Login screen
- The payment form should no longer be accessible

## DevSecOps Pipeline
- **Pre-commit Hook (Husky):** Runs ESLint security scan before every commit locally
- **GitHub Actions CI:** Runs on every push to `main` — performs ESLint security scanning and npm dependency auditing on both backend and frontend
- View pipeline results in the GitHub repository **Actions** tab
