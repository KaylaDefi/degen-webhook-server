const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// This is the webhook endpoint Alchemy will POST to
app.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook received!');
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body.event;

  try {
    const logs = event?.data?.block?.logs;

    if (logs && Array.isArray(logs)) {
      for (const log of logs) {
        const tx = log.transaction;

        if (!tx) {
          console.warn('⚠️ Skipped log with no transaction');
          continue;
        }

        const tx_hash = tx?.hash || null;
        const from_addr = tx?.from?.address || null;
        const to_addr = tx?.to?.address || null;
        const value = tx?.value || null;

        const { error } = await supabase
          .from('degen_transfers')
          .insert({
            tx_hash,
            from_addr,
            to_addr,
            value,
            timestamp: new Date(),
            raw_json: tx || null
          }, {
            onConflict: ['tx_hash'] 
          });

        if (error) {
          console.error(`❌ Failed to insert tx ${tx_hash}:`, error);
        } else {
          console.log(`✅ Stored tx ${hash}`);
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
