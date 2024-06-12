const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 8080;
const externalHost = process.env.EXTERNAL_HOST || 'http://localhost:8080';
const contextPath = '/qr-code-service/v1';

// Middleware to parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle QR code generation via request body (POST request)
app.post(`${contextPath}/_generate`, async (req, res) => {
    const requestBody = req.body;
    const embeddedUrl = requestBody.QRCode.embeddedUrl;

    if (!embeddedUrl) {
        return res.status(400).send('embedded url is required');
    }

    try {
        const qrCodeImage = await QRCode.toBuffer(embeddedUrl, { type: 'png' });
        res.setHeader('Content-Type', 'image/png');
        res.send(qrCodeImage);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});

app.listen(port, () => {
    console.log(`Server running at ${externalHost}${contextPath}`);
});