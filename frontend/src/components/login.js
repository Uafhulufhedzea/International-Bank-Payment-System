import React, { useState } from 'react';
import axios from 'axios';


//Customers log in by providing their username, account number, and password.

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        // input whitelisting:  RegEx patterns
        // Client-side validation prevents malicious input from being sent to the server (defense in depth with server validation).
     
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        const accountRegex = /^\d{6,12}$/;

        if (!usernameRegex.test(username)) {
            setMessage("Invalid username format.");
            return;
        }
        if (!accountRegex.test(accountNumber)) {
            setMessage("Invalid account number format.");
            return;
        }

       
        // securing data in transit with SSL
        // Login credentials sent over HTTPS to prevent interception.
      
        try {
            const response = await axios.post('https://localhost:5000/api/login', {
                username, accountNumber, password
            });
            setMessage(response.data.message);
            onLogin(response.data.username);
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed");
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2>Customer Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required /><br/><br/>
                <input type="text" placeholder="Account Number" onChange={(e) => setAccountNumber(e.target.value)} required /><br/><br/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
                <button type="submit">Login</button>
            </form>
            {message && <p><b>Status:</b> {message}</p>}
        </div>
    );
};

export default Login;
