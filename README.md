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
