const fs = require('fs');
const path = require('path');

const VERIFY_TOKEN = "my_custom_webhook_token_2025"; // Use the same token in Meta setup

function logToFile(functionName, data) {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, 'webhook.log');
  const time = new Date().toISOString();
  const logEntry = `[${time}] [${functionName}] ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logFile, logEntry);
}

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  logToFile('verifyWebhook', { query: req.query, mode, token, challenge });
  console.log("*********in verify webhook********",res);
  

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    logToFile('verifyWebhook', { response: challenge });
    res.status(200).send(challenge);
  } else {
    logToFile('verifyWebhook', { response: 403 });
    console.warn("Webhook verification failed.");
    res.sendStatus(403);
  }
};

exports.receiveMessage = (req, res) => {
  const body = req.body;
  logToFile('receiveMessage', { body });
  console.log("*********in receiveMessage webhook********",res);

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const msgBody = message.text?.body;
      logToFile('receiveMessage', { from, msgBody });
    }

    logToFile('receiveMessage', { response: 200 });
    res.sendStatus(200);
  } else {
    logToFile('receiveMessage', { response: 404 });
    res.sendStatus(404);
  }
};
