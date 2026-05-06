import React, { useState } from 'react';
import axios from 'axios';


//Customers register by providing their full name, ID number, account number, and password.

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

        // input whitelisting: RegEx patterns
        // Client-side validation ensures only safe, expected character
        // patterns are submitted before reaching the server.
        
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        const idRegex = /^\d{6,13}$/;
        const accountRegex = /^\d{6,12}$/;
        const passwordRegex = /^.{8,}$/;

        if (!usernameRegex.test(formData.username)) {
            setMessage("Username must be 3-20 alphanumeric characters.");
            return;
        }
        if (!nameRegex.test(formData.fullName)) {
            setMessage("Full name must contain only letters and spaces.");
            return;
        }
        if (!idRegex.test(formData.idNumber)) {
            setMessage("ID number must be 6-13 digits.");
            return;
        }
        if (!accountRegex.test(formData.accountNumber)) {
            setMessage("Account number must be 6-12 digits.");
            return;
        }
        if (!passwordRegex.test(formData.password)) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        
        // Securing data in transit with SSL 
        // API call uses HTTPS to encrypt registration data in transit.
        // Password is sent securely over SSL, then hashed and salted on the server side using bcrypt before database storage.
      
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
                <input name="accountNumber" placeholder="Account Number" onChange={handleChange} required /><br/><br/>
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br/><br/>
                <button type="submit">Register</button>
            </form>
            {message && <p><b>Status:</b> {message}</p>}
        </div>
    );
};

export default Register;
