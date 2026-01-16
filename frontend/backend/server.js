require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

// --- HELPER FUNCTIONS ---

const getTimestamp = () => {
    const date = new Date();
    return date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
};

const getAccessToken = async () => {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return response.data.access_token;
    } catch (error) {
        throw new Error("Failed to get M-Pesa Access Token");
    }
};

// --- ROUTES ---

// Health check for Render
app.get('/', (req, res) => res.send("🚀 Gaya Backend is Live and Ready!"));

// 1. INITIATE STK PUSH
app.post('/api/mpesa-stk', async (req, res) => {
    let { phone, amount, memberId } = req.body;
    
    // Clean phone number format
    let cleanPhone = phone.replace(/\D/g, ''); 
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);

    try {
        const token = await getAccessToken();
        const timestamp = getTimestamp();
        const password = Buffer.from(process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp).toString('base64');

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

        console.log("✅ STK Push Prompt Sent to:", cleanPhone);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("❌ STK Push Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "STK Push failed" });
    }
});

// 2. CALLBACK ROUTE (Safaricom calls this)
app.post('/api/mpesa-callback', (req, res) => {
    console.log("--- 🔔 Payment Callback Received ---");
    const callbackData = req.body.Body?.stkCallback;
    
    if (!callbackData) return res.status(400).send("No data");

    if (callbackData.ResultCode === 0) {
        const metadata = callbackData.CallbackMetadata.Item;
        const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber').Value;
        console.log(`✅ SUCCESS: Transaction ${receipt} confirmed.`);
        // Here is where you would normally update a database
    } else {
        console.log(`❌ FAILED/CANCELLED: ${callbackData.ResultDesc}`);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
});

const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));