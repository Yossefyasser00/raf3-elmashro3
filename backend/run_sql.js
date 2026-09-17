const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.fswpminwptllwjeqzunl:%40Ynumber12345%40@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    const sql = fs.readFileSync('supabase_schema.sql', 'utf8');
    await client.query(sql);
    console.log('SQL executed successfully!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}
run();