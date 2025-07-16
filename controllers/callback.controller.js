const VERIFY_TOKEN = "my_custom_webhook_token_2025"; // Use the same token in Meta setup

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log("*********in verify webhook********",res);
  

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    console.warn("Webhook verification failed.");
    res.sendStatus(403);
  }
};

exports.receiveMessage = (req, res) => {
  const body = req.body;
  console.log("*********in receiveMessage webhook********",res);

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const msgBody = message.text?.body;
      console.log(`📥 Message from ${from}: ${msgBody}`);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
