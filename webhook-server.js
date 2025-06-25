const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

require('dotenv').config(); 

// This makes sure you can receive JSON data
app.use(express.json());

// This is the webhook endpoint Alchemy will POST to
app.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook received!');
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body.event;

  try {
    if (event?.data?.block?.transactions) {
      for (const tx of event.data.block.transactions) {
        const { hash, from, to, value } = tx;

        const { error } = await supabase
        .from('degen_transfers')
        .insert({
          tx_hash: hash,
          from_addr: from,
          to_addr: to,
          value: value,
          timestamp: new Date(),
          raw_json: tx,
        });

        if (error) {
          console.error(`❌ Failed to insert tx ${hash}:`, error);
        } else {
          console.log(`✅ Stored tx ${hash}`);
        }
      }
    }

    res.sendStatus(200); // Let Alchemy know we received it
  } catch (err) {
    console.error('❌ Error handling webhook:', err);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}/webhook`);
});
