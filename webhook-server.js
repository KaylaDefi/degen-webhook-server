const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// This makes sure you can receive JSON data
app.use(express.json());

// This is the webhook endpoint Alchemy will POST to
app.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook received!');
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body.event;

  try {
    const logs = event?.data?.block?.logs;

    if (logs && logs.length > 0) {
      for (const log of logs) {
        const { transaction, account, topics } = log;

        const tx_hash = transaction.hash;
        const from_addr = transaction.from?.address;
        const to_addr = transaction.to?.address;
        const timestamp = new Date();

        const { error } = await supabase
          .from('degen_transfers') // make sure this is your actual table name
          .insert({
            tx_hash,
            from_addr,
            to_addr,
            timestamp,
            raw_json: log,
          });

        if (error) {
          console.error(`❌ Failed to insert tx ${tx_hash}:`, error);
        } else {
          console.log(`✅ Stored tx ${tx_hash}`);
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error handling webhook:', err);
    res.sendStatus(500);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}/webhook`);
});
