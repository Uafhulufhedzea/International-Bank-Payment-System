import React, { useState } from 'react';
import axios from 'axios';


// Allows customers to make international payments.
// Customer enters amount, currency, chooses a provider,
// enters payee account info and SWIFT code, then clicks "Pay Now".

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [provider, setProvider] = useState('SWIFT');
    const [payeeAccount, setPayeeAccount] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [status, setStatus] = useState('');

    const handlePayment = async (e) => {
        e.preventDefault();
        
        
        // input whitelisting: RegEx patterns
        // Client-side validation ensures all payment fields are safe
        // before being sent to the server.
       
        const amountRegex = /^\d+(\.\d{1,2})?$/;
        const accountRegex = /^[a-zA-Z0-9]{5,34}$/;
        const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

        if (!amountRegex.test(amount)) {
            setStatus("Invalid amount format.");
            return;
        }
        if (!accountRegex.test(payeeAccount)) {
            setStatus("Invalid payee account format (5-34 alphanumeric characters).");
            return;
        }
        if (!swiftRegex.test(swiftCode)) {
            setStatus("Invalid SWIFT Code format.");
            return;
        }

      
        // Securing data in transit with SSL
        // All API calls use HTTPS to encrypt payment data in transit.
     
        try {
            const response = await axios.post('https://localhost:5000/api/pay', {
                amount, currency, provider, payeeAccount, swiftCode
            });
            setStatus(response.data.message);
        } catch (error) {
            setStatus(error.response?.data?.error || "Payment failed. Please check details.");
        }
    };

    return (
        <div style={{ padding: '40px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h2>Make an International Payment</h2>
            <form onSubmit={handlePayment}>
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} required /><br/><br/>
                
                {/* Currency selection as per scenario */}
                <label>Currency: </label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="ZAR">ZAR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                </select><br/><br/>

            
                <label>Provider: </label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                    <option value="SWIFT">SWIFT</option>
                </select><br/><br/>

                <input type="text" placeholder="Payee Account Number" onChange={(e) => setPayeeAccount(e.target.value)} required /><br/><br/>
                <input type="text" placeholder="SWIFT Code (e.g. FIABORWAXXX)" onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} required /><br/><br/>
                
                
                <button type="submit">Pay Now</button>
            </form>
            {status && <p><b>Status:</b> {status}</p>}
        </div>
    );
};

export default Payment;
