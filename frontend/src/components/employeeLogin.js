import React, { useState } from 'react';
import axios from 'axios';

// Employee Login - Pre-registered bank staff authenticate here.
// No registration is available for employees (they are seeded in the database).

const EmployeeLogin = ({ onEmployeeLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        // Input whitelisting: RegEx patterns
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            setMessage("Invalid username format.");
            return;
        }

        // Securing data in transit with SSL
        // Employee credentials sent over HTTPS to prevent interception.
        try {
            const response = await axios.post('https://localhost:5000/api/employee/login', {
                username, password
            });
            setMessage(response.data.message);
            onEmployeeLogin(response.data.username);
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed");
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2>Bank Employee Login</h2>
            <p style={{ color: '#666', fontStyle: 'italic' }}>
                Employees are pre-registered. No registration is available.
            </p>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Employee Username" onChange={(e) => setUsername(e.target.value)} required /><br/><br/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
                <button type="submit">Login</button>
            </form>
            {message && <p><b>Status:</b> {message}</p>}
        </div>
    );
};

export default EmployeeLogin;
