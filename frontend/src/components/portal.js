import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Portal = () => {
    const [payments, setPayments] = useState([]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('https://localhost:5000/api/transactions');
            setPayments(response.data);
        } catch (error) {
            console.error("Error fetching transactions");
        }
    };

    // Refresh the list every time the component loads
    useEffect(() => {
        fetchPayments();
    }, []);

    const handleSubmitToSwift = (index) => {
        alert(`Transaction ${index + 1} has been securely submitted to SWIFT!`);
        // In a real app, you would update the status in the backend here
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f4f4', marginTop: '20px' }}>
            <h2>Employee Verification Portal</h2>
            <button onClick={fetchPayments}>Refresh List</button>
            <table border="1" style={{ width: '100%', marginTop: '20px', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>Amount</th>
                        <th>Payee Account</th>
                        <th>SWIFT Code</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p, index) => (
                        <tr key={index}>
                            <td>{p.amount} {p.currency}</td>
                            <td>{p.payeeAccount}</td>
                            <td>{p.swiftCode}</td>
                            <td>
                                <button onClick={() => handleSubmitToSwift(index)}>
                                    Submit to SWIFT
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Portal;
