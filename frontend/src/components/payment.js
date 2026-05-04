import React, { useState } from 'react';
import axios from 'axios';

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [provider, setProvider] = useState('SWIFT');
    const [payeeAccount, setPayeeAccount] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [status, setStatus] = useState('');

    const handlePayment = async (e) => {
        e.preventDefault();
        
        const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        if (!swiftRegex.test(swiftCode)) {
            setStatus("Invalid SWIFT Code format.");
            return;
        }

        try {
            const response = await axios.post('https://localhost:5000/api/pay', {
                amount, currency, provider, payeeAccount, swiftCode
            });
            setStatus(response.data.message);
        } catch (error) {
            setStatus("Payment failed. Please check details.");
        }
    };

    return (
        <div style={{ padding: '40px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h2>Make a Payment</h2>
            <form onSubmit={handlePayment}>
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} required /><br/><br/>
                <select onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="ZAR">ZAR</option>
                    <option value="EUR">EUR</option>
                </select><br/><br/>
                <input type="text" placeholder="Recipient Account" onChange={(e) => setPayeeAccount(e.target.value)} required /><br/><br/>
                <input type="text" placeholder="SWIFT Code" onChange={(e) => setSwiftCode(e.target.value)} required /><br/><br/>
                <button type="submit">Submit Payment</button>
            </form>
            {status && <p><b>Status:</b> {status}</p>}
        </div>
    );
};

export default Payment;
