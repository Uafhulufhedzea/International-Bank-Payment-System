import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
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
