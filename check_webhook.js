const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('DATABASE ERROR:', error);
    } else {
      console.log('RECENT MEMBERS:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
}

run();
