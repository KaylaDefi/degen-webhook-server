const express = require('express');
const app = express();
const port = 3000;

// This makes sure you can receive JSON data
app.use(express.json());

// This is the webhook endpoint Alchemy will POST to
app.post('/webhook', (req, res) => {
  console.log('🔔 Webhook received!');
  console.log(JSON.stringify(req.body, null, 2)); // Show the data sent by Alchemy
  res.sendStatus(200);   // Tell Alchemy we got it successfully
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}/webhook`);
});
