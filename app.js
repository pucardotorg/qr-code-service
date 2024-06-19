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


    try {
        var starttime = new Date().getTime();
        let tenantId = req.query.tenantId;
        var headers = JSON.parse(JSON.stringify(req.headers));
        if (headers.tenantid) {
          headers['tenantId']=headers.tenantid;
        }
        logger.info("received generate qr code request");
        requestInfo = get(req.body, "RequestInfo");
        const embeddedUrl = requestBody.QRCode.embeddedUrl;
        var valid = validateRequest(req, res, key, tenantId, requestInfo);
        if (valid) {
            const qrCodeImage = await QRCode.toBuffer(embeddedUrl, { type: 'png' });
            res.setHeader('Content-Type', 'image/png');
            res.send(qrCodeImage);
        }
    } catch (error) {
        logger.error(error.stack || error);
        res.status(400);
        res.json({
          message: "some unknown error while creating: " + error.message,
        });
      }
});

const validateRequest = (req, res, embeddedUrl, tenantId, requestInfo) => {
  let errorMessage = "";
  if (embeddedUrl == undefined || embeddedUrl.trim() === "") {
    errorMessage += " embeddedUrl is missing,";
  }
  if (tenantId == undefined || tenantId.trim() === "") {
    errorMessage += " tenantId is missing,";
  }
  if (requestInfo == undefined) {
    errorMessage += " requestInfo is missing,";
  }
  if (requestInfo && requestInfo.userInfo == undefined) {
    errorMessage += " userInfo is missing,";
  }
  if (res && errorMessage !== "") {
    res.status(400);
    res.json({
      message: errorMessage,
      ResponseInfo: requestInfo,
    });
    return false;
  } else {
    return true;
  }
};


app.listen(port, () => {
    console.log(`Server running at ${externalHost}${contextPath}`);
});