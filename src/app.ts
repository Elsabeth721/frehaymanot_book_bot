import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { startBot } from './service/botService';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized successfully.', supabase);
startBot();