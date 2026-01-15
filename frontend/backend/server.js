require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
// We declare and use CORS only once here to prevent the "Identifier already declared" error.
app.use(cors()); 
app.use(express.json());

console.log("Check Key:", process.env.MPESA_CONSUMER_KEY ? "FOUND" : "MISSING");

// --- HELPER FUNCTIONS ---

// 1. Generate M-Pesa Timestamp (YYYYMMDDHHMMSS)
const getTimestamp = () => {
    const date = new Date();
    return date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
};

// 2. Get Access Token from Safaricom with Detailed Logging
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        console.error("❌ ERROR: MPESA_CONSUMER_KEY or SECRET is missing in .env file");
        throw new Error("Missing M-Pesa Credentials");
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        console.log("✅ Access Token Obtained Successfully");
        return response.data.access_token;
    } catch (error) {
        if (error.response) {
            console.error("❌ Safaricom Auth Error:", error.response.data);
        } else {
            console.error("❌ Network Error:", error.message);
        }
        throw new Error("Failed to get Access Token");
    }
};

// --- ROUTES ---

// Main STK Push Route
app.post('/api/mpesa-stk', async (req, res) => {
    let { phone, amount, memberId } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ message: "Phone and Amount are required" });
    }

    // Format phone: Change 07... or +254... to 2547...
    let cleanPhone = phone.replace(/\D/g, ''); 
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1);
    }

    try {
        console.log(`🚀 Initiating STK Push for ${cleanPhone}...`);
        
        const token = await getAccessToken();
        const timestamp = getTimestamp();
        
        const password = Buffer.from(
            process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
        ).toString('base64');

        const payload = {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(amount),
            PartyA: cleanPhone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: cleanPhone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: memberId || "GayaShop",
            TransactionDesc: "Payment for Accessories"
        };

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ STK Push Request Sent:", response.data);
        res.status(200).json(response.data);

    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("❌ STK Push Error:", errorData);
        res.status(500).json({ message: "STK Push failed", error: errorData });
    }
});

// Callback Route
app.post('/api/mpesa-callback', (req, res) => {
    console.log("--- 🔔 Payment Callback Received ---");
    const callbackData = req.body.Body?.stkCallback;
    
    if (!callbackData) {
        console.error("Invalid Callback Data received");
        return res.status(400).send("Invalid Data");
    }

    console.log("Result Message:", callbackData.ResultDesc);

    if (callbackData.ResultCode === 0) {
        const metadata = callbackData.CallbackMetadata.Item;
        const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
        console.log(`✅ SUCCESS: Transaction ${mpesaReceipt} confirmed.`);
    } else {
        console.log(`❌ FAILED/CANCELLED: Code ${callbackData.ResultCode}`);
    }

    res.status(200).send("OK");
});

// Port Handling
const PORT = process.env.PORT || 10000; 

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`-----------------------------------------`);
});