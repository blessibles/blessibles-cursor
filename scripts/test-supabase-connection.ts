import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Connection refused. Please check your Supabase URL.');
      } else if (error.message.includes('JWT')) {
        console.error('Invalid anon key. Please check your Supabase anon key.');
      }
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('Test query result:', data);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testConnection(); 