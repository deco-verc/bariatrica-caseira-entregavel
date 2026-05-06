const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function checkLastPayload() {
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL; // Verify it has the correct 20-char url
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('DATABASE ERROR:', error);
    } else {
      console.log('LAST PAYLOAD:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
}

checkLastPayload();
