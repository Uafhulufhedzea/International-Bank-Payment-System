import React, { useState } from 'react';
import axios from 'axios';

// Unified login for both customers and pre-registered bank employees.
// A dropdown lets the user select their role before logging in.

const Login = ({ onLogin, onEmployeeLogin }) => {
    const [role, setRole] = useState('customer');
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
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

        if (role === 'customer') {
            const accountRegex = /^\d{6,12}$/;
            if (!accountRegex.test(accountNumber)) {
                setMessage("Invalid account number format.");
                return;
            }

            // Securing data in transit with SSL
            try {
                const response = await axios.post('https://localhost:5000/api/login', {
                    username, accountNumber, password
                });
                setMessage(response.data.message);
                onLogin(response.data.username);
            } catch (error) {
                setMessage(error.response?.data?.error || "Login failed");
            }
        } else {
            // Employee login - pre-registered staff, no registration available
            try {
                const response = await axios.post('https://localhost:5000/api/employee/login', {
                    username, password
                });
                setMessage(response.data.message);
                onEmployeeLogin(response.data.username);
            } catch (error) {
                setMessage(error.response?.data?.error || "Login failed");
            }
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>I am a: </label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '6px', marginBottom: '15px' }}>
                    <option value="customer">Customer</option>
                    <option value="employee">Bank Employee</option>
                </select><br/><br/>

                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /><br/><br/>

                {role === 'customer' && (
                    <>
                        <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /><br/><br/>
                    </>
                )}

                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /><br/><br/>

                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
            </form>

            {role === 'employee' && (
                <p style={{ marginTop: '15px', color: '#666', fontSize: '13px', fontStyle: 'italic' }}>
                    Bank employees are pre-registered on the system. Contact your administrator if you do not have credentials.
                </p>
            )}

            {message && <p><b>Status:</b> {message}</p>}
        </div>
    );
};

export default Login;
