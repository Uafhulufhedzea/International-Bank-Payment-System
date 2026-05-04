import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        idNumber: '',
        accountNumber: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:5000/api/register', formData);
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.error || "Registration error");
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2>Customer Registration</h2>
            <form onSubmit={handleRegister}>
                <input name="username" placeholder="Username" onChange={handleChange} required /><br/><br/>
                <input name="fullName" placeholder="Full Name" onChange={handleChange} required /><br/><br/>
                <input name="idNumber" placeholder="ID Number" onChange={handleChange} required /><br/><br/>
                <input name="accountNumber" placeholder="Your Account Number" onChange={handleChange} required /><br/><br/>
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br/><br/>
                <button type="submit">Secure Register</button>
            </form>
            {message && <p><b>Status:</b> {message}</p>}
        </div>
    );
};

export default Register;
