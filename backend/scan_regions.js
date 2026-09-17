const { Client } = require('pg');
const projectRef = 'fswpminwptllwjeqzunl';
const password = encodeURIComponent('@Ynumber12345@');

const regions = [
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'eu-south-1', 'eu-south-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-south-1', 'ap-northeast-1', 'ap-northeast-2',
  'me-central-1'
];

async function checkRegion(r) {
  const url = `postgresql://postgres.${projectRef}:${password}@aws-0-${r}.pooler.supabase.com:6543/postgres`;
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`[SUCCESS] Region found: ${r}`);
    await client.end();
    return true;
  } catch (e) {
    if (e.message.includes('tenant') || e.message.includes('password') || e.message.includes('user')) {
      console.log(`[AUTH/TENANT ERROR] ${r}: ${e.message.split('\n')[0]}`);
    } else {
      console.log(`[NET ERROR] ${r}: ${e.message.split('\n')[0]}`);
    }
    return false;
  }
}

async function run() {
  for (const r of regions) {
    const found = await checkRegion(r);
    if (found) break;
  }
}
run();