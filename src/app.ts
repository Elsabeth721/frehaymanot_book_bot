import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import express from 'express';
import { startBot } from './service/botService';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const botToken = process.env.BOT_TOKEN;

if (!supabaseUrl || !supabaseKey || !botToken) {
    throw new Error('Supabase URL, Key, and BOT_TOKEN are required. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully.', supabase);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

try {
    startBot(supabase);
    console.log('Bot started successfully.');
} catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
}