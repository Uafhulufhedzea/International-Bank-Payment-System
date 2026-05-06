import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================================
// EMPLOYEE VERIFICATION PORTAL
// Scenario: Bank employees view pending transactions, verify
// the payee account and SWIFT code, click "Verified" to confirm,
// then click "Submit to SWIFT" to forward the transaction.
// ============================================================
const Portal = () => {
    const [payments, setPayments] = useState([]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('https://localhost:5000/api/transactions');
            // Track verified status locally for each transaction
            const paymentsWithStatus = response.data.map(p => ({
                ...p,
                verified: false
            }));
            setPayments(paymentsWithStatus);
        } catch (error) {
            console.error("Error fetching transactions");
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Scenario: Employee clicks "Verified" to confirm account and SWIFT code
    const handleVerify = (index) => {
        const updated = [...payments];
        updated[index].verified = true;
        setPayments(updated);
    };

    // Scenario: Employee clicks "Submit to SWIFT" after verification
    const handleSubmitToSwift = (index) => {
        if (!payments[index].verified) {
            alert("Please verify the transaction before submitting to SWIFT.");
            return;
        }
        alert(`Transaction ${index + 1} has been securely submitted to SWIFT!`);
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
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p, index) => (
                        <tr key={index}>
                            <td>{p.amount} {p.currency}</td>
                            <td>{p.payeeAccount}</td>
                            <td>{p.swiftCode}</td>
                            <td>{p.verified ? '✅ Verified' : '⏳ Pending'}</td>
                            <td>
                                {!p.verified ? (
                                    <button onClick={() => handleVerify(index)}
                                        style={{ backgroundColor: '#28a745', color: 'white', marginRight: '5px' }}>
                                        Verified
                                    </button>
                                ) : (
                                    <button onClick={() => handleSubmitToSwift(index)}
                                        style={{ backgroundColor: '#007bff', color: 'white' }}>
                                        Submit to SWIFT
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Portal;
